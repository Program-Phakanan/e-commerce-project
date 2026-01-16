'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    ShoppingBag,
    User,
    CreditCard
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { name: 'แดชบอร์ด', path: '/dashboard', icon: LayoutDashboard },
        { name: 'สินค้า', path: '/dashboard/products', icon: Package },
        { name: 'คำสั่งซื้อ', path: '/orders', icon: ShoppingCart },
        { name: 'ผู้ใช้งาน', path: '/dashboard/users', icon: Users },
        { name: 'จัดการการชำระเงิน', path: '/admin/payment', icon: CreditCard },
        { name: 'กิจกรรม (Logs)', path: '/admin/logs', icon: BarChart3 },
        { name: 'แก้ไขโปรไฟล์', path: '/profile', icon: User },
        { name: 'ไปหน้าร้านค้า', path: '/shop', icon: ShoppingBag },
    ];

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-br from-[#FFB84D] to-[#FF9E44] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white w-72 transform transition-transform duration-300 ease-in-out z-40 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo/Brand */}
                    <div className="p-6 border-b border-gray-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FFB84D] to-[#FF9E44] rounded-2xl flex items-center justify-center shadow-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-[#FFB84D] to-[#FF9E44] bg-clip-text text-transparent">
                                    E-commerce
                                </h1>
                                <p className="text-xs text-gray-400 font-medium">Management System</p>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    {user && (
                        <div className="p-6 border-b border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white truncate">{user.name}</p>
                                    <p className="text-xs text-gray-400 font-medium">{user.role}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto">
                        <ul className="space-y-2">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.path;
                                const Icon = item.icon;

                                return (
                                    <li key={item.path}>
                                        <Link
                                            href={item.path}
                                            onClick={() => setIsOpen(false)}
                                            className={`group flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive
                                                ? 'bg-gradient-to-r from-[#FFB84D] to-[#FF9E44] text-white shadow-lg shadow-orange-500/30'
                                                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                                <span className="font-semibold">{item.name}</span>
                                            </div>
                                            {isActive && (
                                                <ChevronRight className="w-4 h-4 text-white" />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-gray-700/50">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3.5 text-gray-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 group"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-semibold">ออกจากระบบ</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Spacer for desktop */}
            <div className="hidden lg:block w-72 flex-shrink-0"></div>
        </>
    );
}
