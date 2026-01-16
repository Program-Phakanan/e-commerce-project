'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Swal from 'sweetalert2';
import { ArrowLeft, CreditCard, MapPin, ShieldCheck, Loader2, Tag } from 'lucide-react';

interface PaymentMethod {
    id: string;
    name: string;
    details: string | null;
    type: string;
    qrCode: string | null;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { items, totalPrice, clearCart } = useCart();

    const [loading, setLoading] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        userEmail: user?.email || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        paymentMethod: '' // Will be set to first available method ID
    });

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, message: string } | null>(null);

    useEffect(() => {
        if (items.length === 0) {
            router.push('/shop');
        }
        fetchSavedAddresses();
        fetchPaymentMethods();
    }, [items, router]);

    const fetchSavedAddresses = async () => {
        try {
            const res = await fetch('/api/user/addresses');
            if (res.ok) {
                const data = await res.json();
                setSavedAddresses(data);
                const defaultAddr = data.find((a: any) => a.isDefault);
                if (defaultAddr && !formData.firstName) {
                    fillAddress(defaultAddr);
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const res = await fetch('/api/payment-methods?activeOnly=true');
            if (res.ok) {
                const data = await res.json();
                setPaymentMethods(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, paymentMethod: data[0].id }));
                }
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        }
    };

    const fillAddress = (addr: any) => {
        setFormData(prev => ({
            ...prev,
            firstName: addr.firstName,
            lastName: addr.lastName,
            phone: addr.phone,
            address: addr.addressLine,
            city: addr.city,
            zipCode: addr.zipCode
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        try {
            const res = await fetch('/api/checkout/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, cartTotal: totalPrice })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setDiscountAmount(data.discountAmount);
                setAppliedCoupon({ code: data.code, message: data.message });
                Swal.fire({
                    icon: 'success',
                    title: 'ใช้คูปองสำเร็จ!',
                    text: data.message,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000
                });
            } else {
                setDiscountAmount(0);
                setAppliedCoupon(null);
                Swal.fire({
                    icon: 'error',
                    title: 'ใช้คูปองไม่สำเร็จ',
                    text: data.message || 'คูปองไม่ถูกต้อง',
                });
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการตรวจสอบคูปอง', 'error');
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode('');
        setDiscountAmount(0);
        setAppliedCoupon(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            Swal.fire('Error', 'กรุณาเข้าสู่ระบบก่อน', 'error');
            router.push('/login?redirect=/checkout');
            return;
        }

        if (!formData.paymentMethod) {
            Swal.fire('Error', 'กรุณาเลือกวิธีการชำระเงิน', 'error');
            return;
        }

        setLoading(true);

        try {
            const selectedPayment = paymentMethods.find(p => p.id === formData.paymentMethod);

            const orderData = {
                customerId: user.id,
                shippingAddress: `${formData.firstName} ${formData.lastName}\n${formData.address}\n${formData.city} ${formData.zipCode}\nTel: ${formData.phone}`,
                paymentMethod: selectedPayment?.name || 'Unknown',
                paymentStatus: 'Pending',
                notes: appliedCoupon ? `Used Coupon: ${appliedCoupon.code}` : '',
                discountAmount: discountAmount,
                couponCode: appliedCoupon?.code || '',
                orderItems: items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: item.price
                }))
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to create order');
            }

            const data = await res.json();

            clearCart();

            const isQrPayment = selectedPayment?.type === 'PROMPTPAY' || selectedPayment?.type === 'QR_CODE';
            const isStripePayment = selectedPayment?.type === 'CARD';

            if (isStripePayment) {
                Swal.fire({
                    title: 'กำลังเชื่อมต่อ Stripe...',
                    text: 'กรุณารอสักครู่',
                    icon: 'info',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    willOpen: () => {
                        Swal.showLoading();
                    }
                });

                // Call Stripe Checkout API
                const stripeRes = await fetch('/api/payment/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: items,
                        orderId: data.id,
                        userId: user.id,
                        customerEmail: user.email
                    })
                });

                if (!stripeRes.ok) {
                    throw new Error('Failed to initialize Stripe checkout');
                }

                const stripeData = await stripeRes.json();

                // Redirect to Stripe
                window.location.href = stripeData.url;
                return;
            }

            if (isQrPayment) {
                Swal.fire({
                    title: 'เตรียมพร้อมชำระเงิน',
                    text: 'กำลังนำท่านไปหน้าชำระเงินผ่าน QR Code',
                    icon: 'info',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    router.push(`/checkout/payment/${data.id}`);
                });
            } else {
                Swal.fire({
                    title: 'สั่งซื้อสำเร็จ!',
                    text: 'ขอบคุณสำหรับการสั่งซื้อ',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    router.push(`/orders/${data.id}`);
                });
            }
        } catch (error: any) {
            console.error('Error creating order:', error);

            if (error.message && error.message.includes('Product') && error.message.includes('not found')) {
                Swal.fire({
                    title: 'ข้อมูลสินค้ามีการเปลี่ยนแปลง',
                    text: 'มีการอัปเดตระบบฐานข้อมูล ทำให้สินค้าในตะกร้าของคุณไม่ถูกต้อง กรุณาล้างตะกร้าและเลือกสินค้าใหม่',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'ล้างตะกร้า',
                    cancelButtonText: 'ยกเลิก'
                }).then((result) => {
                    if (result.isConfirmed) {
                        clearCart();
                        router.push('/shop');
                    }
                });
            } else {
                Swal.fire('Error', error.message || 'ไม่สามารถสร้างรายการสั่งซื้อได้', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const finalTotal = Math.max(0, totalPrice - discountAmount);

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center mb-8 gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Shipping Address */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">ที่อยู่จัดส่ง</h2>
                                {savedAddresses.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const defaultAddr = savedAddresses.find((a: any) => a.isDefault) || savedAddresses[0];
                                            if (defaultAddr) fillAddress(defaultAddr);
                                        }}
                                        className="ml-auto text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        ใช้ที่อยู่ saved
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อจริง</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required placeholder="บ้านเลขที่, ถนน, ซอย..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">จังหวัด/เขต</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">รหัสไปรษณีย์</label>
                                    <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">วิธีการชำระเงิน</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {paymentMethods.map(method => (
                                    <label key={method.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === method.id ? 'border-blue-500 ring-2 ring-blue-50 bg-blue-50/30' : 'border-gray-200 hover:border-blue-300'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.id}
                                            checked={formData.paymentMethod === method.id}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="ml-3">
                                            <span className="block text-sm font-medium text-gray-900">{method.name}</span>
                                            <span className="block text-xs text-gray-500">{method.details || method.type}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">สรุปรายการสั่งซื้อ</h2>

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                                            {/* Implemented image placeholder or real image logic if available in cart item */}
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                                <Tag className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                                            <p className="text-xs text-gray-500">จำนวน: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">฿{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-3">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>ยอดรวมสินค้า</span>
                                    <span>฿{totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>ค่าจัดส่ง</span>
                                    <span className="text-green-600 font-medium">ฟรี</span>
                                </div>

                                {/* Discount Display */}
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600 animate-in fade-in bg-green-50 p-2 rounded-lg text-sm border border-green-100">
                                        <span className="flex items-center gap-1">
                                            <span className="text-[10px] bg-green-200 px-1.5 py-0.5 rounded text-green-800 font-bold uppercase">{appliedCoupon?.code}</span>
                                            <span>ส่วนลด</span>
                                        </span>
                                        <span>-฿{discountAmount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">ยอดสุทธิ</span>
                                    <span className="text-2xl font-bold text-blue-600">฿{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Coupon Input Section */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">โค้ดส่วนลด</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={!!appliedCoupon}
                                        placeholder="กรอกโค้ดส่วนลด..."
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm uppercase placeholder:normal-case disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-sm"
                                    />
                                    {!appliedCoupon ? (
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={!couponCode.trim()}
                                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors shadow-sm"
                                        >
                                            ใช้โค้ด
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors"
                                        >
                                            ยกเลิก
                                        </button>
                                    )}
                                </div>
                                {appliedCoupon && (
                                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1 animate-in slide-in-from-top-1">
                                        <ShieldCheck className="w-3 h-3" />
                                        {appliedCoupon.message}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full mt-6 bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:bg-gray-400 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        กำลังดำเนินการ...
                                    </>
                                ) : (
                                    <>
                                        ยืนยันการสั่งซื้อ
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                                <ShieldCheck className="w-4 h-4" />
                                ข้อมูลของท่านถูกเข้ารหัสและปลอดภัย 100%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
