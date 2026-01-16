'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Trash2, Edit2, CreditCard, ToggleLeft, ToggleRight, X, Save } from 'lucide-react';
import Swal from 'sweetalert2';

interface PaymentMethod {
    id: string;
    name: string;
    details: string;
    type: string;
    qrCode: string | null;
    isActive: boolean;
}

export default function AdminPaymentPage() {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        details: '',
        type: 'BANK_TRANSFER', // BANK_TRANSFER, PROMPTPAY, OTHER
        qrCode: ''
    });

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        try {
            const res = await fetch('/api/payment-methods');
            if (res.ok) {
                const data = await res.json();
                setMethods(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingMethod
                ? `/api/payment-methods/${editingMethod.id}`
                : '/api/payment-methods';

            const method = editingMethod ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'บันทึกสำเร็จ',
                    timer: 1500,
                    showConfirmButton: false
                });
                setShowModal(false);
                fetchMethods();
                resetForm();
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการบันทึก', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "ไม่สามารถกู้คืนได้",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
                Swal.fire('ลบแล้ว!', '', 'success');
                fetchMethods();
            } catch (error) {
                Swal.fire('Error', 'ไม่สามารถลบได้', 'error');
            }
        }
    };

    const handleToggleActive = async (method: PaymentMethod) => {
        try {
            await fetch(`/api/payment-methods/${method.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !method.isActive })
            });
            fetchMethods();
        } catch (error) {
            console.error(error);
        }
    };

    const openEdit = (method: PaymentMethod) => {
        setEditingMethod(method);
        setFormData({
            name: method.name,
            details: method.details || '',
            type: method.type,
            qrCode: method.qrCode || ''
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditingMethod(null);
        resetForm();
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            details: '',
            type: 'BANK_TRANSFER',
            qrCode: ''
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">จัดการช่องทางชำระเงิน</h1>
                        <p className="text-gray-500">เพิ่ม/ลบ/แก้ไข ธนาคารและ QR Code</p>
                    </div>
                    <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" /> เพิ่มช่องทางใหม่
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-2xl"></div>)
                    ) : methods.map(method => (
                        <div key={method.id} className={`bg-white p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md relative ${!method.isActive ? 'opacity-75 bg-gray-50' : 'border-gray-100'}`}>

                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${method.type === 'PROMPTPAY' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleToggleActive(method)} className={`transition-colors ${method.isActive ? 'text-green-500' : 'text-gray-400'}`}>
                                        {method.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                    </button>
                                    <button onClick={() => openEdit(method)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(method.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-gray-900">{method.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{method.type}</p>
                            <p className="font-mono bg-gray-50 p-2 rounded border border-gray-100 text-gray-700 text-sm break-all">
                                {method.details}
                            </p>

                            {method.qrCode && (
                                <div className="mt-4 p-2 bg-white border border-gray-100 rounded-lg inline-block shadow-sm">
                                    <img src={method.qrCode} alt="QR" className="w-20 h-20 object-contain" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingMethod ? 'แก้ไขช่องทาง' : 'เพิ่มช่องทางใหม่'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อธนาคาร / ชื่อบัญชี</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        placeholder="เช่น กสิกรไทย, พร้อมเพย์"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                                    >
                                        <option value="BANK_TRANSFER">โอนเงินธนาคาร (Bank Transfer)</option>
                                        <option value="PROMPTPAY">พร้อมเพย์ (PromptPay)</option>
                                        <option value="CREDIT_CARD">บัตรเครดิต (Credit Card)</option>
                                        <option value="OTHER">อื่นๆ (Other)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด (เลขบัญชี / เบอร์โทร)</label>
                                    <textarea
                                        required
                                        value={formData.details}
                                        onChange={e => setFormData({ ...formData, details: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
                                        placeholder="เช่น 123-4-56789-0 สาขาสยาม"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">QR Code URL (ถ้ามี)</label>
                                    <input
                                        type="text"
                                        value={formData.qrCode}
                                        onChange={e => setFormData({ ...formData, qrCode: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        placeholder="https://example.com/qr.png"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">*ใส่ URL ของรูปภาพ QR Code</p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 px-4 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        บันทึก
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
