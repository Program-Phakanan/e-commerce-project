'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Settings as SettingsIcon,
    Users,
    Tag,
    List,
    Plus,
    Edit,
    Trash2,
} from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'users' | 'categories' | 'statuses'>('users');

    const tabs = [
        { id: 'users' as const, label: 'จัดการผู้ใช้', icon: Users },
        { id: 'categories' as const, label: 'จัดการหมวดหมู่', icon: Tag },
        { id: 'statuses' as const, label: 'จัดการสถานะ', icon: List },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-[#2D2D2D]">ตั้งค่าระบบ</h1>
                    <p className="text-[#6B7280] mt-1">จัดการผู้ใช้ หมวดหมู่ และสถานะคำสั่งซื้อ</p>
                </div>

                {/* Tabs */}
                <div className="card">
                    <div className="border-b border-[#E5E7EB]">
                        <div className="flex gap-2 p-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                                                ? 'bg-[#FFB84D] text-white shadow-lg'
                                                : 'text-[#6B7280] hover:bg-[#FFF5E6]'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-[#2D2D2D]">ผู้ใช้งานระบบ</h2>
                                    <button className="btn-primary flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        เพิ่มผู้ใช้
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ชื่อ</th>
                                                <th>อีเมล</th>
                                                <th>บทบาท</th>
                                                <th>วันที่สร้าง</th>
                                                <th className="text-center">จัดการ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="font-medium">Admin User</td>
                                                <td>admin@ecommerce.com</td>
                                                <td>
                                                    <span className="badge badge-success">Admin</span>
                                                </td>
                                                <td className="text-sm text-[#6B7280]">
                                                    {new Date().toLocaleDateString('th-TH')}
                                                </td>
                                                <td>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button className="p-2 hover:bg-[#FFF5E6] rounded-lg transition-colors">
                                                            <Edit className="w-4 h-4 text-blue-600" />
                                                        </button>
                                                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="text-center py-8 text-sm text-[#6B7280]">
                                    <Users className="w-12 h-12 text-[#E5E7EB] mx-auto mb-2" />
                                    <p>ฟีเจอร์จัดการผู้ใช้จะพร้อมใช้งานเร็วๆ นี้</p>
                                </div>
                            </div>
                        )}

                        {/* Categories Tab */}
                        {activeTab === 'categories' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-[#2D2D2D]">หมวดหมู่สินค้า</h2>
                                    <button className="btn-primary flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        เพิ่มหมวดหมู่
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {['Electronics', 'Clothing', 'Home & Garden'].map((category, index) => (
                                        <div key={index} className="card p-4 hover:shadow-lg transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-[#2D2D2D] mb-1">{category}</h3>
                                                    <p className="text-sm text-[#6B7280]">
                                                        {index === 0 && 'Electronic devices and accessories'}
                                                        {index === 1 && 'Fashion and apparel'}
                                                        {index === 2 && 'Home improvement and garden supplies'}
                                                    </p>
                                                    <span className="badge badge-success mt-2">เปิดใช้งาน</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button className="p-2 hover:bg-[#FFF5E6] rounded-lg transition-colors">
                                                        <Edit className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Order Statuses Tab */}
                        {activeTab === 'statuses' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-[#2D2D2D]">สถานะคำสั่งซื้อ</h2>
                                    <button className="btn-primary flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        เพิ่มสถานะ
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { name: 'รอชำระเงิน', color: '#EF4444', index: 1 },
                                        { name: 'รอจัดเตรียม', color: '#F59E0B', index: 2 },
                                        { name: 'กำลังแพ็คสินค้า', color: '#FFB84D', index: 3 },
                                        { name: 'พร้อมจัดส่ง', color: '#3B82F6', index: 4 },
                                        { name: 'กำลังจัดส่ง', color: '#8B5CF6', index: 5 },
                                        { name: 'จัดส่งสำเร็จ', color: '#10B981', index: 6 },
                                        { name: 'ยกเลิก', color: '#6B7280', index: 7 },
                                    ].map((status) => (
                                        <div
                                            key={status.index}
                                            className="card p-4 flex items-center justify-between hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl font-bold text-[#6B7280]">
                                                    {status.index}
                                                </span>
                                                <div>
                                                    <h3 className="font-semibold text-[#2D2D2D]">{status.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div
                                                            className="w-4 h-4 rounded-full"
                                                            style={{ backgroundColor: status.color }}
                                                        />
                                                        <span className="text-sm text-[#6B7280]">{status.color}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-[#FFF5E6] rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
