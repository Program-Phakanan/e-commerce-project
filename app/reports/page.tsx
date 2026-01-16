'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    BarChart3,
    Download,
    Calendar,
    TrendingUp,
    Package,
    Users,
    DollarSign,
} from 'lucide-react';

export default function ReportsPage() {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [loading, setLoading] = useState(false);

    const handleExport = (type: 'csv' | 'pdf') => {
        // TODO: Implement export functionality
        alert(`Export as ${type.toUpperCase()} - Coming soon!`);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-[#2D2D2D]">รายงานและสถิติ</h1>
                    <p className="text-[#6B7280] mt-1">วิเคราะห์ข้อมูลการขายและประสิทธิภาพ</p>
                </div>

                {/* Date Range Filter */}
                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#6B7280]" />
                            <span className="text-sm font-medium text-[#2D2D2D]">ช่วงเวลา:</span>
                        </div>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="max-w-xs"
                        />
                        <span className="text-[#6B7280]">ถึง</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="max-w-xs"
                        />
                        <button className="btn-primary ml-auto">
                            สร้างรายงาน
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-[#6B7280] mb-1">ยอดขายรวม</p>
                                <h3 className="text-3xl font-bold text-[#2D2D2D]">฿125,000</h3>
                                <p className="text-sm text-green-600 mt-2">+15% จากเดือนที่แล้ว</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-[#6B7280] mb-1">คำสั่งซื้อทั้งหมด</p>
                                <h3 className="text-3xl font-bold text-[#2D2D2D]">45</h3>
                                <p className="text-sm text-green-600 mt-2">+8% จากเดือนที่แล้ว</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-[#6B7280] mb-1">ลูกค้าใหม่</p>
                                <h3 className="text-3xl font-bold text-[#2D2D2D]">12</h3>
                                <p className="text-sm text-green-600 mt-2">+20% จากเดือนที่แล้ว</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Best Sellers */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-[#2D2D2D]">
                            สินค้าขายดี (Top 10)
                        </h2>
                        <button
                            onClick={() => handleExport('csv')}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table>
                            <thead>
                                <tr>
                                    <th>อันดับ</th>
                                    <th>ชื่อสินค้า</th>
                                    <th>SKU</th>
                                    <th>จำนวนที่ขาย</th>
                                    <th>ยอดขาย</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 font-bold">
                                            1
                                        </span>
                                    </td>
                                    <td className="font-medium">Sample Product 1</td>
                                    <td className="font-mono text-sm">SKU-001</td>
                                    <td className="text-center">150</td>
                                    <td className="font-semibold">฿75,000</td>
                                </tr>
                                <tr>
                                    <td className="text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-800 font-bold">
                                            2
                                        </span>
                                    </td>
                                    <td className="font-medium">Sample Product 2</td>
                                    <td className="font-mono text-sm">SKU-002</td>
                                    <td className="text-center">120</td>
                                    <td className="font-semibold">฿60,000</td>
                                </tr>
                                <tr>
                                    <td className="text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-800 font-bold">
                                            3
                                        </span>
                                    </td>
                                    <td className="font-medium">Sample Product 3</td>
                                    <td className="font-mono text-sm">SKU-003</td>
                                    <td className="text-center">100</td>
                                    <td className="font-semibold">฿50,000</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="text-center mt-6 text-sm text-[#6B7280]">
                        <Package className="w-12 h-12 text-[#E5E7EB] mx-auto mb-2" />
                        <p>ข้อมูลจะแสดงเมื่อมีการสั่งซื้อสินค้า</p>
                    </div>
                </div>

                {/* Top Customers */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-[#2D2D2D]">
                            ลูกค้าที่ซื้อมากที่สุด
                        </h2>
                        <button
                            onClick={() => handleExport('pdf')}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table>
                            <thead>
                                <tr>
                                    <th>ชื่อลูกค้า</th>
                                    <th>อีเมล</th>
                                    <th>จำนวนคำสั่งซื้อ</th>
                                    <th>ยอดซื้อรวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={4} className="text-center py-12">
                                        <Users className="w-12 h-12 text-[#E5E7EB] mx-auto mb-2" />
                                        <p className="text-[#6B7280]">ข้อมูลจะแสดงเมื่อมีลูกค้าทำการสั่งซื้อ</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
