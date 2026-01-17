import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;

        // Find "ยกเลิก" status
        const cancelStatus = await prisma.orderStatus.findFirst({
            where: { name: 'ยกเลิก' }
        });

        if (!cancelStatus) {
            return NextResponse.json(
                { message: 'Cancel status not found in configuration' },
                { status: 500 }
            );
        }

        // Update Order
        const order = await prisma.order.update({
            where: { id: params.id },
            data: {
                statusId: cancelStatus.id,
                paymentStatus: 'Cancelled'
            }
        });

        return NextResponse.json(order);

    } catch (error) {
        console.error('Error cancelling order:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
