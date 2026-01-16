import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description, isActive } = body;

        const category = await prisma.category.update({
            where: { id },
            data: {
                name,
                description,
                isActive
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
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

        // Check if products exist in this category
        const productsCount = await prisma.product.count({
            where: { categoryId: id }
        });

        if (productsCount > 0) {
            return NextResponse.json(
                { message: 'Cannot delete category with existing products' },
                { status: 400 }
            );
        }

        await prisma.category.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
