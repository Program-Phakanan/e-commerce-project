import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MockGateway } from '@/lib/payment/mock-gateway';

export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json();

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // Generate Mock QR
        const result = await MockGateway.createTransaction(orderId, Number(order.totalAmount));

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}
