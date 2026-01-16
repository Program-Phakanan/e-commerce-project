'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();

    const handleCheckout = () => {
        if (!user) {
            // ถ้ายังไม่ได้ login ให้ไปหน้า login
            router.push('/login?redirect=/checkout');
        } else {
            // ถ้า login แล้วไปหน้า checkout
            router.push('/checkout');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.push('/shop')}
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-semibold">กลับไปช้อปต่อ</span>
                        </button>

                        <h1 className="text-2xl font-bold text-gray-900">ตะกร้าสินค้า</h1>
                    </div>
                </div>
            </header>

            {/* Cart Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {items.length === 0 ? (
                    <div className="text-center py-16">
                        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">ตะกร้าสินค้าว่างเปล่า</h2>
                        <p className="text-gray-600 mb-6">เริ่มช้อปปิ้งเพื่อเพิ่มสินค้าลงตะกร้า</p>
                        <button
                            onClick={() => router.push('/shop')}
                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            เริ่มช้อปปิ้ง
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl p-6 shadow-lg flex items-center gap-6"
                                >
                                    {/* Product Image */}
                                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingBag className="w-8 h-8 text-gray-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                                        <p className="text-blue-600 font-bold text-lg">
                                            ฿{item.price.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-lg font-bold w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Subtotal */}
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 mb-1">รวม</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            ฿{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">สรุปคำสั่งซื้อ</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>ยอดรวมสินค้า</span>
                                        <span>฿{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>ค่าจัดส่ง</span>
                                        <span className="text-green-600 font-semibold">ฟรี</span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                                        <span>ยอดรวมทั้งหมด</span>
                                        <span className="text-blue-600">฿{totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all mb-3"
                                >
                                    {user ? 'ดำเนินการชำระเงิน' : 'เข้าสู่ระบบเพื่อชำระเงิน'}
                                </button>

                                <button
                                    onClick={() => clearCart()}
                                    className="w-full py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold"
                                >
                                    ล้างตะกร้า
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
