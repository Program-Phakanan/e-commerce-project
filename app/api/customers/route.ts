import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/customers - Get all customers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.customer.count({ where }),
        ]);

        return NextResponse.json({
            customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/customers - Create new customer
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, address, city, postalCode } = body;

        if (!name || !email) {
            return NextResponse.json(
                { message: 'Name and email are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingCustomer = await prisma.customer.findUnique({
            where: { email },
        });

        if (existingCustomer) {
            return NextResponse.json(
                { message: 'Email already exists' },
                { status: 400 }
            );
        }

        const customer = await prisma.customer.create({
            data: {
                name,
                email,
                phone,
                address,
                city,
                postalCode,
            },
        });

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
