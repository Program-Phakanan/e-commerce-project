import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders - Get all orders with pagination and filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.max(1, parseInt(searchParams.get('limit') || '20'));
        const search = searchParams.get('search') || '';
        const statusId = searchParams.get('statusId');
        const paymentStatus = searchParams.get('paymentStatus');

        const skip = (page - 1) * limit;

        // Optimized Filter
        const where: any = {};

        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { customer: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        if (statusId) where.statusId = statusId;
        if (paymentStatus) where.paymentStatus = paymentStatus;

        // Fetch orders with specific selection
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                select: {
                    id: true,
                    orderNumber: true,
                    totalAmount: true,
                    paymentStatus: true,
                    paymentMethod: true,
                    createdAt: true,
                    statusId: true,
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        }
                    },
                    orderStatus: {
                        select: {
                            id: true,
                            name: true,
                            color: true,
                        }
                    },
                    items: { // Correct relation name
                        select: {
                            id: true,
                            quantity: true,
                            product: {
                                select: {
                                    name: true,
                                    sku: true,
                                    images: true // Useful for thumbnails
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.order.count({ where }),
        ]);

        // Transform to match API contract (items -> orderItems)
        const formattedOrders = orders.map(order => ({
            ...order,
            items: undefined,
            orderItems: order.items
        }));

        return NextResponse.json({
            orders: formattedOrders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        let {
            customerId,
            statusId,
            orderItems,
            shippingAddress,
            paymentMethod,
            paymentStatus,
            notes,
            discountAmount,
            couponCode
        } = body;

        // 1. Validate Input
        if (!customerId || !orderItems || orderItems.length === 0) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // 2. Resolve or Create Pending Status
        if (!statusId) {
            const pendingStatus = await prisma.orderStatus.findFirst({
                where: { name: 'Pending' },
                select: { id: true }
            });

            if (pendingStatus) {
                statusId = pendingStatus.id;
            } else {
                console.log('Auto-creating Pending status...');
                const newStatus = await prisma.orderStatus.create({
                    data: { name: 'Pending', orderIndex: 0, color: '#fbbf24' }
                });
                statusId = newStatus.id;
            }
        }

        // 3. Ensure Customer Exists
        // Optimization: Check existence efficiently
        let customerIdToUse = customerId;
        const existingCustomer = await prisma.customer.findUnique({
            where: { id: customerId },
            select: { id: true }
        });

        if (!existingCustomer) {
            const user = await prisma.user.findUnique({
                where: { id: customerId },
                select: { name: true, email: true, username: true }
            });

            // Create customer record if linked user exists (or create as guest if architecture allows)
            const newCustomer = await prisma.customer.create({
                data: {
                    id: customerId,
                    name: user?.name || 'Guest Customer',
                    email: user?.email || `guest_${Date.now()}@example.com`,
                    phone: user?.username || '',
                    address: shippingAddress || ''
                }
            });
            customerIdToUse = newCustomer.id;
        }

        // 4. Batch Fetch Products (Fix N+1 Issue)
        const productIds = orderItems.map((item: any) => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, price: true }
        });

        const productMap = new Map(products.map(p => [p.id, p]));

        // 5. Calculate Total & Validate Items
        let totalAmount = 0;
        const validOrderItems = [];

        for (const item of orderItems) {
            const product = productMap.get(item.productId);
            if (!product) {
                return NextResponse.json({ message: `Product ${item.productId} not found` }, { status: 404 });
            }
            const unitPrice = Number(product.price);
            totalAmount += unitPrice * item.quantity;

            validOrderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                price: unitPrice,
                total: unitPrice * item.quantity
            });
        }

        // 6. Apply Discount
        const finalDiscount = Number(discountAmount) > 0 ? Number(discountAmount) : 0;
        totalAmount = Math.max(0, totalAmount - finalDiscount);

        // 7. Generate Order Number
        const currentCount = await prisma.order.count();
        const orderNumber = `ORD-${new Date().getFullYear()}-${String(currentCount + 1).padStart(4, '0')}`;

        // 8. Create Order
        const order = await prisma.order.create({
            data: {
                orderNumber,
                customerId: customerIdToUse,
                statusId,
                totalAmount,
                discountAmount: finalDiscount,
                couponCode: couponCode || null,
                shippingAddress: shippingAddress || '',
                paymentMethod: paymentMethod || 'Cash',
                paymentStatus: paymentStatus || 'Pending',
                notes,
                items: { // Correct relation name from schema
                    create: validOrderItems
                },
            },
            include: {
                customer: { select: { name: true } },
                orderStatus: { select: { name: true, color: true } },
                items: { // Correct relation name from schema
                    include: {
                        product: { select: { name: true, sku: true } }
                    }
                },
            },
        });

        // 9. Legacy Compatibility Map
        // The frontend expects 'orderItems' but the DB relation is 'items'.
        const responseOrder = {
            ...order,
            items: undefined, // Remove raw relation
            orderItems: order.items // Map to expected key
        };

        return NextResponse.json(responseOrder, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
