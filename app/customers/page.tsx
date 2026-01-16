'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Search, Plus, Eye, Edit, Trash2, Mail, Phone } from 'lucide-react';
import Swal from 'sweetalert2';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    createdAt: string;
}

export default function CustomersPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchCustomers();
    }, [page, search]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(search && { search }),
            });

            const response = await fetch(`/api/customers?${params}`);
            if (response.ok) {
                const data = await response.json();
                setCustomers(data.customers);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: `คุณต้องการลบลูกค้า "${name}" ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/customers/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'ลบสำเร็จ!',
                        text: 'ลบลูกค้าเรียบร้อยแล้ว',
                        timer: 1500,
                        showConfirmButton: false,
                    });
                    fetchCustomers();
                }
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถลบลูกค้าได้',
                });
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2D2D2D]">จัดการลูกค้า</h1>
                        <p className="text-[#6B7280] mt-1">รายชื่อลูกค้าทั้งหมด</p>
                    </div>
                    <button
                        onClick={() => router.push('/customers/new')}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        เพิ่มลูกค้าใหม่
                    </button>
                </div>

                {/* Search */}
                <div className="card p-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อ, อีเมล หรือเบอร์โทร..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Customers Table */}
                <div className="card p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="spinner"></div>
                        </div>
                    ) : customers.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-[#E5E7EB] mx-auto mb-4" />
                            <p className="text-[#6B7280]">ไม่พบลูกค้า</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ชื่อลูกค้า</th>
                                            <th>อีเมล</th>
                                            <th>เบอร์โทร</th>
                                            <th>ที่อยู่</th>
                                            <th>วันที่สมัคร</th>
                                            <th className="text-center">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.map((customer) => (
                                            <tr key={customer.id}>
                                                <td className="font-medium">{customer.name}</td>
                                                <td>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="w-4 h-4 text-[#6B7280]" />
                                                        {customer.email}
                                                    </div>
                                                </td>
                                                <td>
                                                    {customer.phone ? (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Phone className="w-4 h-4 text-[#6B7280]" />
                                                            {customer.phone}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#6B7280] text-sm">-</span>
                                                    )}
                                                </td>
                                                <td className="text-sm text-[#6B7280]">
                                                    {customer.city || '-'}
                                                </td>
                                                <td className="text-sm text-[#6B7280]">
                                                    {new Date(customer.createdAt).toLocaleDateString('th-TH')}
                                                </td>
                                                <td>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => router.push(`/customers/${customer.id}`)}
                                                            className="p-2 hover:bg-[#FFF5E6] rounded-lg transition-colors"
                                                            title="ดูรายละเอียด"
                                                        >
                                                            <Eye className="w-4 h-4 text-[#FFB84D]" />
                                                        </button>
                                                        <button
                                                            onClick={() => router.push(`/customers/${customer.id}/edit`)}
                                                            className="p-2 hover:bg-[#FFF5E6] rounded-lg transition-colors"
                                                            title="แก้ไข"
                                                        >
                                                            <Edit className="w-4 h-4 text-blue-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(customer.id, customer.name)}
                                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="ลบ"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="btn-secondary disabled:opacity-50"
                                    >
                                        ก่อนหน้า
                                    </button>
                                    <span className="text-sm text-[#6B7280]">
                                        หน้า {page} จาก {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="btn-secondary disabled:opacity-50"
                                    >
                                        ถัดไป
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
