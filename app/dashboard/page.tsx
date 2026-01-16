'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    ShoppingCart,
    DollarSign,
    Clock,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Eye,
    ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
    totalOrdersToday: number;
    orderGrowth: number;
    totalRevenueMonth: number;
    revenueGrowth: number;
    pendingOrders: number;
    lowStockProducts: number;
}

interface RecentOrder {
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    statusColor: string;
    createdAt: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats>({
        totalOrdersToday: 0,
        orderGrowth: 0,
        totalRevenueMonth: 0,
        revenueGrowth: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
    });
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 10000); // Poll every 10 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, ordersRes] = await Promise.all([
                fetch('/api/dashboard/stats'),
                fetch('/api/dashboard/recent-orders'),
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                setRecentOrders(ordersData);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatGrowth = (growth: number) => {
        return `${growth > 0 ? '+' : ''}${growth}%`;
    };

    const statCards = [
        {
            title: 'คำสั่งซื้อวันนี้',
            value: stats.totalOrdersToday,
            icon: ShoppingCart,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            change: formatGrowth(stats.orderGrowth),
            isPositive: stats.orderGrowth >= 0,
            subtext: 'เทียบกับเมื่อวาน'
        },
        {
            title: 'รายได้เดือนนี้',
            value: `฿${stats.totalRevenueMonth.toLocaleString()}`,
            icon: DollarSign,
            gradient: 'from-green-500 to-emerald-600',
            bgGradient: 'from-green-50 to-emerald-100',
            change: formatGrowth(stats.revenueGrowth),
            isPositive: stats.revenueGrowth >= 0,
            subtext: 'เทียบกับเดือนที่แล้ว'
        },
        {
            title: 'รอดำเนินการ',
            value: stats.pendingOrders,
            icon: Clock,
            gradient: 'from-orange-500 to-amber-600',
            bgGradient: 'from-orange-50 to-amber-100',
            change: '', // No growth data for pending
            isPositive: true,
            subtext: 'ออเดอร์ที่ต้องจัดการ'
        },
        {
            title: 'สินค้าใกล้หมด',
            value: stats.lowStockProducts,
            icon: AlertTriangle,
            gradient: 'from-red-500 to-rose-600',
            bgGradient: 'from-red-50 to-rose-100',
            change: stats.lowStockProducts > 0 ? 'Action Needed' : 'Good',
            isPositive: stats.lowStockProducts === 0,
            subtext: 'สต็อกต่ำกว่า 10 ชิ้น'
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            แดชบอร์ด
                        </h1>
                        <p className="text-gray-600 mt-2 font-medium">ภาพรวมธุรกิจของคุณ</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">วันนี้</p>
                        <p className="text-lg font-bold text-gray-900">
                            {new Date().toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="card p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((card, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-50`}></div>

                                <div className="relative p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                                            <card.icon className="w-6 h-6 text-white" />
                                        </div>
                                        {card.change && (
                                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${card.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {card.isPositive ? (
                                                    <TrendingUp className="w-3 h-3" />
                                                ) : (
                                                    <TrendingDown className="w-3 h-3" />
                                                )}
                                                {card.change}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm font-semibold text-gray-600 mb-1">{card.title}</p>
                                    <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
                                    {card.subtext && (
                                        <p className="text-xs text-gray-500">{card.subtext}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recent Orders */}
                <div className="card p-6 fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">คำสั่งซื้อล่าสุด</h2>
                            <p className="text-sm text-gray-600 mt-1">10 รายการล่าสุด</p>
                        </div>
                        <button
                            onClick={() => router.push('/orders')}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FFB84D] to-[#FF9E44] text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            ดูทั้งหมด
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">ยังไม่มีคำสั่งซื้อ</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-3 px-4 font-bold text-gray-700">เลขที่คำสั่งซื้อ</th>
                                        <th className="text-left py-3 px-4 font-bold text-gray-700">ลูกค้า</th>
                                        <th className="text-right py-3 px-4 font-bold text-gray-700">ยอดรวม</th>
                                        <th className="text-center py-3 px-4 font-bold text-gray-700">สถานะ</th>
                                        <th className="text-center py-3 px-4 font-bold text-gray-700">วันที่</th>
                                        <th className="text-center py-3 px-4 font-bold text-gray-700">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-colors"
                                        >
                                            <td className="py-4 px-4">
                                                <span className="font-mono font-bold text-gray-900">{order.orderNumber}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="font-medium text-gray-700">{order.customerName}</span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="font-bold text-lg text-gray-900">
                                                    ฿{Number(order.totalAmount).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
                                                    style={{
                                                        backgroundColor: `${order.statusColor}20`,
                                                        color: order.statusColor,
                                                    }}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center text-sm text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString('th-TH')}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => router.push(`/orders/${order.id}`)}
                                                    className="p-2 hover:bg-orange-100 rounded-lg transition-colors group"
                                                    title="ดูรายละเอียด"
                                                >
                                                    <Eye className="w-5 h-5 text-gray-600 group-hover:text-[#FFB84D]" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
