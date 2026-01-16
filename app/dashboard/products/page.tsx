'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Plus, Search, Edit, Trash2, X, Upload, Check, ChevronDown,
    AlertCircle, Image as ImageIcon, MoreVertical, Loader2, Tag
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    sku: string;
    images: string;
    categoryId: string;
    isActive: boolean;
    category?: Category;
    tags?: string;
    discountValue?: number;
    discountType?: string;
}

interface ProductFormData {
    productName: string;
    sku: string;
    categoryId: string;
    description: string;
    price: string;
    stockQuantity: string;
    imageUrls: string[];
    tags: string[];
    isActive: boolean;
    discountValue: string;
    discountType: 'PERCENT' | 'FIXED';
}

const initialFormState: ProductFormData = {
    productName: '',
    sku: '',
    categoryId: '',
    description: '',
    price: '',
    stockQuantity: '',
    imageUrls: [],
    tags: [],
    isActive: true,
    discountValue: '',
    discountType: 'PERCENT'
};

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [availableTags, setAvailableTags] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProductFormData>(initialFormState);
    const [uploading, setUploading] = useState(false);

    // Category & Tag Management State
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [newTagName, setNewTagName] = useState('');
    const [editingTag, setEditingTag] = useState<{ id: string, name: string } | null>(null);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchTags();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/products?limit=100'); // Get more for now
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            Swal.fire('Error', 'Failed to fetch products', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchTags = async () => {
        try {
            const res = await fetch('/api/tags');
            if (res.ok) {
                const data = await res.json();
                setAvailableTags(data || []);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setCurrentProductId(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (product: Product) => {
        let imageUrls: string[] = [];
        try {
            imageUrls = product.images ? JSON.parse(product.images) : [];
        } catch (e) {
            imageUrls = [];
        }

        setFormData({
            productName: product.name,
            sku: product.sku,
            categoryId: product.categoryId,
            description: product.description || '',
            price: product.price.toString(),
            stockQuantity: product.stock.toString(),
            imageUrls: imageUrls,
            tags: product.tags ? (Array.isArray(product.tags) ? product.tags.map((t: any) => t.name) : []) : [],
            isActive: product.isActive,
            discountValue: product.discountValue ? product.discountValue.toString() : '',
            discountType: (product.discountType as 'PERCENT' | 'FIXED') || 'PERCENT'
        });
        setCurrentProductId(product.id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleToggleActive = () => {
        setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            setUploading(true);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setFormData(prev => ({
                        ...prev,
                        imageUrls: [...prev.imageUrls, data.url]
                    }));
                } else {
                    Swal.fire('Error', 'Upload failed: ' + data.message, 'error');
                }
            } else {
                Swal.fire('Error', 'Upload failed', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            Swal.fire('Error', 'Upload error', 'error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.currentTarget.value.trim();
            if (val && !formData.tags.includes(val)) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, val]
                }));
                e.currentTarget.value = '';
            }
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.productName || !formData.sku || !formData.categoryId || !formData.price || !formData.stockQuantity) {
            Swal.fire('Warning', 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, SKU, หมวดหมู่, ราคา, สต็อก)', 'warning');
            return;
        }

        const payload = {
            productName: formData.productName,
            sku: formData.sku,
            categoryId: formData.categoryId,
            description: formData.description,
            price: parseFloat(formData.price),
            stockQuantity: parseInt(formData.stockQuantity),
            imageUrls: formData.imageUrls,
            tags: formData.tags,
            isActive: formData.isActive,
            discountValue: formData.discountValue,
            discountType: formData.discountType
        };

        try {
            let res;
            if (isEditing && currentProductId) {
                // Update
                res = await fetch(`/api/products/${currentProductId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                // Create
                res = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'แก้ไขสินค้าสำเร็จ' : 'เพิ่มสินค้าสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                });
                setIsModalOpen(false);
                fetchProducts();
            } else {
                const errorData = await res.json();
                Swal.fire('Error', errorData.message || 'Operation failed', 'error');
            }
        } catch (error) {
            console.error('Submit error:', error);
            Swal.fire('Error', 'Something went wrong', 'error');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: `คุณต้องการลบสินค้า "${name}" ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบสินค้า',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/products/${id}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    Swal.fire('Deleted!', 'ลบสินค้าเรียบร้อยแล้ว', 'success');
                    fetchProducts();
                } else {
                    const errorData = await res.json();
                    Swal.fire('Error', `Failed to delete: ${errorData.message}`, 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Delete operation failed', 'error');
            }
        }
    };

    // --- Category Management Handlers ---
    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            if (editingCategory) {
                // Update Mode
                const res = await fetch(`/api/categories/${editingCategory.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newCategoryName })
                });
                if (res.ok) {
                    Swal.fire({ icon: 'success', title: 'แก้ไขหมวดหมู่สำเร็จ', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                }
            } else {
                // Create Mode
                const res = await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newCategoryName })
                });
                if (res.ok) {
                    Swal.fire({ icon: 'success', title: 'เพิ่มหมวดหมู่สำเร็จ', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                }
            }
            // Reset
            setNewCategoryName('');
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const startEditCategory = (category: Category) => {
        setEditingCategory(category);
        setNewCategoryName(category.name);
    };

    const cancelEditCategory = () => {
        setEditingCategory(null);
        setNewCategoryName('');
    };

    const handleDeleteCategory = async (id: string) => {
        const result = await Swal.fire({
            title: 'ลบหมวดหมู่?',
            text: "หากหมวดหมู่นี้มีสินค้าอยู่ จะไม่สามารถลบได้",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ลบเลย',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    fetchCategories();
                    Swal.fire('Deleted!', 'ลบหมวดหมู่เรียบร้อย', 'success');
                } else {
                    const data = await res.json();
                    Swal.fire('Failed', data.message || 'ลบไม่สำเร็จ', 'error');
                }
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    // --- Tag Management Handlers ---
    const handleTagSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        try {
            if (editingTag) {
                // Update
                const res = await fetch(`/api/tags/${editingTag.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newTagName })
                });
                if (res.ok) {
                    Swal.fire({ icon: 'success', title: 'แก้ไขป้ายสินค้าสำเร็จ', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                }
            } else {
                // Create
                const res = await fetch('/api/tags', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newTagName })
                });
                if (res.ok) {
                    Swal.fire({ icon: 'success', title: 'เพิ่มป้ายสินค้าสำเร็จ', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                }
            }
            // Reset
            setNewTagName('');
            setEditingTag(null);
            fetchTags();
        } catch (error) {
            console.error('Error saving tag:', error);
        }
    };

    const startEditTag = (tag: { id: string, name: string }) => {
        setEditingTag(tag);
        setNewTagName(tag.name);
    };

    const cancelEditTag = () => {
        setEditingTag(null);
        setNewTagName('');
    };

    const handleDeleteTag = async (id: string) => {
        const result = await Swal.fire({
            title: 'ลบป้ายสินค้า?',
            text: "คุณต้องการลบป้ายสินค้านี้ใช่หรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ลบเลย',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    fetchTags();
                    Swal.fire('Deleted!', 'ลบป้ายสินค้าเรียบร้อย', 'success');
                } else {
                    Swal.fire('Failed', 'ลบไม่สำเร็จ', 'error');
                }
            } catch (error) {
                console.error('Error deleting tag:', error);
            }
        }
    };

    // Filters
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">จัดการสินค้า</h1>
                        <p className="text-gray-500 mt-1">เพิ่ม ลบ แก้ไข รายการสินค้าในร้านค้าของคุณ</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all"
                        >
                            จัดการหมวดหมู่
                        </button>
                        <button
                            onClick={() => setIsTagModalOpen(true)}
                            className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all"
                        >
                            จัดการป้ายสินค้า
                        </button>
                        <button
                            onClick={handleOpenAddModal}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            เพิ่มสินค้าใหม่
                        </button>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 flex items-center gap-3 px-4 py-2.5 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white transition-all">
                        <Search className="text-gray-400 w-5 h-5 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="ค้นหาสินค้าด้วยชื่อ หรือ SKU..."
                            className="flex-1 border-none outline-none font-sans bg-transparent placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {/* Add more filters here if needed */}
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex justify-center items-center text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mr-2" />
                            กำลังโหลดข้อมูล...
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>ไม่พบรายการสินค้า</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        <th className="px-6 py-4">สินค้า</th>
                                        <th className="px-6 py-4">SKU</th>
                                        <th className="px-6 py-4">หมวดหมู่</th>
                                        <th className="px-6 py-4 text-right">ราคา</th>
                                        <th className="px-6 py-4 text-center">สต็อก</th>
                                        <th className="px-6 py-4 text-center">สถานะ</th>
                                        <th className="px-6 py-4 text-right">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.map((product) => {
                                        let images: string[] = [];
                                        try { images = JSON.parse(product.images); } catch (e) { }
                                        const mainImage = images[0] || null;

                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                            {mainImage ? (
                                                                <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <ImageIcon className="w-6 h-6" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{product.name}</p>
                                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-mono text-gray-600">{product.sku}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                                                        {product.category?.name || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                    ฿{Number(product.price).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock > 10 ? 'bg-green-100 text-green-700' :
                                                        product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {product.isActive ? (
                                                        <span className="text-green-600 flex justify-center"><Check className="w-5 h-5" /></span>
                                                    ) : (
                                                        <span className="text-gray-400 flex justify-center"><X className="w-5 h-5" /></span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenEditModal(product)}
                                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="แก้ไข"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id, product.name)}
                                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="ลบ"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* --- Category Management Modal --- */}
                {isCategoryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingCategory ? 'แก้ไขหมวดหมู่' : 'จัดการหมวดหมู่'}
                                </h2>
                                <button onClick={() => { setIsCategoryModalOpen(false); cancelEditCategory(); }}><X className="w-6 h-6 text-gray-400" /></button>
                            </div>
                            <div className="p-6">
                                {/* Add/Edit Form */}
                                <form onSubmit={handleCategorySubmit} className="flex gap-2 mb-6">
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder={editingCategory ? "แก้ไขชื่อหมวดหมู่..." : "ชื่อหมวดหมู่ใหม่..."}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${editingCategory ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        {editingCategory ? 'บันทึก' : 'เพิ่ม'}
                                    </button>
                                    {editingCategory && (
                                        <button
                                            type="button"
                                            onClick={cancelEditCategory}
                                            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 font-medium"
                                        >
                                            ยกเลิก
                                        </button>
                                    )}
                                </form>

                                {/* List */}
                                <div className="max-h-[300px] overflow-y-auto space-y-2">
                                    {categories.map(cat => (
                                        <div key={cat.id} className={`flex justify-between items-center p-3 rounded-lg group transition-colors ${editingCategory?.id === cat.id ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                            <span className="font-medium text-gray-700">{cat.name}</span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEditCategory(cat)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="แก้ไข"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="ลบ"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {categories.length === 0 && <p className="text-center text-gray-400 py-4">ยังไม่มีหมวดหมู่</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Tag Management Modal --- */}
                {isTagModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingTag ? 'แก้ไขป้ายสินค้า' : 'จัดการป้ายสินค้า (Tags)'}
                                </h2>
                                <button onClick={() => { setIsTagModalOpen(false); cancelEditTag(); }}><X className="w-6 h-6 text-gray-400" /></button>
                            </div>
                            <div className="p-6">
                                {/* Add/Edit Form */}
                                <form onSubmit={handleTagSubmit} className="flex gap-2 mb-6">
                                    <input
                                        type="text"
                                        value={newTagName}
                                        onChange={(e) => setNewTagName(e.target.value)}
                                        placeholder={editingTag ? "แก้ไขชื่อป้าย..." : "ชื่อป้ายสินค้าใหม่..."}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${editingTag ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        {editingTag ? 'บันทึก' : 'เพิ่ม'}
                                    </button>
                                    {editingTag && (
                                        <button
                                            type="button"
                                            onClick={cancelEditTag}
                                            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 font-medium"
                                        >
                                            ยกเลิก
                                        </button>
                                    )}
                                </form>

                                {/* List */}
                                <div className="max-h-[300px] overflow-y-auto space-y-2">
                                    {availableTags.map(tag => (
                                        <div key={tag.id} className={`flex justify-between items-center p-3 rounded-lg group transition-colors ${editingTag?.id === tag.id ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-blue-500" />
                                                <span className="font-medium text-gray-700">{tag.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEditTag(tag)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="แก้ไข"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTag(tag.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="ลบ"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {availableTags.length === 0 && <p className="text-center text-gray-400 py-4">ยังไม่มีป้ายสินค้า</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Product Modal Form --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {isEditing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="productName"
                                            value={formData.productName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="เช่น กุ้งแม่น้ำเผา ขนาดใหญ่"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">รหัสสินค้า (SKU) <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase font-mono"
                                            placeholder="SKU-001"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ <span className="text-red-500">*</span></label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            required
                                        >
                                            <option value="">-- เลือกหมวดหมู่ --</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Pricing & Stock */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท) <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนสต็อก <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            name="stockQuantity"
                                            value={formData.stockQuantity}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="0"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Discount Section */}
                                <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                                    <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                        ตั้งค่าส่วนลดโปรโมชั่น
                                    </label>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left: Input Control */}
                                        <div className="w-full">
                                            <label className="text-xs font-bold text-gray-500 mb-1.5 block">จำนวนที่ต้องการลด</label>
                                            <div className="flex h-[52px] shadow-sm rounded-xl overflow-hidden border border-gray-200 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100 transition-all bg-white">
                                                <input
                                                    type="text"
                                                    name="discountValue"
                                                    value={formData.discountValue}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                            setFormData(prev => ({ ...prev, discountValue: val }));
                                                        }
                                                    }}
                                                    className="flex-1 w-full px-4 text-lg font-bold text-gray-800 placeholder:text-gray-300 outline-none h-full"
                                                    placeholder="0"
                                                />
                                                <div className="border-l border-gray-100 bg-gray-50/50 hover:bg-gray-100 h-full relative group/select cursor-pointer transition-colors">
                                                    <select
                                                        name="discountType"
                                                        value={formData.discountType}
                                                        onChange={handleInputChange}
                                                        className="h-full pl-3 pr-8 text-sm font-bold text-gray-600 bg-transparent outline-none cursor-pointer appearance-none z-10 relative"
                                                    >
                                                        <option value="PERCENT">% เปอร์เซ็นต์</option>
                                                        <option value="FIXED">฿ บาท</option>
                                                    </select>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        <ChevronDown className="w-3 h-3" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Price Preview (Balanced Height) */}
                                        <div className="w-full">
                                            <label className="text-xs font-bold text-gray-500 mb-1.5 block">สรุปราคาขาย (Net Price)</label>
                                            <div className="h-[52px] bg-white rounded-xl border border-orange-200 shadow-sm flex items-center justify-between px-4">
                                                {/* Logic to Show Price */}
                                                {(formData.discountValue && Number(formData.discountValue) > 0) ? (
                                                    // Case: Discount Active
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-400 line-through decoration-gray-300">
                                                                ฿{Number(formData.price || 0).toLocaleString()}
                                                            </span>
                                                            <div className="w-px h-4 bg-gray-200"></div>
                                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-lg">
                                                                -{formData.discountType === 'PERCENT' ? `${formData.discountValue}%` : `${Number(formData.discountValue || 0).toLocaleString()}฿`}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-sm font-bold text-orange-500">฿</span>
                                                            <span className="text-2xl font-black text-orange-600 tracking-tight leading-none">
                                                                {(() => {
                                                                    const price = parseFloat(formData.price || '0');
                                                                    const val = parseFloat(formData.discountValue);
                                                                    let final = price;
                                                                    if (formData.discountType === 'PERCENT') final = price - (price * val / 100);
                                                                    else final = price - val;
                                                                    return Math.max(0, final).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                                                                })()}
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    // Case: No Discount
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="text-sm text-gray-400">ราคาปกติ</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-sm font-bold text-gray-600">฿</span>
                                                            <span className="text-xl font-bold text-gray-800 leading-none">
                                                                {Number(formData.price || 0).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-[10px] text-gray-400">
                                        * สามารถพิมพ์ราคาขายที่ต้องการได้เลย ระบบจะคำนวณส่วนลดให้อัตโนมัติ
                                    </p>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสินค้า</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                        placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับสินค้า..."
                                    ></textarea>
                                </div>

                                {/* Tags Input */}
                                <div>
                                    {/* Tags Input Section (Premium Login Style) */}
                                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">ป้ายสินค้า (Tags)</label>

                                        {/* Selected Tags Display */}
                                        <div className="flex flex-wrap gap-2 mb-3 min-h-[32px] p-2 bg-white rounded-xl border border-gray-200">
                                            {formData.tags.length === 0 && <span className="text-gray-400 text-sm py-1 pl-1">ยังไม่มีป้ายสินค้า...</span>}
                                            {formData.tags.map((tag, index) => (
                                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200 shadow-sm animate-in zoom-in duration-200">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-2 w-4 h-4 rounded-full bg-blue-200 text-blue-600 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>

                                        <div className="space-y-3">
                                            {/* Dropdown Select (Main Interaction - Match Category Style) */}
                                            <div>
                                                <select
                                                    value=""
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val && !formData.tags.includes(val)) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                tags: [...prev.tags, val]
                                                            }));
                                                        }
                                                        e.target.value = ""; // Reset select
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white font-sans text-gray-700 h-[42px]"
                                                >
                                                    <option value="">-- เลือกป้ายสินค้า --</option>
                                                    {availableTags.map(tag => (
                                                        <option
                                                            key={tag.id}
                                                            value={tag.name}
                                                            disabled={formData.tags.includes(tag.name)}
                                                            className="py-1"
                                                        >
                                                            {tag.name} {formData.tags.includes(tag.name) ? '(เลือกแล้ว)' : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Manual Create Input (Secondary) */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 text-xs whitespace-nowrap">หรือ สร้างใหม่:</span>
                                                <input
                                                    type="text"
                                                    className="flex-1 py-1 px-3 text-sm border-b border-gray-300 bg-transparent placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                                                    placeholder="พิมพ์ชื่อป้าย แล้วกด Enter..."
                                                    onKeyDown={handleAddTag}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพสินค้า</label>

                                    <div className="flex flex-wrap gap-3 mb-3">
                                        {formData.imageUrls.map((url, index) => (
                                            <div key={index} className="relative w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden group">
                                                <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}

                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                                        >
                                            {uploading ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 mb-1" />
                                                    <span className="text-[10px]">อัปโหลด</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <p className="text-xs text-gray-500">รองรับไฟล์ JPG, PNG. ขนาดแนะนำ 800x800px.</p>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div
                                        onClick={handleToggleActive}
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">เปิดขายสินค้านี้ (Active)</span>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
                                    >
                                        {isEditing ? 'บันทึกการแก้ไข' : 'ยืนยันการเพิ่ม'}
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
