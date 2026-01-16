'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Package,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    AlertTriangle,
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Product {
    id: string;
    productName: string;
    sku: string;
    category: {
        id: string;
        name: string;
    };
    price: number;
    stockQuantity: number;
    isActive: boolean;
    imageUrls: string[];
}

interface Category {
    id: string;
    name: string;
}

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [page, search, categoryFilter, stockFilter, activeFilter]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(search && { search }),
                ...(categoryFilter && { categoryId: categoryFilter }),
                ...(stockFilter && { stockStatus: stockFilter }),
                ...(activeFilter && { isActive: activeFilter }),
            });

            const response = await fetch(`/api/products?${params}`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data.products);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: 'อัพเดทสถานะสินค้าแล้ว',
                    timer: 1500,
                    showConfirmButton: false,
                });
                fetchProducts();
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถอัพเดทสถานะได้',
            });
        }
    };

    const handleUpdateStock = async (id: string, currentStock: number) => {
        const { value: newStock } = await Swal.fire({
            title: 'แก้ไขจำนวนสต็อก',
            input: 'number',
            inputValue: currentStock,
            inputLabel: 'จำนวนสต็อกใหม่',
            showCancelButton: true,
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก',
            inputValidator: (value) => {
                if (!value || parseInt(value) < 0) {
                    return 'กรุณาใส่จำนวนที่ถูกต้อง';
                }
                return null;
            },
        });

        if (newStock !== undefined) {
            try {
                const response = await fetch(`/api/products/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stockQuantity: parseInt(newStock) }),
                });

                if (response.ok) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'สำเร็จ!',
                        text: 'อัพเดทจำนวนสต็อกแล้ว',
                        timer: 1500,
                        showConfirmButton: false,
                    });
                    fetchProducts();
                }
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถอัพเดทสต็อกได้',
                });
            }
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: `คุณต้องการลบสินค้า "${name}" ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/products/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'ลบสำเร็จ!',
                        text: 'ลบสินค้าเรียบร้อยแล้ว',
                        timer: 1500,
                        showConfirmButton: false,
                    });
                    fetchProducts();
                }
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถลบสินค้าได้',
                });
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2D2D2D]">จัดการสินค้า</h1>
                        <p className="text-[#6B7280] mt-1">รายการสินค้าทั้งหมด</p>
                    </div>
                    <button
                        onClick={() => router.push('/products/new')}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        เพิ่มสินค้าใหม่
                    </button>
                </div>

                {/* Filters */}
                <div className="card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อสินค้า หรือ SKU..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="">ทุกหมวดหมู่</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>

                        {/* Stock Filter */}
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                        >
                            <option value="">สถานะสต็อกทั้งหมด</option>
                            <option value="available">มีสินค้า</option>
                            <option value="low">สินค้าใกล้หมด (&lt; 10)</option>
                            <option value="out">สินค้าหมด</option>
                        </select>

                        {/* Active Filter */}
                        <select
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                        >
                            <option value="">สถานะทั้งหมด</option>
                            <option value="true">เปิดใช้งาน</option>
                            <option value="false">ปิดใช้งาน</option>
                        </select>
                    </div>
                </div>

                {/* Products Table */}
                <div className="card p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="spinner"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-[#E5E7EB] mx-auto mb-4" />
                            <p className="text-[#6B7280]">ไม่พบสินค้า</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>รูปภาพ</th>
                                            <th>ชื่อสินค้า</th>
                                            <th>SKU</th>
                                            <th>หมวดหมู่</th>
                                            <th>ราคา</th>
                                            <th>สต็อก</th>
                                            <th>สถานะ</th>
                                            <th className="text-center">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.id}>
                                                <td>
                                                    {product.imageUrls && product.imageUrls[0] ? (
                                                        <img
                                                            src={product.imageUrls[0]}
                                                            alt={product.productName}
                                                            className="w-12 h-12 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-[#E5E7EB] rounded-lg flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-[#6B7280]" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="font-medium">{product.productName}</td>
                                                <td className="font-mono text-sm">{product.sku}</td>
                                                <td>{product.category.name}</td>
                                                <td className="font-semibold">
                                                    ฿{product.price.toLocaleString()}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateStock(product.id, product.stockQuantity)
                                                        }
                                                        className={`font-semibold hover:underline ${product.stockQuantity < 10
                                                                ? 'text-red-600'
                                                                : 'text-green-600'
                                                            }`}
                                                    >
                                                        {product.stockQuantity}
                                                        {product.stockQuantity < 10 && (
                                                            <AlertTriangle className="w-4 h-4 inline ml-1" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() =>
                                                            handleToggleActive(product.id, product.isActive)
                                                        }
                                                        className={`badge ${product.isActive
                                                                ? 'badge-success'
                                                                : 'badge-danger'
                                                            }`}
                                                    >
                                                        {product.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                                    </button>
                                                </td>
                                                <td>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => router.push(`/products/${product.id}`)}
                                                            className="p-2 hover:bg-[#FFF5E6] rounded-lg transition-colors"
                                                            title="ดูรายละเอียด"
                                                        >
                                                            <Eye className="w-4 h-4 text-[#FFB84D]" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                router.push(`/products/${product.id}/edit`)
                                                            }
                                                            className="p-2 hover:bg-[#FFF5E6] rounded-lg transition-colors"
                                                            title="แก้ไข"
                                                        >
                                                            <Edit className="w-4 h-4 text-blue-600" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(product.id, product.productName)
                                                            }
                                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="ลบ"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="btn-secondary disabled:opacity-50"
                                    >
                                        ก่อนหน้า
                                    </button>
                                    <span className="text-sm text-[#6B7280]">
                                        หน้า {page} จาก {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="btn-secondary disabled:opacity-50"
                                    >
                                        ถัดไป
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
