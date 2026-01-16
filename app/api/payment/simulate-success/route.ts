import { NextRequest, NextResponse } from 'next/server';
import { MockGateway } from '@/lib/payment/mock-gateway';

export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json();
        await MockGateway.simulatePaymentSuccess(orderId);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
