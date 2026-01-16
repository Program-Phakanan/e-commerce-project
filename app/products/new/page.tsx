'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Package, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';

interface Category {
    id: string;
    name: string;
}

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState({
        productName: '',
        sku: '',
        categoryId: '',
        description: '',
        price: '',
        stockQuantity: '',
        imageUrls: [] as string[],
        isActive: true,
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stockQuantity: parseInt(formData.stockQuantity) || 0,
                }),
            });

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว',
                    timer: 1500,
                    showConfirmButton: false,
                });
                router.push('/products');
            } else {
                const error = await response.json();
                throw new Error(error.message);
            }
        } catch (error: any) {
            await Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error.message || 'ไม่สามารถเพิ่มสินค้าได้',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUrlAdd = () => {
        Swal.fire({
            title: 'เพิ่ม URL รูปภาพ',
            input: 'url',
            inputPlaceholder: 'https://example.com/image.jpg',
            showCancelButton: true,
            confirmButtonText: 'เพิ่ม',
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                setFormData({
                    ...formData,
                    imageUrls: [...formData.imageUrls, result.value],
                });
            }
        });
    };

    const handleImageRemove = (index: number) => {
        setFormData({
            ...formData,
            imageUrls: formData.imageUrls.filter((_, i) => i !== index),
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2D2D2D]">เพิ่มสินค้าใหม่</h1>
                        <p className="text-[#6B7280] mt-1">กรอกข้อมูลสินค้าให้ครบถ้วน</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <X className="w-5 h-5" />
                        ยกเลิก
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                            ชื่อสินค้า <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.productName}
                            onChange={(e) =>
                                setFormData({ ...formData, productName: e.target.value })
                            }
                            placeholder="กรอกชื่อสินค้า"
                            required
                        />
                    </div>

                    {/* SKU & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                                SKU <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.sku}
                                onChange={(e) =>
                                    setFormData({ ...formData, sku: e.target.value })
                                }
                                placeholder="SKU-001"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                                หมวดหมู่ <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) =>
                                    setFormData({ ...formData, categoryId: e.target.value })
                                }
                                required
                            >
                                <option value="">เลือกหมวดหมู่</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                            รายละเอียดสินค้า
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="กรอกรายละเอียดสินค้า..."
                            rows={4}
                        />
                    </div>

                    {/* Price & Stock */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                                ราคา (บาท) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) =>
                                    setFormData({ ...formData, price: e.target.value })
                                }
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                                จำนวนสต็อก
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.stockQuantity}
                                onChange={(e) =>
                                    setFormData({ ...formData, stockQuantity: e.target.value })
                                }
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                            รูปภาพสินค้า
                        </label>

                        <div className="space-y-4">
                            {/* Image Preview */}
                            {formData.imageUrls.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.imageUrls.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={url}
                                                alt={`Product ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleImageRemove(index)}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Image Button */}
                            <button
                                type="button"
                                onClick={handleImageUrlAdd}
                                className="w-full border-2 border-dashed border-[#E5E7EB] rounded-lg p-8 hover:border-[#FFB84D] hover:bg-[#FFF5E6] transition-colors flex flex-col items-center gap-2"
                            >
                                <Upload className="w-8 h-8 text-[#6B7280]" />
                                <span className="text-sm text-[#6B7280]">
                                    คลิกเพื่อเพิ่ม URL รูปภาพ
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) =>
                                setFormData({ ...formData, isActive: e.target.checked })
                            }
                            className="w-5 h-5 text-[#FFB84D] border-[#E5E7EB] rounded focus:ring-[#FFB84D]"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-[#2D2D2D]">
                            เปิดใช้งานสินค้านี้
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner w-5 h-5 border-2"></div>
                                    <span>กำลังบันทึก...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>บันทึกสินค้า</span>
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn-secondary"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
