import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { logActivity } from '@/lib/logger';

// PUT /api/users/[id] - Update user role
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params; // Await params for Next.js 15

        // 1. Verify Authentication
        const requestUserId = await getAuthenticatedUserId(request);
        if (!requestUserId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // 2. Verify Admin Role
        const requester = await prisma.user.findUnique({ where: { id: requestUserId } });
        if (!requester || requester.role !== 'Admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // 3. Update User
        const body = await request.json();
        const { role } = body;

        if (role && !['Admin', 'Customer', 'User'].includes(role)) {
            return NextResponse.json({ message: 'Invalid role provided' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: { role },
            select: { id: true, username: true, role: true }
        });

        // 4. Log Activity
        await logActivity(requestUserId, 'UPDATE_USER_ROLE', `Changed user ${updatedUser.username} role to ${role}`, request);

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;

        // 1. Verify Authentication
        const requestUserId = await getAuthenticatedUserId(request);
        if (!requestUserId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // 2. Verify Admin Role
        const requester = await prisma.user.findUnique({ where: { id: requestUserId } });
        if (!requester || requester.role !== 'Admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // 3. Prevent Self-Deletion
        if (params.id === requestUserId) {
            return NextResponse.json({ message: 'Cannot delete yourself' }, { status: 400 });
        }

        // 4. Delete User (Cascade handled by Prisma schema if configured, or manual cleanup needed)
        // Check if user exists first to get name for log
        const targetUser = await prisma.user.findUnique({ where: { id: params.id } });
        if (!targetUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        await prisma.user.delete({
            where: { id: params.id }
        });

        // 5. Log Activity
        await logActivity(requestUserId, 'DELETE_USER', `Deleted user: ${targetUser.username}`, request);

        return NextResponse.json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
