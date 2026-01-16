import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { logActivity } from '@/lib/logger';

// GET /api/user/addresses
export async function GET(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' } // Default address first
        });

        return NextResponse.json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/user/addresses
export async function POST(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Check address limit (Max 5)
        const addressCount = await prisma.address.count({
            where: { userId }
        });

        if (addressCount >= 5) {
            return NextResponse.json({ message: 'Maximum 5 addresses allowed' }, { status: 400 });
        }

        const body = await request.json();
        const { label, firstName, lastName, phone, addressLine, city, zipCode, isDefault } = body;

        // If this is the first address or set as default, update others to not default
        if (addressCount === 0 || isDefault) {
            await prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }

        // Ensure at least one default if it's the first one
        const shouldBeDefault = addressCount === 0 ? true : (isDefault || false);

        const newAddress = await prisma.address.create({
            data: {
                userId,
                label,
                firstName,
                lastName,
                phone,
                addressLine,
                city,
                zipCode,
                isDefault: shouldBeDefault
            }
        });

        // Log Activity
        await logActivity(userId, 'ADD_ADDRESS', `Added address: ${label || 'New Address'}`, request);

        return NextResponse.json(newAddress);
    } catch (error) {
        console.error('Error creating address:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
