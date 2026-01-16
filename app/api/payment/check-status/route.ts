import { NextRequest, NextResponse } from 'next/server';
import { MockGateway } from '@/lib/payment/mock-gateway';

export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json();
        const isPaid = await MockGateway.checkStatus(orderId);
        return NextResponse.json({ isPaid });
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
