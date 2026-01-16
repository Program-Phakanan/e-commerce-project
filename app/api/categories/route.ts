import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories - Get all categories
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// POST /api/categories - Create new category
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, isActive } = body;

        if (!name) {
            return NextResponse.json(
                { message: 'Category name is required' },
                { status: 400 }
            );
        }

        const category = await prisma.category.create({
            data: {
                name,
                description,
                isActive: isActive !== undefined ? isActive : true,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
