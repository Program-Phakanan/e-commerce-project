import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name } = body;

        const tag = await prisma.tag.update({
            where: { id },
            data: { name }
        });

        return NextResponse.json(tag);
    } catch (error) {
        console.error('Error updating tag:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.tag.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Tag deleted successfully' });
    } catch (error) {
        console.error('Error deleting tag:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
