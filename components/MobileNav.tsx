'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, ShoppingCart, User, Package, Home } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { totalItems } = useCart();
    const { user } = useAuth();

    // Hide on specific full-screen pages if needed, e.g. login
    if (pathname === '/login' || pathname === '/register') return null;

    const navItems = [
        {
            label: 'หน้าหลัก',
            path: '/shop',
            icon: Home,
            isActive: pathname === '/shop' || pathname === '/'
        },
        {
            label: 'ประวัติ',
            path: '/my-orders',
            icon: Package,
            isActive: pathname === '/my-orders'
        },
        {
            label: 'ตะกร้า',
            path: '/cart',
            icon: ShoppingCart,
            isActive: pathname === '/cart',
            badge: totalItems > 0 ? totalItems : null
        },
        {
            label: 'บัญชี',
            path: '/profile',
            icon: User,
            isActive: pathname === '/profile'
        }
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 pb-safe pt-2 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-around pb-2">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => router.push(item.path)}
                        className={`flex flex-col items-center justify-center p-2 w-16 transition-all duration-300 relative group
                            ${item.isActive ? 'text-blue-600 -translate-y-1' : 'text-gray-400 hover:text-gray-600'}
                        `}
                    >
                        {/* Active Indicator Dot */}
                        {item.isActive && (
                            <span className="absolute -top-2 w-1 h-1 bg-blue-600 rounded-full mb-1"></span>
                        )}

                        <div className="relative">
                            <item.icon
                                className={`w-6 h-6 transition-transform duration-300 ${item.isActive ? 'scale-110 stroke-[2.5px]' : 'stroke-2'}`}
                            />
                            {item.badge && (
                                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border border-white shadow-sm animate-bounce">
                                    {item.badge}
                                </span>
                            )}
                        </div>
                        <span className={`text-[10px] font-medium mt-1 ${item.isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
            {/* Safe Area Spacer for iPhone Home Bar */}
            <div className="h-[env(safe-area-inset-bottom)] bg-white/90"></div>
        </div>
    );
}
