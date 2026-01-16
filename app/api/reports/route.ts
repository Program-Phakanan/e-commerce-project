import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        // 1. Sales Chart Data (Last 7 days)
        // Note: For SQLite, grouping by date is tricky. We'll fetch orders and process in JS.
        const recentOrders = await prisma.order.findMany({
            where: {
                createdAt: { gte: sevenDaysAgo },
                paymentStatus: 'Paid'
            },
            select: {
                createdAt: true,
                totalAmount: true
            }
        });

        const salesChart = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const sales = recentOrders
                .filter(o => o.createdAt.toISOString().startsWith(dateStr))
                .reduce((sum, o) => sum + Number(o.totalAmount), 0);

            salesChart.push({
                date: d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
                sales: sales
            });
        }

        // 2. Top Selling Products
        // Prisma doesn't support aggregation perfectly with relations in SQLite, so we'll do query + processing
        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: { paymentStatus: 'Paid' }
            },
            include: { product: true }
        });

        const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

        orderItems.forEach(item => {
            if (!item.product) return;
            const pid = item.product.id;
            if (!productSales[pid]) {
                productSales[pid] = {
                    name: item.product.name,
                    quantity: 0,
                    revenue: 0
                };
            }
            productSales[pid].quantity += item.quantity;
            productSales[pid].revenue += Number(item.total);
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // 3. Overview Stats
        const totalCustomers = await prisma.user.count({ where: { role: 'Customer' } });
        const totalOrders = await prisma.order.count();
        const paidOrders = await prisma.order.count({ where: { paymentStatus: 'Paid' } });
        const revenueResult = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { paymentStatus: 'Paid' }
        });

        return NextResponse.json({
            salesChart,
            topProducts,
            stats: {
                totalCustomers,
                totalOrders,
                paidOrders,
                totalRevenue: revenueResult._sum.totalAmount || 0
            }
        });

    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
