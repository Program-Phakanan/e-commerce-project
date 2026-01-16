import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
    try {
        console.log('GET /api/payment-methods HIT');
        // Optional: Filter by isActive (if query param provided)
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('activeOnly') === 'true';

        const paymentMethods = await prisma.paymentMethod.findMany({
            where: activeOnly ? { isActive: true } : {},
            orderBy: { createdAt: 'desc' }
        });

        // Add CORS headers just in case
        const response = NextResponse.json(paymentMethods);
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        return response;

    } catch (error) {
        console.error('Error fetching payment methods:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate & Check Admin
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // 2. Create Data
        const body = await request.json();
        const { name, details, type, qrCode } = body; // qrCode (url) optional

        const newMethod = await prisma.paymentMethod.create({
            data: {
                name,
                details,
                type,
                qrCode
            }
        });

        return NextResponse.json(newMethod, { status: 201 });
    } catch (error) {
        console.error('Error creating payment method:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
