
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        if (!sessionId || !orderId) {
            router.push('/');
            return;
        }

        // Ideally, verify session with backend here.
        // For now, assume success if redirected here from Stripe.
        // You might want to delay slightly to let Webhook process (if implemented)

        const timer = setTimeout(() => {
            setVerifying(false);
            // Optionally update order status to 'Paid' manually via API if webhook isn't set up yet?
            // But let's stick to simple UI for now.
            updatePaymentStatus();
        }, 1000);

        return () => clearTimeout(timer);
    }, [sessionId, orderId, router]);

    const updatePaymentStatus = async () => {
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentStatus: 'Paid',
                    // orderStatus: 'Paid' // or whatever logic you prefer
                })
            });
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-green-100 rounded-full text-green-600">
                        <CheckCircle className="w-16 h-16" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">ชำระเงินสำเร็จ!</h1>
                <p className="text-gray-500 mb-8">ขอบคุณสำหรับการสั่งซื้อ เราได้รับยอดชำระของท่านเรียบร้อยแล้ว</p>

                <div className="space-y-4">
                    <button
                        onClick={() => router.push(`/orders/${orderId}`)}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                    >
                        ดูรายละเอียดคำสั่งซื้อ
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                    >
                        กลับสู่หน้าหลัก
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
