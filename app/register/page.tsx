'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Lock, Mail, ArrowRight, UserPlus, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            setIsLoading(false);
            return;
        }

        try {
            await register({
                name: formData.name,
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            Swal.fire({
                icon: 'success',
                title: 'สมัครสมาชิกสำเร็จ!',
                text: 'กรุณาเข้าสู่ระบบเพื่อใช้งาน',
                timer: 2000,
                showConfirmButton: false,
            });

            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Welcome Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-center px-16 text-white h-full">
                    <div className="mb-8 p-4 bg-white/10 backdrop-blur-lg rounded-2xl w-fit">
                        <Sparkles className="w-12 h-12 text-yellow-300" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        เริ่มต้นใช้งาน <br />
                        <span className="text-pink-200">ฟรีวันนี้!</span>
                    </h1>
                    <p className="text-lg text-indigo-100 mb-8 max-w-md leading-relaxed">
                        สมัครสมาชิกเพื่อเข้าถึงสิทธิพิเศษ โปรโมชั่น และติดตามสถานะคำสั่งซื้อของคุณได้ตลอด 24 ชั่วโมง
                    </p>
                </div>
            </div>

            {/* Right Side - Sign Up Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
                <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100 my-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">สมัครสมาชิก</h2>
                        <p className="text-gray-500">สร้างบัญชีใหม่ของคุณ</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center animate-in slide-in-from-top-2">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="text-sm font-bold text-gray-700 block mb-1.5 ml-1">ชื่อ-นามสกุล</label>
                            <div className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all group hover:border-gray-300">
                                <User className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                                <input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="สมชาย ใจดี"
                                    className="bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 w-full font-medium"
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="text-sm font-bold text-gray-700 block mb-1.5 ml-1">ชื่อผู้ใช้งาน (ภาษาอังกฤษ)</label>
                            <div className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all group hover:border-gray-300">
                                <UserPlus className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                                <input
                                    id="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    placeholder="somchai_cool"
                                    className="bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 w-full font-medium"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="text-sm font-bold text-gray-700 block mb-1.5 ml-1">อีเมล</label>
                            <div className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all group hover:border-gray-300">
                                <Mail className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                                <input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="somchai@example.com"
                                    className="bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 w-full font-medium"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="text-sm font-bold text-gray-700 block mb-1.5 ml-1">รหัสผ่าน</label>
                                <div className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all group hover:border-gray-300">
                                    <Lock className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                                    <div className="h-6 w-px bg-gray-300 mx-1"></div>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••"
                                        className="bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 w-full font-medium"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="text-sm font-bold text-gray-700 block mb-1.5 ml-1">ยืนยันรหัสผ่าน</label>
                                <div className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all group hover:border-gray-300">
                                    <Lock className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                                    <div className="h-6 w-px bg-gray-300 mx-1"></div>
                                    <input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••"
                                        className="bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 w-full font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                {showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    <span>กำลังสมัคร...</span>
                                </>
                            ) : (
                                <>
                                    <span>สมัครสมาชิก</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            มีบัญชีอยู่แล้ว?{' '}
                            <a href="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                เข้าสู่ระบบ
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
