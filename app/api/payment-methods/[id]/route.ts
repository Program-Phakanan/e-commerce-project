import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/auth-helper';

export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;

        // 1. Authenticate & Check Admin
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // 2. Update Data
        const body = await request.json();
        const updatedMethod = await prisma.paymentMethod.update({
            where: { id: params.id },
            data: body
        });

        return NextResponse.json(updatedMethod);
    } catch (error) {
        console.error('Error updating payment method:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;

        // 1. Authenticate & Check Admin
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // 2. Delete Data
        await prisma.paymentMethod.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment method:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
