'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { CheckCircle2, Clock, ShieldCheck, Smartphone, AlertTriangle } from 'lucide-react';

interface PaymentPageProps {
    params: Promise<{ orderId: string }>;
}

export default function PaymentPage({ params }: PaymentPageProps) {
    const [orderId, setOrderId] = useState<string | null>(null);
    const router = useRouter();
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
                <div className="bg-blue-600 p-6 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10"></div>

                    <h2 className="text-2xl font-bold relative z-10">ชำระเงินผ่าน QR Code</h2>
                    <p className="text-blue-100 text-sm mt-1 relative z-10">PromptPay / Mobile Banking</p>
                </div>

                <div className="p-8 text-center">
                    {/* Timer Alert */}
                    <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-semibold animate-pulse">
                        <Clock className="w-4 h-4" />
                        เหลือเวลาชำระเงิน {formatTime(timeLeft)} นาที
                    </div>

                    {/* QR Code Section */}
                    <div className="relative inline-block p-4 bg-white border-2 border-blue-100 rounded-2xl shadow-inner mb-6 group">
                        {qrData?.qrUrl ? (
                            <img
                                src={qrData.qrUrl}
                                alt="Payment QR"
                                className="w-64 h-64 object-contain mix-blend-multiply"
                            />
                        ) : (
                            <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded-xl text-gray-400">
                                QR Error
                            </div>
                        )}
                        {/* Logo Overlay */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-lg shadow-md">
                            <Smartphone className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="space-y-1 mb-8">
                        <p className="text-gray-500 text-sm">ยอดชำระทั้งหมด</p>
                        <p className="text-4xl font-bold text-gray-900">
                            ฿{qrData?.amount?.toLocaleString() || '0.00'}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        ระบบตรวจสอบยอดโอนอัตโนมัติ 24 ชม.
                    </div>

                    {/* Simulation Section (Demo Only) */}
                    <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Developers Mode &nbsp;(Demo)</p>
                        <button
                            onClick={simulatePay}
                            className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 font-mono text-sm"
                        >
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            [Demo] กดเพื่อจำลองการโอนสำเร็จ
                        </button>
                        <p className="text-[10px] text-gray-400 mt-2 text-center">
                            *ในระบบจริง ปุ่มนี้จะไม่มี ลูกค้าต้องสแกนจ่ายผ่านแอปธนาคาร
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
