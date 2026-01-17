'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Swal from 'sweetalert2';
import { CheckCircle2, Clock, ShieldCheck, Smartphone, AlertTriangle } from 'lucide-react';

interface PaymentPageProps {
    params: Promise<{ orderId: string }>;
}

export default function PaymentPage({ params }: PaymentPageProps) {
    const [orderId, setOrderId] = useState<string | null>(null);
    const router = useRouter();
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [qrData, setQrData] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [isPaid, setIsPaid] = useState(false);

    useEffect(() => {
        // Resolve params
        params.then(p => {
            setOrderId(p.orderId);
            initPayment(p.orderId);
        });
    }, [params]);

    const initPayment = async (id: string) => {
        try {
            const res = await fetch('/api/payment/create-qr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: id })
            });

            if (res.ok) {
                const data = await res.json();
                setQrData(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Polling for Status
    useEffect(() => {
        if (!orderId || isPaid) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/payment/check-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId })
                });
                const data = await res.json();
                if (data.isPaid) {
                    setIsPaid(true);
                    clearInterval(interval);
                    handleSuccess();
                }
            } catch (error) {
                console.error(error);
            }
        }, 3000); // Check every 3 seconds

        return () => clearInterval(interval);
    }, [orderId, isPaid]);

    // Timer Countdown
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleSuccess = () => {
        Swal.fire({
            icon: 'success',
            title: 'ชำระเงินสำเร็จ!',
            text: 'ขอบคุณที่ใช้บริการ ระบบได้รับยอดเงินแล้ว',
            timer: 3000,
            showConfirmButton: false
        }).then(() => {
            router.push(`/orders/${orderId}`);
        });
    };

    const handleCancelPayment = async () => {
        if (!orderId) return;

        const result = await Swal.fire({
            title: 'ยกเลิกรายการนี้?',
            text: 'สินค้าจะถูกนำกลับเข้าตะกร้าสินค้าของคุณ',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ยกเลิกรายการ',
            cancelButtonText: 'กลับไปชำระเงิน',
            confirmButtonColor: '#d33'
        });

        if (result.isConfirmed) {
            try {
                // 1. Fetch Order Details to get items
                // We use the public GET order API
                const orderRes = await fetch(`/api/orders/${orderId}`);
                if (!orderRes.ok) throw new Error('Failed to fetch order details');
                const orderData = await orderRes.json();

                // 2. Add items back to cart
                if (orderData.items && Array.isArray(orderData.items)) {
                    // Reverse loop or just add
                    orderData.items.forEach((item: any) => {
                        // We need product details (name, price, image) which should be in the order item or product relation
                        // The order details API usually includes product info.
                        // Assuming item structure has product: { name, images, price }
                        if (item.product) {
                            addToCart({
                                id: item.productId,
                                name: item.product.name,
                                price: Number(item.price || item.product?.price),
                                image: item.product.images ? JSON.parse(item.product.images)[0] : '', // Handle image array
                            }, item.quantity);
                        }
                    });
                }

                // 3. Mark order as Cancelled (Soft Delete)
                await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });

                // 4. Redirect to Cart
                Swal.fire({
                    icon: 'success',
                    title: 'ยกเลิกรายการแล้ว',
                    text: 'สินค้าถูกนำกลับเข้าตะกร้าเรียบร้อย',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    router.push('/shop'); // Or /cart if we have one, assuming shop acts as main
                });

            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'เกิดข้อผิดพลาดในการยกเลิก', 'error');
            }
        }
    };

    // Debug Button
    const simulatePay = async () => {
        if (!orderId) return;
        await fetch('/api/payment/simulate-success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
        });
        // Polling will catch the change
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 mb-10">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">กำลังสร้าง QR Code...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden relative">

                {/* Header */}
                <div className="bg-[#003D69] p-6 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/PromptPay_logo.png/800px-PromptPay_logo.png"
                            alt="PromptPay"
                            className="h-10 mb-3 brightness-0 invert drop-shadow-sm"
                        />
                        <h2 className="text-xl font-bold">สแกนจ่ายด้วย QR Code</h2>
                        <p className="text-blue-100 text-sm mt-1">โมบายแบงค์กิ้ง (ทุกธนาคาร)</p>
                    </div>
                </div>

                <div className="p-8 text-center">
                    {/* Timer Alert */}
                    <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-semibold animate-pulse border border-orange-100">
                        <Clock className="w-4 h-4" />
                        เหลือเวลาอีก {formatTime(timeLeft)} นาที
                    </div>

                    {/* QR Code Section */}
                    <div className="relative inline-block p-4 bg-white border-2 border-[#003D69]/20 rounded-2xl shadow-inner mb-6 group">
                        {qrData?.qrUrl ? (
                            <img
                                src={qrData.qrUrl}
                                alt="Payment QR"
                                className="w-64 h-64 object-contain mix-blend-multiply"
                            />
                        ) : (
                            <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded-xl text-gray-400">
                                <div className="text-center">
                                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    <span className="text-sm">กำลังโหลด QR...</span>
                                </div>
                            </div>
                        )}
                        {/* Logo Overlay */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-lg shadow-lg border border-gray-100">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/PromptPay_logo.png/800px-PromptPay_logo.png"
                                alt="PromptPay"
                                className="w-10 h-auto"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 mb-8">
                        <p className="text-gray-500 text-sm">ยอดชำระทั้งหมด</p>
                        <p className="text-4xl font-bold text-gray-900">
                            ฿{qrData?.amount?.toLocaleString() || '0.00'}
                        </p>
                    </div>


                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 p-3 rounded-lg mb-6">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        ระบบตรวจสอบยอดโอนอัตโนมัติ 24 ชม.
                    </div>

                    {/* Fallback & Cancel Actions */}
                    <div className="border-t border-gray-100 pt-6 space-y-4">
                        <div className="mt-4">
                            <button
                                onClick={handleCancelPayment}
                                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                            >
                                ยกเลิกและแก้ไขรายการ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
