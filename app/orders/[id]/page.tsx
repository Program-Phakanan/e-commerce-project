'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2, Clock, Package, MapPin,
    ChevronLeft, Printer, ShoppingBag, CreditCard
} from 'lucide-react';
import Swal from 'sweetalert2';

interface OrderDetail {
    id: string;
    orderNumber: string;
    createdAt: string;
    orderStatus: {
        name: string;
        color: string;
    };
    paymentStatus: string;
    paymentMethod: string;
    totalAmount: string;
    discountAmount: string;
    shippingAddress: string;
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    items: {
        id: string;
        quantity: number;
        price: string;
        total: string;
        product: {
            name: string;
            images: string;
        };
    }[];
}

export default function OrderDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [params.id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                Swal.fire('Error', 'ไม่พบคำสั่งซื้อ', 'error');
                router.push('/shop');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!order) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'text-green-600 bg-green-50 border-green-200';
            case 'Pending': return 'text-orange-600 bg-orange-50 border-orange-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
            <div className="max-w-4xl mx-auto print:max-w-none print:mx-0">
                {/* Back Button (Hidden on Print) */}
                <button
                    onClick={() => router.push('/shop')}
                    className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors group print:hidden"
                >
                    <div className="p-2 bg-white rounded-full shadow-sm mr-2 group-hover:shadow-md transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">กลับไปหน้าสินค้า</span>
                </button>

                {/* Receipt Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden print:shadow-none print:rounded-none border border-gray-200 print:border-none">

                    {/* Header / Brand Area */}
                    <div className="bg-gray-900 text-white p-8 print:bg-white print:text-black print:border-b-2 print:border-gray-800">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                    <ShoppingBag className="w-8 h-8 text-blue-400 print:text-black" />
                                    RECEIPT
                                </h1>
                                <p className="text-gray-400 mt-1 print:text-gray-600">Company Name Co., Ltd.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400 uppercase tracking-wider print:text-gray-600">Order Number</p>
                                <p className="text-2xl font-mono font-bold">{order.orderNumber}</p>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info Bar */}
                    <div className="bg-gray-50 border-b border-gray-200 p-6 flex flex-wrap justify-between items-center gap-4 print:bg-white print:border-none print:pt-2 print:pb-6">
                        <div className="flex gap-8 text-sm">
                            <div>
                                <p className="text-gray-500 font-medium">Date Issued</p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(order.createdAt).toLocaleDateString('th-TH', {
                                        year: 'numeric', month: 'long', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium">Payment Method</p>
                                <p className="font-semibold text-gray-900 uppercase">{order.paymentMethod || 'Unknown'}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 print:hidden">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                {order.paymentStatus}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wide border border-gray-200">
                                {order.orderStatus.name}
                            </span>
                        </div>
                    </div>

                    <div className="p-8 print:p-0 print:mt-4">
                        {/* Address Grid */}
                        <div className="grid md:grid-cols-2 gap-10 mb-10 print:gap-4 print:mb-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">Bill To</h3>
                                <div className="text-sm text-gray-700 space-y-1">
                                    <p className="font-bold text-gray-900 text-lg">{order.customer.name}</p>
                                    <p>{order.customer.email}</p>
                                    <p>{order.customer.phone || '-'}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">Ship To</h3>
                                <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                    {order.shippingAddress || 'Same as billing address'}
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="border rounded-lg overflow-hidden mb-8 print:border-gray-300 print:rounded-none">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 print:bg-white print:border-black">
                                    <tr>
                                        <th className="py-3 px-4 w-1/2">Item Description</th>
                                        <th className="py-3 px-4 text-center">Qty</th>
                                        <th className="py-3 px-4 text-right">Unit Price</th>
                                        <th className="py-3 px-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                                    {order.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-4 px-4">
                                                <p className="font-bold text-gray-900">{item.product.name}</p>
                                                {/* Optional: <p className="text-xs text-gray-400">SKU: {item.product.sku}</p> */}
                                            </td>
                                            <td className="py-4 px-4 text-center text-gray-600">{item.quantity}</td>
                                            <td className="py-4 px-4 text-right text-gray-600">฿{Number(item.price).toLocaleString()}</td>
                                            <td className="py-4 px-4 text-right font-medium text-gray-900">฿{Number(item.total).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Section */}
                        <div className="flex justify-end">
                            <div className="w-full md:w-1/2 lg:w-1/3 space-y-3 print:w-1/2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">฿{Number(order.totalAmount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-medium text-green-600">Free</span>
                                </div>
                                {Number(order.discountAmount) > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount</span>
                                        <span className="font-medium">-฿{Number(order.discountAmount).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="border-t-2 border-gray-900 pt-3 flex justify-between items-center print:border-black">
                                    <span className="text-base font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        ฿{(Number(order.totalAmount) - Number(order.discountAmount)).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer (Print Only or Bottom) */}
                        <div className="mt-12 text-center text-xs text-gray-400 pt-8 border-t border-gray-100 print:mt-8 print:text-black">
                            <p>Thank you for your business!</p>
                            <p className="mt-1">For any inquiries, please contact support@company.com</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-10 flex justify-center gap-4 print:hidden">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors shadow-sm"
                            >
                                <Printer className="w-4 h-4" />
                                Print Receipt
                            </button>
                            {order.paymentStatus === 'Pending' && (
                                <button
                                    onClick={() => router.push(`/checkout/payment/${order.id}`)}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md shadow-blue-200 transition-all"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    Pay Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
