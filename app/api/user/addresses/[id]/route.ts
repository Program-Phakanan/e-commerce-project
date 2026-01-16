import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/auth-helper';

// DELETE /api/user/addresses/[id]
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const userId = await getAuthenticatedUserId(request);
        if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // Verify ownership
        const address = await prisma.address.findUnique({
            where: { id: params.id }
        });

        if (!address || address.userId !== userId) {
            return NextResponse.json({ message: 'Address not found' }, { status: 404 });
        }

        await prisma.address.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: 'Address deleted' });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
