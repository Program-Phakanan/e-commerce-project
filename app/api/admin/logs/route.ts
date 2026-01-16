import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Check verification Role (Must be Admin)
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Fetch logs
        const logs = await prisma.activityLog.findMany({
            include: {
                user: {
                    select: { name: true, username: true, email: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100 // Last 100 activities
        });

        return NextResponse.json(logs);

    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
