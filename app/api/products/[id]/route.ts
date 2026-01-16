import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/[id] - Get single product
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: {
                category: true,
                // Simplify inventoryLogs include for now to avoid relation errors
                inventoryLogs: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10,
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/products/[id] - Update product
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const body = await request.json();
        const {
            productName,
            name,
            sku,
            categoryId,
            description,
            price,
            stockQuantity,
            stock,
            imageUrls,
            images,
            tags,
            isActive,
            discountValue,
            discountType
        } = body;

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id: params.id },
        });

        if (!existingProduct) {
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            );
        }

        // Check if SKU is being changed and if it already exists
        if (sku && sku !== existingProduct.sku) {
            const skuExists = await prisma.product.findUnique({
                where: { sku },
            });

            if (skuExists) {
                return NextResponse.json(
                    { message: 'SKU already exists' },
                    { status: 400 }
                );
            }
        }

        // Prepare update data
        const updateData: any = {};
        if (productName || name) updateData.name = productName || name;
        if (sku) updateData.sku = sku;
        if (categoryId) updateData.categoryId = categoryId;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (stockQuantity !== undefined || stock !== undefined) updateData.stock = stockQuantity !== undefined ? parseInt(stockQuantity) : parseInt(stock);
        if (isActive !== undefined) updateData.isActive = isActive;

        // Update Discount & Calculate Sale Price
        // Update Discount & Calculate Sale Price
        if (discountValue !== undefined || discountType !== undefined || price !== undefined) {
            const currentProduct = await prisma.product.findUnique({ where: { id: params.id } });
            const basePrice = price !== undefined ? parseFloat(price) : Number(currentProduct?.price || 0);

            // Safe Parsing for Discount Value
            let parsedDiscountValue: number | null = null;
            if (discountValue !== undefined && discountValue !== null && discountValue !== '') {
                const parsed = parseFloat(discountValue.toString());
                if (!isNaN(parsed)) {
                    parsedDiscountValue = parsed;
                }
            } else if (discountValue === undefined) {
                // If not sent in update, keep old value
                parsedDiscountValue = currentProduct?.discountValue ? Number(currentProduct.discountValue) : null;
            }

            const dType = discountType !== undefined ? discountType : (currentProduct?.discountType || 'PERCENT');

            // Set Discount Value for DB Update (Explicitly Handle Nulls)
            if (discountValue !== undefined) {
                updateData.discountValue = parsedDiscountValue; // Can be null
            }
            if (discountType !== undefined) {
                updateData.discountType = dType;
            }

            // Recalculate Sale Price
            let newSalePrice = null;
            if (parsedDiscountValue !== null && parsedDiscountValue > 0) {
                if (dType === 'PERCENT') {
                    newSalePrice = basePrice - (basePrice * (parsedDiscountValue / 100));
                } else {
                    newSalePrice = basePrice - parsedDiscountValue;
                }
                newSalePrice = Math.max(0, newSalePrice);
            }
            updateData.salePrice = newSalePrice;
        }

        if (imageUrls !== undefined) {
            updateData.images = JSON.stringify(imageUrls);
        } else if (images !== undefined) {
            updateData.images = typeof images === 'string' ? images : JSON.stringify(images);
        }

        // Handle tags
        if (tags !== undefined) {
            updateData.tags = {
                set: [], // Disconnect all existing tags first
                connectOrCreate: (tags || []).map((tagName: string) => ({
                    where: { name: tagName },
                    create: { name: tagName }
                }))
            };
        }

        // Update product
        const product = await prisma.product.update({
            where: { id: params.id },
            data: updateData,
            include: {
                category: true,
                tags: true
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/products/[id] - Delete product with Cascade
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = params.id;

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            );
        }

        // Use transaction to ensure data integrity
        await prisma.$transaction([
            // 1. Delete related InventoryLogs
            prisma.inventoryLog.deleteMany({
                where: { productId: id }
            }),
            // 2. Delete related OrderItems
            prisma.orderItem.deleteMany({
                where: { productId: id }
            }),
            // 3. Delete Product
            prisma.product.delete({
                where: { id }
            })
        ]);

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { message: error.message || 'Error deleting product' },
            { status: 500 }
        );
    }
}

// PATCH /api/products/[id] - Update stock
export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const body = await request.json();
        const { stock } = body;

        if (stock === undefined) {
            return NextResponse.json(
                { message: 'Stock quantity is required' },
                { status: 400 }
            );
        }

        const product = await prisma.product.update({
            where: { id: params.id },
            data: { stock },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating stock:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
