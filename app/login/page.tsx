'use client';

import { Suspense, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, User, Lock, ArrowRight, LayoutDashboard, ShoppingBag, Sparkles, Loader2 } from 'lucide-react';

function LoginContent() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const loggedInUser = await login(username, password);

            // Redirect based on Role
            if (loggedInUser && loggedInUser.role === 'Admin') {
                router.push('/dashboard');
            } else {
                // Customer or others -> Shop
                const target = redirect === '/login' || redirect === '/' ? '/shop' : redirect;
                router.push(target);
            }
        } catch (err: any) {
            setError(err.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        } finally {
            setIsLoading(false);
        }
    };

    const fillCredentials = (u: string, p: string) => {
        setUsername(u);
        setPassword(p);
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900 border-r border-gray-800">
                {/* Animated Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -top-40 -right-40 animate-pulse"></div>
                    <div className="absolute w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] bottom-0 left-0 animate-pulse delay-700"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                                E-Shop Premium
                            </span>
                        </div>

                        <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
                            Welcome <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient">Back!</span>
                        </h1>
                        <p className="text-lg text-gray-400 max-w-md leading-relaxed">
                            จัดการร้านค้าของคุณได้อย่างมืออาชีพ ด้วยระบบที่ครบครัน ทันสมัย และใช้งานง่ายที่สุด
                        </p>
                    </div>

                    {/* Testimonials or Footer info */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-800 bg-gradient-to-br from-gray-700 to-gray-600" />
                                ))}
                            </div>
                            <div className="text-sm text-gray-300">
                                <span className="text-white font-bold">10k+</span> ร้านค้าไว้วางใจ
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
                            "ระบบจัดการสินค้าที่ดีที่สุดที่เคยใช้มา ช่วยลดเวลาการทำงานได้จริง"
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
                <div className="w-full max-w-[450px]">
                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ</h2>
                        <p className="text-gray-500">กรุณากรอกข้อมูลเพื่อเข้าใช้งาน</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-red-600 text-xs">!</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-red-800">เกิดข้อผิดพลาด</h4>
                                <p className="text-sm text-red-600 mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Username / Email</label>
                            <div className="flex items-center w-full bg-white border-2 border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100">
                                <div className="pl-4 pr-2 text-gray-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="flex-1 py-3.5 pr-4 bg-transparent border-none outline-none text-gray-900 font-medium placeholder:font-normal placeholder:text-gray-400"
                                    placeholder="ชื่อผู้ใช้งาน"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">ลืมรหัสผ่าน?</a>
                            </div>
                            <div className="flex items-center w-full bg-white border-2 border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100">
                                <div className="pl-4 pr-2 text-gray-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex-1 py-3.5 bg-transparent border-none outline-none text-gray-900 font-medium placeholder:font-normal placeholder:text-gray-400"
                                    placeholder="รหัสผ่าน"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="px-4 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>เข้าสู่ระบบ</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Credential Cards */}
                    <div className="mt-10 pt-8 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <Sparkles className="w-3 h-3 text-yellow-500" />
                            บัญชีทดสอบ (Demo)
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div
                                onClick={() => fillCredentials('admin', 'admin123')}
                                className="p-4 rounded-2xl border-2 border-blue-50 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all group"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                        <LayoutDashboard className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Admin</p>
                                        <p className="text-xs text-blue-600">เจ้าของร้าน</p>
                                    </div>
                                </div>
                                <div className="text-[10px] text-gray-500 font-mono bg-white inline-block px-2 py-1 rounded border border-blue-100">
                                    admin / admin123
                                </div>
                            </div>

                            <div
                                onClick={() => fillCredentials('user', 'user123')}
                                className="p-4 rounded-2xl border-2 border-green-50 bg-green-50/50 hover:bg-green-50 hover:border-green-200 cursor-pointer transition-all group"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">User</p>
                                        <p className="text-xs text-green-600">ลูกค้าทั่วไป</p>
                                    </div>
                                </div>
                                <div className="text-[10px] text-gray-500 font-mono bg-white inline-block px-2 py-1 rounded border border-green-100">
                                    user / user123
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        ยังไม่มีบัญชี?{' '}
                        <a href="/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                            สมัครสมาชิกฟรี
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
