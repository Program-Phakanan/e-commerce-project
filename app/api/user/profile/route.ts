import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { logActivity } from '@/lib/logger';

// GET /api/user/profile
export async function GET(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, username: true, email: true, role: true, image: true, createdAt: true }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('GET Profile Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT /api/user/profile
export async function PUT(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, image } = body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                image
            },
            select: { id: true, name: true, username: true, email: true, role: true, image: true, createdAt: true }
        });

        // Log Activity
        await logActivity(userId, 'UPDATE_PROFILE', `Updated profile name: ${name}`, request);

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('PUT Profile Error:', error);
        return NextResponse.json({ message: 'Error updating profile' }, { status: 500 });
    }
}
