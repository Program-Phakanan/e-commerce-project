import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/order-statuses - Get all order statuses
export async function GET() {
    try {
        const statuses = await prisma.orderStatus.findMany({
            orderBy: {
                orderIndex: 'asc',
            },
        });

        return NextResponse.json(statuses);
    } catch (error) {
        console.error('Error fetching order statuses:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
