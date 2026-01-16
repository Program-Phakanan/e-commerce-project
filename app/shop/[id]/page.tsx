'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, ArrowLeft, Plus, Minus, ShoppingBag } from 'lucide-react';
import Swal from 'sweetalert2';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string;
    category: {
        name: string;
    };
}

export default function ProductDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        if (params.id) {
            fetchProduct(params.id as string);
        }
    }, [params.id]);

    const fetchProduct = async (id: string) => {
        try {
            const res = await fetch(`/api/products/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProduct(data);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        const images = product.images ? JSON.parse(product.images) : [];
        addToCart(
            {
                id: product.id,
                name: product.name,
                price: Number(product.price),
                image: images[0] || '',
            },
            quantity
        );

        Swal.fire({
            icon: 'success',
            title: 'เพิ่มลงตะกร้าแล้ว!',
            text: `${product.name} จำนวน ${quantity} ชิ้น`,
            timer: 1500,
            showConfirmButton: false,
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">ไม่พบสินค้า</p>
                    <button
                        onClick={() => router.push('/shop')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                    >
                        กลับไปหน้าหลัก
                    </button>
                </div>
            </div>
        );
    }

    const images = product.images ? JSON.parse(product.images) : [];

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
                            <span className="font-semibold">กลับ</span>
                        </button>

                        <button
                            onClick={() => router.push('/cart')}
                            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            <ShoppingCart className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Product Detail */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Images */}
                    <div>
                        <div className="aspect-square bg-white rounded-2xl overflow-hidden mb-4">
                            {images[selectedImage] ? (
                                <img
                                    src={images[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-24 h-24 text-gray-300" />
                                </div>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 ${selectedImage === idx ? 'border-blue-600' : 'border-gray-200'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <p className="text-sm text-blue-600 font-semibold mb-2">{product.category.name}</p>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                        <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

                        <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                            <p className="text-4xl font-bold text-blue-600 mb-2">
                                ฿{Number(product.price).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                                {product.stock > 0 ? (
                                    <span className="text-green-600 font-semibold">
                                        ✓ มีสินค้าพร้อมส่ง ({product.stock} ชิ้น)
                                    </span>
                                ) : (
                                    <span className="text-red-600 font-semibold">✗ สินค้าหมด</span>
                                )}
                            </p>
                        </div>

                        {/* Quantity Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">จำนวน</label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors"
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                                <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    disabled={quantity >= product.stock}
                                    className="p-3 bg-gray-200 rounded-xl hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            <span>เพิ่มลงตะกร้า</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
