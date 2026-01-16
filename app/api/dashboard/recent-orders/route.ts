import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const recentOrders = await prisma.order.findMany({
            take: 10,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                customer: {
                    select: {
                        name: true,
                    },
                },
                orderStatus: { // Fixed relation name
                    select: {
                        name: true,
                        color: true,
                    },
                },
            },
        });

        const formattedOrders = recentOrders.map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customer.name,
            totalAmount: Number(order.totalAmount),
            status: order.orderStatus.name, // Fixed access
            statusColor: order.orderStatus.color, // Fixed access
            createdAt: order.createdAt.toISOString(),
        }));

        return NextResponse.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
