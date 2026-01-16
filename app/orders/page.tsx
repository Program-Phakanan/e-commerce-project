'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
    ShoppingCart, Search, Eye, Trash2, Plus,
    Filter, Calendar, ChevronDown, CheckCircle2,
    AlertCircle, Package, Truck, XCircle, CreditCard
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Order {
    id: string;
    orderNumber: string;
    customer: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
    };
    status: {
        id: string;
        name: string;
        color: string;
        orderIndex: number;
    };
    totalAmount: number;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    orderItems: any[];
}

interface OrderStatus {
    id: string;
    name: string;
    color: string;
    orderIndex: number;
}

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [statuses, setStatuses] = useState<OrderStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchOrders();
        fetchStatuses();
    }, [page, search, statusFilter, paymentFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(search && { search }),
                ...(statusFilter && { statusId: statusFilter }),
                ...(paymentFilter && { paymentStatus: paymentFilter }),
            });

            const response = await fetch(`/api/orders?${params}`);
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatuses = async () => {
        try {
            const response = await fetch('/api/order-statuses');
            if (response.ok) {
                const data = await response.json();
                setStatuses(data);
            }
        } catch (error) {
            console.error('Error fetching statuses:', error);
        }
    };

    const handleStatusChange = async (orderId: string, newStatusId: string) => {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statusId: newStatusId }),
            });

            if (response.ok) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: false
                });
                Toast.fire({
                    icon: 'success',
                    title: 'อัพเดทสถานะเรียบร้อย'
                });
                fetchOrders();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถอัพเดทสถานะได้',
            });
        }
    };

    const handleDelete = async (id: string, orderNumber: string) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: `คุณต้องการลบคำสั่งซื้อ "${orderNumber}" ใช่หรือไม่? ไม่สามารถกู้คืนได้`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'ยืนยันลบ',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/orders/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    Swal.fire({
                        title: 'ลบสำเร็จ!',
                        text: 'ลบคำสั่งซื้อเรียบร้อยแล้ว',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchOrders();
                }
            } catch (error) {
                Swal.fire('Error', 'ไม่สามารถลบคำสั่งซื้อได้', 'error');
            }
        }
    };

    const getPaymentStatusStyle = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Refunded': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getPaymentIcon = (status: string) => {
        switch (status) {
            case 'Paid': return <CheckCircle2 className="w-3 h-3 mr-1" />;
            case 'Pending': return <CreditCard className="w-3 h-3 mr-1" />;
            case 'Refunded': return <XCircle className="w-3 h-3 mr-1" />;
            default: return null;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* 🏷️ Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            คำสั่งซื้อ
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">จัดการและติดตามสถานะออเดอร์ทั้งหมด</p>
                    </div>
                    <button
                        onClick={() => router.push('/orders/new')}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all duration-200"
                    >
                        <Plus className="w-5 h-5" />
                        <span>สร้างคำสั่งซื้อ</span>
                    </button>
                </div>

                {/* 🔍 Search & Filter Toolbar */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="w-full md:w-96">
                        <div className="flex items-center w-full bg-white border-2 border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 h-14">
                            <div className="pl-4 pr-2 text-gray-400">
                                <Search className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="ค้นหาเลขที่คำสั่งซื้อ, ชื่อลูกค้า..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 py-3 bg-transparent border-none outline-none text-gray-900 font-medium placeholder:font-normal placeholder:text-gray-400 h-full"
                            />
                        </div>
                    </div>

                    {/* Filters Group */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative group w-full md:w-auto">
                            <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 h-14 min-w-[180px]">
                                <div className="pl-4 pr-2 text-gray-400">
                                    <Filter className="h-5 w-5" />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex-1 py-3 bg-transparent border-none outline-none text-gray-700 font-medium cursor-pointer appearance-none h-full pr-8"
                                >
                                    <option value="">สถานะทั้งหมด</option>
                                    {statuses.map((status) => (
                                        <option key={status.id} value={status.id}>
                                            {status.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="relative group w-full md:w-auto">
                            <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 h-14 min-w-[180px]">
                                <div className="pl-4 pr-2 text-gray-400">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <select
                                    value={paymentFilter}
                                    onChange={(e) => setPaymentFilter(e.target.value)}
                                    className="flex-1 py-3 bg-transparent border-none outline-none text-gray-700 font-medium cursor-pointer appearance-none h-full pr-8"
                                >
                                    <option value="">การเงินทั้งหมด</option>
                                    <option value="Pending">รอชำระเงิน</option>
                                    <option value="Paid">ชำระแล้ว</option>
                                    <option value="Refunded">คืนเงินแล้ว</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📋 Orders Table */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-gray-400 font-medium animate-pulse">กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-24 bg-gray-50/50">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                                <Package className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">ไม่พบคำสั่งซื้อ</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">ลองเปลี่ยนคำค้นหา หรือตัวกรองสถานะใหม่อีกครั้ง</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="text-left py-5 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">Order ID</th>
                                        <th className="text-left py-5 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">ลูกค้า</th>
                                        <th className="text-left py-5 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">ยอดรวม</th>
                                        <th className="text-center py-5 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">สถานะการชำระ</th>
                                        <th className="text-center py-5 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">สถานะคำสั่งซื้อ</th>
                                        <th className="text-center py-5 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">วันที่</th>
                                        <th className="text-right py-5 px-6 font-bold text-gray-600 text-sm uppercase tracking-wider">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="py-5 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-mono font-bold text-gray-900 text-base">{order.orderNumber}</span>
                                                    <span className="text-xs text-gray-400 mt-1">{order.orderItems.length} รายการ</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold shadow-sm">
                                                        {order.customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{order.customer.name}</p>
                                                        <p className="text-xs text-gray-500 font-medium">{order.customer.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className="font-bold text-gray-900 text-lg">
                                                    ฿{Number(order.totalAmount).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getPaymentStatusStyle(order.paymentStatus)}`}>
                                                    {getPaymentIcon(order.paymentStatus)}
                                                    {order.paymentStatus === 'Paid' ? 'ชำระแล้ว' : order.paymentStatus === 'Pending' ? 'รอชำระ' : 'คืนเงิน'}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                <div className="relative inline-block">
                                                    <select
                                                        value={order.status.id}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-offset-2 transition-all shadow-sm"
                                                        style={{
                                                            backgroundColor: `${order.status.color}20`,
                                                            color: order.status.color,
                                                            outlineColor: order.status.color
                                                        }}
                                                    >
                                                        {statuses.map((status) => (
                                                            <option key={status.id} value={status.id}>
                                                                {status.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {new Date(order.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => router.push(`/orders/${order.id}`)}
                                                        className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all"
                                                        title="ดูรายละเอียด"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(order.id, order.orderNumber)}
                                                        className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm transition-all"
                                                        title="ลบคำสั่งซื้อ"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <span className="text-sm text-gray-500 font-medium">
                                หน้า {page} จาก {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                                >
                                    ก่อนหน้า
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                                >
                                    ถัดไป
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
