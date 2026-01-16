import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products - Get all products with pagination and filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.max(1, parseInt(searchParams.get('limit') || '20'));
        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('categoryId');
        const isActive = searchParams.get('isActive');
        const stockStatus = searchParams.get('stockStatus');

        const skip = (page - 1) * limit;

        // Optimized Filter Building
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (categoryId) where.categoryId = categoryId;
        if (isActive !== null) where.isActive = isActive === 'true';

        if (stockStatus === 'low') where.stock = { lt: 10 };
        else if (stockStatus === 'out') where.stock = { lte: 0 };
        else if (stockStatus === 'available') where.stock = { gt: 0 };

        // Execute DB queries in parallel
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    sku: true,
                    price: true,
                    salePrice: true,
                    stock: true,
                    images: true,
                    isActive: true,
                    categoryId: true,
                    discountValue: true,
                    discountType: true,
                    description: true, // Needed for display sometimes, can be huge though
                    category: {
                        select: { id: true, name: true }
                    },
                    tags: true,
                    // Optimized aggregation: Only select quantity
                    orderItems: {
                        where: { order: { paymentStatus: 'Paid' } },
                        select: { quantity: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        // Process results (Lean transformation)
        const productsWithStats = products.map(product => {
            const { orderItems, ...safeProduct } = product;
            const soldCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
            return { ...safeProduct, soldCount };
        });

        return NextResponse.json({
            products: productsWithStats,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            productName,
            sku,
            categoryId,
            description,
            price,
            stockQuantity,
            imageUrls, // Frontend sends array of strings
            tags, // Add tags here
            isActive,
            discountValue,
            discountType
        } = body;

        // Validation
        if (!productName || !sku || !categoryId || !price) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if SKU already exists
        const existingProduct = await prisma.product.findUnique({
            where: { sku },
        });

        if (existingProduct) {
            return NextResponse.json(
                { message: 'SKU already exists' },
                { status: 400 }
            );
        }

        // Calculate Sale Price
        let salePrice = null;
        if (discountValue && parseFloat(discountValue) > 0) {
            const priceNum = parseFloat(price);
            const discountNum = parseFloat(discountValue);

            if (discountType === 'PERCENT') {
                salePrice = priceNum - (priceNum * (discountNum / 100));
            } else {
                salePrice = priceNum - discountNum;
            }
            // Ensure sale price is not negative
            salePrice = Math.max(0, salePrice);
        }

        // Create product
        const product = await prisma.product.create({
            data: {
                name: productName, // Schema uses 'name' not 'productName'
                sku,
                categoryId,
                description: description || '',
                price: price,
                salePrice: salePrice,
                discountValue: discountValue ? parseFloat(discountValue) : null,
                discountType: discountType || 'PERCENT',
                stock: stockQuantity || 0,
                // Handle tags relation (Many-to-Many)
                tags: {
                    connectOrCreate: (tags || []).map((tagName: string) => ({
                        where: { name: tagName },
                        create: { name: tagName }
                    }))
                },
                images: JSON.stringify(imageUrls || []),
                isActive: isActive !== undefined ? isActive : true,
            },
            include: {
                category: true,
                tags: true, // Include tags in response
            },
        });

        // Create inventory log for initial stock
        if (stockQuantity > 0) {
            // Get admin user (you might want to get from JWT token)
            const adminUser = await prisma.user.findFirst({
                where: { role: 'Admin' },
            });

            if (adminUser) {
                await prisma.inventoryLog.create({
                    data: {
                        productId: product.id,
                        change: stockQuantity, // Schema uses 'change'
                        reason: 'New_Stock',
                        type: 'IN', // Added type as per schema might require it (schema has 'type' String)
                        userId: adminUser.id, // Schema uses 'userId'
                    },
                });
            }
        }

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
