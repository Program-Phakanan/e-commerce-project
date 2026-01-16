import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(tags);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching tags' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, color } = body;

        if (!name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });

        const tag = await prisma.tag.upsert({
            where: { name },
            update: { color: color || undefined },
            create: { name, color }
        });

        return NextResponse.json(tag);
    } catch (error) {
        return NextResponse.json({ message: 'Error creating tag' }, { status: 500 });
    }
}
