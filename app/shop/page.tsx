'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Search, ShoppingBag, Plus, X, Filter, Sparkles, TrendingUp, User, LogOut, LayoutDashboard, LogIn, ChevronRight, Star, Flame, Tag, Package } from 'lucide-react';
import Swal from 'sweetalert2';

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    salePrice: number | null;
    stock: number;
    images: string;
    category: {
        id: string;
        name: string;
    };
    isFeatured: boolean;
    tags: string; // JSON string
}

export default function ShopPage() {
    const router = useRouter();
    const { addToCart, totalItems } = useCart();
    const { user, logout } = useAuth();

    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Search & Filter State
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    // Refs
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                fetch('/api/products?isActive=true'),
                fetch('/api/categories')
            ]);

            if (productsRes.ok) {
                const data = await productsRes.json();
                setProducts(data.products || []);
            }

            if (categoriesRes.ok) {
                const data = await categoriesRes.json();
                setCategories(data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product: Product, e: React.MouseEvent) => {
        e.stopPropagation();
        const images = product.images ? JSON.parse(product.images) : [];
        const finalPrice = product.salePrice ? Number(product.salePrice) : Number(product.price);

        addToCart({
            id: product.id,
            name: product.name,
            price: finalPrice,
            image: images[0] || '',
        });

        const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: false,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });

        Toast.fire({
            icon: 'success',
            title: 'เพิ่มลงตะกร้าแล้ว'
        });
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'ออกจากระบบแล้ว',
            showConfirmButton: false,
            timer: 1500
        });
    };

    // Derived Data
    const featuredProducts = products.filter(p => p.isFeatured || (p.salePrice !== null && Number(p.salePrice) < Number(p.price)));

    // Sort logic can be added here
    const filteredProducts = products.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category.name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const recommendations = search.trim() === '' ? [] : products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5);

    return (
        <div className="min-h-screen bg-slate-50 relative font-sans pb-24 md:pb-20">
            {/* 🌊 Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-white" />
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-[120px] mix-blend-multiply" />
                <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] mix-blend-multiply" />
            </div>

            {/* Content */}
            <div className="relative z-10">

                {/* 1. Header & Navigation (Premium Glass Design) */}
                <header className="bg-white/90 backdrop-blur-md shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border-b border-gray-100 sticky top-0 z-[100]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20">
                            {/* Logo */}
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/shop')}>
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform group-hover:rotate-6 transition-all duration-300">
                                    <ShoppingBag className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-blue-800 leading-none mb-0.5">
                                        Seafood<span className="text-blue-600">Fresh</span>
                                    </h1>
                                    <p className="text-[11px] md:text-xs text-gray-500 font-bold tracking-[0.2em] uppercase">Premium Quality</p>
                                </div>
                            </div>

                            {/* Actions box */}
                            <div className="flex items-center gap-3 md:gap-4">
                                {/* User Profile / Login */}
                                <div className="relative" ref={userMenuRef}>
                                    {user ? (
                                        <button
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            className="flex items-center gap-3 pl-1 pr-4 py-1 bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 rounded-full shadow-sm hover:shadow-md transition-all duration-300 group"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-white ring-1 ring-gray-100 shadow-inner overflow-hidden">
                                                {user.image ? (
                                                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-blue-700 font-black text-sm">{user.username?.[0]?.toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="text-left hidden md:block">
                                                <p className="text-xs text-gray-400 font-semibold leading-none mb-0.5">Hello,</p>
                                                <p className="text-sm font-bold text-gray-800 leading-none group-hover:text-blue-700 transition-colors max-w-[100px] truncate">{user.username}</p>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-90' : ''}`} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => router.push('/login')}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-900/20 hover:-translate-y-0.5 transition-all"
                                        >
                                            <LogIn className="w-4 h-4" />
                                            <span className="hidden sm:inline">เข้าสู่ระบบ</span>
                                        </button>
                                    )}

                                    {/* Dropdown Menu */}
                                    {showUserMenu && user && (
                                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl shadow-blue-900/10 border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
                                            <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 mb-1">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">บัญชีผู้ใช้</p>
                                                <p className="font-bold text-lg text-gray-900 truncate">{user.name || user.username}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email || 'No email'}</p>
                                            </div>
                                            {user.role === 'Admin' && (
                                                <button onClick={() => router.push('/dashboard')} className="w-full text-left px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors">
                                                    <LayoutDashboard className="w-4 h-4" /> แดชบอร์ดผู้ดูแล
                                                </button>
                                            )}
                                            <button onClick={() => router.push('/profile')} className="w-full text-left px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors">
                                                <User className="w-4 h-4" /> แก้ไขโปรไฟล์
                                            </button>
                                            <div className="h-px bg-gray-100 my-1 mx-5"></div>
                                            {/* Logout moved to Navbar */}
                                            {/* <button onClick={handleLogout} ... > ... </button> */}
                                        </div>
                                    )}
                                </div>

                                <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

                                <div className="flex items-center gap-2">
                                    {user && (
                                        <button
                                            onClick={() => router.push('/my-orders')}
                                            className="p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                                            title="ประวัติการสั่งซื้อ"
                                        >
                                            <Package className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                                        </button>
                                    )}

                                    <button onClick={() => router.push('/cart')} className="relative p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                                        <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                                        {totalItems > 0 && (
                                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                                                {totalItems}
                                            </span>
                                        )}
                                    </button>

                                    {user && (
                                        <button
                                            onClick={handleLogout}
                                            className="p-3 bg-white border border-gray-200 rounded-xl hover:border-red-200 hover:bg-red-50 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                                            title="ออกจากระบบ"
                                        >
                                            <LogOut className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 🌊 Hero Search Section (Responsive & Styled) */}
                <div className="relative pt-8 md:pt-12 pb-6 md:pb-10 px-4 mb-4 md:mb-6 z-40">
                    <div className="max-w-3xl mx-auto relative z-10 text-center">
                        <div className="mb-6 md:mb-10 inline-block animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Premium Seafood</span> Delivery
                            </h2>
                            <p className="text-gray-500 text-sm md:text-lg">คัดสรรวัตถุดิบเกรดพรีเมียม ส่งตรงถึงหน้าบ้านคุณ</p>
                        </div>

                        {/* Large Search Bar (Responsive Combo) */}
                        <div className="relative max-w-2xl mx-auto mb-6 md:mb-10 z-50 transition-all" ref={searchContainerRef}>
                            <div className={`relative flex items-center w-full bg-white border-2 rounded-2xl transition-all duration-300 ${search || showRecommendations || showFilter ? 'border-blue-600 ring-2 md:ring-4 ring-blue-100 shadow-xl shadow-blue-500/10' : 'border-gray-200 hover:border-blue-400 shadow-lg shadow-gray-200/50'}`}>
                                <div className="pl-4 md:pl-5 pr-2 md:pr-3 text-gray-400">
                                    <Search className={`h-5 w-5 md:h-6 md:w-6 transition-colors ${search ? 'text-blue-600' : ''}`} />
                                </div>
                                <input
                                    type="text"
                                    className="flex-1 py-3 md:py-4 bg-transparent border-none outline-none text-gray-900 font-medium placeholder:font-normal placeholder:text-gray-400 text-base md:text-lg min-w-0" // text-base prevents iOS zoom
                                    placeholder="ค้นหาเมนู..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setShowRecommendations(true);
                                        setShowFilter(false);
                                    }}
                                    onFocus={() => {
                                        setShowRecommendations(true);
                                        setShowFilter(false);
                                    }}
                                />

                                {search && (
                                    <button
                                        className="p-2 mr-1 rounded-full hover:bg-gray-100 transition-colors"
                                        onClick={() => {
                                            setSearch('');
                                            setShowRecommendations(false);
                                        }}
                                    >
                                        <X className="h-4 w-4 md:h-5 md:w-5 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}

                                {/* Divider */}
                                <div className="h-6 md:h-8 w-px bg-gray-200 mx-1 md:mx-2"></div>

                                {/* Integrated Category Filter (Responsive) */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowFilter(!showFilter);
                                            setShowRecommendations(false);
                                        }}
                                        className="flex items-center gap-2 px-3 md:px-5 py-3 md:py-4 text-gray-700 font-bold hover:bg-gray-50 rounded-r-2xl transition-colors whitespace-nowrap"
                                    >
                                        <span className={`text-sm max-w-[80px] md:max-w-none truncate ${selectedCategory !== 'All' ? 'text-blue-600' : ''}`}>
                                            {selectedCategory === 'All' ? <span className="hidden sm:inline">ทุกหมวดหมู่</span> : selectedCategory}
                                            {selectedCategory === 'All' && <span className="sm:hidden">หมวดหมู่</span>}
                                        </span>
                                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showFilter ? 'rotate-90' : 'rotate-0'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Recommendations Dropdown */}
                            {showRecommendations && search.length > 0 && (
                                <div className="absolute top-full left-0 w-full mt-2 md:mt-3 bg-white rounded-2xl shadow-2xl shadow-blue-900/10 border border-gray-100 overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-3 md:p-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <Sparkles className="w-4 h-4 text-blue-500" />
                                        ผลลัพธ์
                                    </div>
                                    <div className="max-h-[300px] md:max-h-[350px] overflow-y-auto custom-scrollbar">
                                        {recommendations.length > 0 ? (
                                            <ul className="divide-y divide-gray-50">
                                                {recommendations.map((product) => (
                                                    <li
                                                        key={product.id}
                                                        className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                                        onClick={() => {
                                                            router.push(`/shop/${product.id}`);
                                                        }}
                                                    >
                                                        <div className="flex items-center px-4 md:px-5 py-3 md:py-4 gap-3 md:gap-4">
                                                            <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm group-hover:border-blue-200 transition-colors">
                                                                {product.images && JSON.parse(product.images)[0] ? (
                                                                    <img src={JSON.parse(product.images)[0]} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                                                        <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0 text-left">
                                                                <p className="text-sm md:text-base font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{product.name}</p>
                                                                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                                    <Tag className="w-3 h-3" /> {product.category.name}
                                                                </p>
                                                                <div className="mt-1 font-bold text-blue-600 text-sm">
                                                                    ฿{Number(product.salePrice ?? product.price).toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="p-8 md:p-10 text-center">
                                                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Search className="w-6 h-6 md:w-8 md:h-8 text-gray-300" />
                                                </div>
                                                <p className="text-sm md:text-base text-gray-900 font-medium">ไม่พบสินค้า</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Category Filter Dropdown (Merged) */}
                            {showFilter && (
                                <div className="absolute top-full right-0 w-[200px] md:w-[250px] mt-2 md:mt-3 bg-white rounded-2xl shadow-2xl shadow-blue-900/10 border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 p-1.5">
                                    <div className="max-h-[250px] md:max-h-[300px] overflow-y-auto custom-scrollbar">
                                        <button
                                            onClick={() => {
                                                setSelectedCategory('All');
                                                setShowFilter(false);
                                            }}
                                            className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${selectedCategory === 'All' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> ทั้งหมด</span>
                                            {selectedCategory === 'All' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                        </button>

                                        <div className="h-px bg-gray-100 my-1 mx-2"></div>

                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    setSelectedCategory(cat.name);
                                                    setShowFilter(false);
                                                }}
                                                className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${selectedCategory === cat.name ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <span>{cat.name}</span>
                                                {selectedCategory === cat.name && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 space-y-10 md:space-y-16">

                    {/* 2. Promotion / Featured Banner Section (Refined) */}
                    {selectedCategory === 'All' && !search && (
                        <section className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden min-h-[200px] md:min-h-[320px] bg-[#0a192f] shadow-xl md:shadow-2xl flex items-center group">
                            {/* Animated Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 z-10 transition-opacity duration-1000"></div>
                            <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[20s]" />

                            <div className="relative z-20 w-full px-6 py-8 md:px-20 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
                                <div className="text-center md:text-left max-w-xl space-y-3 md:space-y-6">
                                    <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-300 text-[10px] md:text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg shadow-yellow-500/10">
                                        <Flame className="w-3 h-3 md:w-3.5 md:h-3.5 fill-yellow-300" /> Exclusive Offer
                                    </div>
                                    <h2 className="text-3xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl">
                                        Seafood <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">Festival</span>
                                    </h2>
                                    <p className="text-blue-100/90 text-sm md:text-lg font-light max-w-md leading-relaxed hidden md:block">
                                        พบกับเทศกาลอาหารทะเลสดใหม่ ลดสูงสุด 30% พร้อมส่งด่วนใน 1 ชั่วโมง
                                    </p>
                                    <button
                                        onClick={() => {
                                            const el = document.getElementById('product-grid');
                                            el?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="mt-2 md:mt-6 px-6 md:px-10 py-3 md:py-4 bg-white text-blue-900 font-bold rounded-xl shadow-xl hover:bg-blue-50 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2 md:gap-3 mx-auto md:mx-0 group/btn text-sm md:text-base"
                                    >
                                        ช้อปโปรโมชั่น <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 3. Recommended Products Row (Modern Cards) */}
                    {featuredProducts.length > 0 && !search && selectedCategory === 'All' && (
                        <section className="space-y-4 md:space-y-8">
                            <div className="flex items-center gap-3 md:gap-4 px-2">
                                <div className="w-1 md:w-1.5 h-6 md:h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900">สินค้าแนะนำสำหรับคุณ</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                                {featuredProducts.slice(0, 3).map((product) => {
                                    const images = product.images ? JSON.parse(product.images) : [];
                                    const isSale = product.salePrice && product.salePrice < product.price;

                                    // Parse Tags
                                    let tags: string[] = [];
                                    try {
                                        tags = product.tags ? JSON.parse(product.tags) : [];
                                    } catch (e) {
                                        tags = [];
                                    }

                                    return (
                                        <div key={product.id} className="group flex bg-white rounded-2xl md:rounded-[20px] p-3 md:p-4 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 border border-gray-100 cursor-pointer" onClick={() => router.push(`/shop/${product.id}`)}>
                                            <div className="w-[100px] md:w-[140px] aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-gray-50 relative flex-shrink-0">
                                                <img src={images[0] || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />

                                                {/* Tags Overlay */}
                                                <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                                                    {isSale && <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">SALE</div>}
                                                    {tags.map((tag, idx) => {
                                                        let tagStyle = "bg-white/90 text-gray-700 border-gray-200";
                                                        if (tag.toLowerCase().includes('sale') || tag.includes('%') || tag.includes('ลด')) tagStyle = "bg-red-100 text-red-600 border-red-200";
                                                        else if (tag.toLowerCase().includes('new') || tag.includes('ใหม่')) tagStyle = "bg-emerald-100 text-emerald-600 border-emerald-200";
                                                        else if (tag.toLowerCase().includes('best') || tag.includes('ขายดี') || tag.includes('1')) tagStyle = "bg-yellow-100 text-yellow-700 border-yellow-200";
                                                        return (
                                                            <span key={idx} className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm backdrop-blur-sm border ${tagStyle}`}>
                                                                {tag}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="flex-1 pl-4 md:pl-5 flex flex-col justify-center py-1 md:py-2">
                                                <div className="mb-auto">
                                                    <div className="flex flex-wrap gap-2 mb-1 md:mb-2">
                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md border border-gray-200">{product.category.name}</span>
                                                        {product.isFeatured && <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-100 flex items-center gap-1"><Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" /> <span className="hidden sm:inline">Best Seller</span></span>}
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 text-base md:text-lg leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">{product.name}</h4>
                                                </div>
                                                <div className="flex items-end justify-between mt-2 md:mt-3">
                                                    <div>
                                                        {isSale && <div className="text-xs text-gray-400 line-through mb-0.5">฿{Number(product.price).toLocaleString()}</div>}
                                                        <div className="text-lg md:text-xl font-bold text-blue-600">฿{Number(product.salePrice || product.price).toLocaleString()}</div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleAddToCart(product, e)}
                                                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* 4. All Products Grid (Clean & Professional) */}
                    <section id="product-grid" className="scroll-mt-24 space-y-6 md:space-y-8">
                        <div className="flex items-center gap-3 md:gap-4 px-2">
                            <div className="w-1 md:w-1.5 h-6 md:h-8 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full"></div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
                                {selectedCategory === 'All' ? 'สินค้าทั้งหมด' : selectedCategory}
                                <span className="text-sm md:text-base font-normal text-gray-400 px-2.5 py-0.5 bg-gray-100 rounded-full">{filteredProducts.length}</span>
                            </h3>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="bg-white rounded-2xl md:rounded-3xl p-4 h-60 md:h-80 animate-pulse border border-gray-100"></div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-10 md:py-20 bg-white rounded-2xl md:rounded-3xl border-2 border-dashed border-gray-100">
                                <Search className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-base md:text-lg font-bold text-gray-900">ไม่พบสินค้า</h3>
                                <p className="text-sm md:text-base text-gray-500">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                                {filteredProducts.map((product) => {
                                    const images = product.images ? JSON.parse(product.images) : [];
                                    const isSale = product.salePrice && product.salePrice < product.price;

                                    // Parse Tags (Handle both relation array and legacy JSON string if any)
                                    let tags: string[] = [];
                                    if (Array.isArray(product.tags)) {
                                        tags = product.tags.map((t: any) => t.name);
                                    } else if (typeof product.tags === 'string') {
                                        try { tags = JSON.parse(product.tags); } catch (e) { tags = []; }
                                    }

                                    return (
                                        <div
                                            key={product.id}
                                            className="bg-white rounded-2xl md:rounded-[1.5rem] p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group flex flex-col relative"
                                            onClick={() => router.push(`/shop/${product.id}`)}
                                        >
                                            {/* Image Area */}
                                            <div className="aspect-[4/3] bg-gray-50 rounded-xl md:rounded-2xl overflow-hidden relative mb-3">
                                                {images[0] ? (
                                                    <img src={images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag /></div>
                                                )}

                                                {/* Tags & Badges Area (Left Top) */}
                                                <div className="absolute top-2 left-2 flex flex-col gap-1.5 items-start">
                                                    {/* Custom Tags */}
                                                    {tags.map((tag, idx) => {
                                                        let tagStyle = "bg-white/95 text-gray-700 border-gray-100";
                                                        if (tag.toLowerCase().includes('sale') || tag.includes('%') || tag.includes('ลด')) tagStyle = "bg-red-500 text-white border-transparent shadow-red-200";
                                                        else if (tag.toLowerCase().includes('new') || tag.includes('ใหม่')) tagStyle = "bg-emerald-500 text-white border-transparent shadow-emerald-200";
                                                        else if (tag.toLowerCase().includes('best') || tag.includes('ขายดี')) tagStyle = "bg-amber-400 text-white border-transparent shadow-amber-200";

                                                        return (
                                                            <span key={idx} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border ${tagStyle} backdrop-blur-sm`}>
                                                                {tag}
                                                            </span>
                                                        );
                                                    })}
                                                </div>

                                                {/* Discount % Badge (Right Top - Shopee Style) */}
                                                {isSale && (
                                                    <div className="absolute top-0 right-0 bg-yellow-400 text-red-600 px-2 py-1 rounded-bl-xl rounded-tr-xl font-black text-xs shadow-sm flex flex-col items-center leading-none min-w-[40px]">
                                                        <span className="text-[10px]">ลด</span>
                                                        <span>{Math.round(((product.price - product.salePrice!) / product.price) * 100)}%</span>
                                                    </div>
                                                )}

                                                {/* Overlay Action */}
                                                <div className="hidden md:flex absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 flex flex-col px-1">
                                                <div className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wide truncate flex items-center gap-1">
                                                    {product.category.name}
                                                </div>

                                                <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 leading-relaxed flex-grow group-hover:text-blue-600 transition-colors h-[40px]">
                                                    {product.name}
                                                </h3>

                                                {/* Price Display */}
                                                <div className="mt-auto pt-2 border-t border-gray-50 flex items-end justify-between">
                                                    <div>
                                                        {isSale ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-gray-400 line-through decoration-gray-300">฿{Number(product.price).toLocaleString()}</span>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-sm font-bold text-orange-500">฿</span>
                                                                    <span className="text-xl font-extrabold text-orange-600 tracking-tight">{Number(product.salePrice).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1 mt-3">
                                                                <span className="text-sm font-bold text-gray-900">฿</span>
                                                                <span className="text-xl font-extrabold text-gray-900 tracking-tight">{Number(product.price).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {/* Sold Count Display */}
                                                        {(product as any).soldCount > 0 && (
                                                            <div className="text-[10px] text-gray-500 font-medium mt-1">
                                                                ขายแล้ว {Number((product as any).soldCount).toLocaleString()} ชิ้น
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={(e) => handleAddToCart(product, e)}
                                                        disabled={product.stock === 0}
                                                        className="w-9 h-9 flex items-center justify-center bg-gray-900 text-white rounded-xl hover:bg-black hover:scale-105 active:scale-95 shadow-lg shadow-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
