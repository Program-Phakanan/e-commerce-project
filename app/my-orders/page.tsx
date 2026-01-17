'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Package, Clock, ShoppingBag, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MyOrdersPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else if (!loading && !user) {
            // Optional: redirect to login if strictly required
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            // Filter by current user ID
            const res = await fetch(`/api/orders?customerId=${user?.id}`);
            if (res.ok) {
                const data = await res.json();
                // Filter: Only Paid or Cancelled
                const filtered = data.orders.filter((o: any) =>
                    o.paymentStatus === 'Paid' || o.orderStatus.name === 'ยกเลิก'
                );
                setOrders(filtered);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <p className="text-gray-500">กรุณาเข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ</p>
                <button onClick={() => router.push('/login')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg font-bold">เข้าสู่ระบบ</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/shop" className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-gray-400 hover:text-blue-600 border border-transparent hover:border-blue-100">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                ประวัติการสั่งซื้อ
                            </h1>
                            <p className="text-sm text-gray-500">รายการสั่งซื้อทั้งหมดของคุณ</p>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="w-10 h-10 text-blue-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">ยังไม่มีประวัติการสั่งซื้อ</h3>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">คุณยังไม่ได้ทำการสั่งซื้อสินค้า เริ่มต้นช้อปสินค้าคุณภาพจากเราได้เลย</p>
                            <Link href="/shop" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all hover:-translate-y-1 inline-flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                ไปเลือกซื้อสินค้า
                            </Link>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => router.push(`/orders/${order.id}`)}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <span className="font-mono text-sm font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">#{order.orderNumber}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${order.paymentStatus === 'Paid'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : (order.paymentStatus === 'Cancelled' || order.orderStatus.name === 'ยกเลิก')
                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-green-500'
                                                    : (order.paymentStatus === 'Cancelled' || order.orderStatus.name === 'ยกเลิก') ? 'bg-red-600'
                                                        : 'bg-amber-500'
                                                    }`}></div>
                                                {order.paymentStatus === 'Paid' ? 'ชำระเงินแล้ว'
                                                    : (order.paymentStatus === 'Cancelled' || order.orderStatus.name === 'ยกเลิก') ? 'ยกเลิกแล้ว'
                                                        : 'รอชำระเงิน'}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                {order.orderStatus.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            {new Date(order.createdAt).toLocaleDateString('th-TH', {
                                                year: 'numeric', month: 'long', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-8 min-w-[240px] pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 mb-1">{order.orderItems.length} รายการ</p>
                                            <p className="text-xl font-bold text-gray-900">฿{Number(order.totalAmount).toLocaleString()}</p>
                                        </div>
                                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-blue-200 group-hover:scale-110">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
