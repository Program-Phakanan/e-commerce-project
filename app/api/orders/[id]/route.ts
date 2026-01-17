import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders/[id] - Get single order
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: {
                customer: true,
                orderStatus: true,
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                sku: true,
                                images: true,
                                price: true, // Needed for cart
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { message: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/orders/[id] - Update order
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const body = await request.json();
        const { statusId, paymentStatus, notes, assignedToId } = body;

        // Get current order status
        const currentOrder = await prisma.order.findUnique({
            where: { id: params.id },
            include: { items: true }
        });

        if (!currentOrder) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // Logic for Stock Deduction upon Payment Success
        if (paymentStatus === 'Paid' && currentOrder.paymentStatus !== 'Paid') {
            // 1. Check stock availability for all items
            for (const item of currentOrder.items) {
                const product = await prisma.product.findUnique({ where: { id: item.productId } });
                if (!product || product.stock < item.quantity) {
                    return NextResponse.json(
                        { message: `Cannot confirm payment: Insufficient stock for product ID ${item.productId}` },
                        { status: 400 }
                    );
                }
            }

            // 2. Deduct Stock & Create Logs
            const adminUser = await prisma.user.findFirst({ where: { role: 'Admin' } }); // Use admin as actor for system auto-deduction

            // Use transaction for consistency if possible, but sequential is acceptable for MVP
            for (const item of currentOrder.items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });

                if (adminUser) {
                    await prisma.inventoryLog.create({
                        data: {
                            productId: item.productId,
                            userId: adminUser.id,
                            change: -item.quantity,
                            reason: 'Order_Payment',
                            type: 'OUT'
                        }
                    });
                }
            }
        }

        const order = await prisma.order.update({
            where: { id: params.id },
            data: {
                ...(statusId && { statusId }),
                ...(paymentStatus && { paymentStatus }),
                ...(notes !== undefined && { notes }),
                ...(assignedToId !== undefined && { assignedToId }),
            },
            include: {
                customer: true,
                orderStatus: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/orders/[id] - Cancel order
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: {
                items: true,
            },
        });

        if (!order) {
            return NextResponse.json(
                { message: 'Order not found' },
                { status: 404 }
            );
        }

        // Restore stock ONLY if order was already paid (meaning stock was deducted)
        if (order.paymentStatus === 'Paid') {
            const adminUser = await prisma.user.findFirst({
                where: { role: 'Admin' },
            });

            for (const item of order.items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { // Correct field name from stockQuantity to stock
                            increment: item.quantity,
                        },
                    },
                });

                if (adminUser) {
                    await prisma.inventoryLog.create({
                        data: {
                            productId: item.productId,
                            userId: adminUser.id, // Correct field name
                            change: item.quantity, // Positive for restoration
                            reason: 'Return',
                            type: 'IN',
                        },
                    });
                }
            }
        }

        // Delete order
        await prisma.order.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Order cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling order:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
