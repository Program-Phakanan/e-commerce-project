import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        // 1. Orders Growth (Today vs Yesterday)
        const totalOrdersToday = await prisma.order.count({
            where: { createdAt: { gte: today, lt: tomorrow } }
        });

        const totalOrdersYesterday = await prisma.order.count({
            where: { createdAt: { gte: yesterday, lt: today } }
        });

        const orderGrowth = totalOrdersYesterday === 0
            ? (totalOrdersToday > 0 ? 100 : 0)
            : Math.round(((totalOrdersToday - totalOrdersYesterday) / totalOrdersYesterday) * 100);

        // 2. Revenue Growth (This Month vs Last Month)
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

        const revenueThisMonth = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                createdAt: { gte: firstDayOfMonth, lt: firstDayOfNextMonth },
                paymentStatus: 'Paid' // Only counted paid orders
            }
        });

        const revenueLastMonth = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                createdAt: { gte: firstDayOfLastMonth, lt: firstDayOfMonth },
                paymentStatus: 'Paid'
            }
        });

        const totalRevenueMonth = Number(revenueThisMonth._sum.totalAmount || 0);
        const totalRevenueLastMonth = Number(revenueLastMonth._sum.totalAmount || 0);

        const revenueGrowth = totalRevenueLastMonth === 0
            ? (totalRevenueMonth > 0 ? 100 : 0)
            : Math.round(((totalRevenueMonth - totalRevenueLastMonth) / totalRevenueLastMonth) * 100);

        // 3. Pending Orders
        // We count orders where payment is 'Pending'
        const pendingOrders = await prisma.order.count({
            where: {
                paymentStatus: 'Pending'
            }
        });

        // 4. Low Stock
        const lowStockProducts = await prisma.product.count({
            where: { stock: { lt: 10 }, isActive: true }
        });

        return NextResponse.json({
            totalOrdersToday,
            orderGrowth,
            totalRevenueMonth,
            revenueGrowth,
            pendingOrders,
            lowStockProducts
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
