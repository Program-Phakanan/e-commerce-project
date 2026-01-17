'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, User, MapPin, Plus, Trash2, Camera, Loader2, Save, Mail, Phone, Package, ChevronRight, Star } from 'lucide-react';
import Swal from 'sweetalert2';

interface Address {
    id: string;
    label: string | null;
    firstName: string;
    lastName: string;
    phone: string;
    addressLine: string;
    city: string;
    zipCode: string;
    isDefault: boolean;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, updateUser, logout } = useAuth();

    // Data State
    const [profile, setProfile] = useState<any>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Edit Profile State
    const [name, setName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New Address State
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        firstName: '',
        lastName: '',
        phone: '',
        addressLine: '',
        subdistrict: '',
        district: '',
        province: '',
        zipCode: '',
        isDefault: false
    });

    useEffect(() => {
        // Init fetch
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            // Check if user is logged in first via context/localstorage check is redundant if API handles it 
            // but we need to handle 401 gracefully
            // Get token from localStorage for fallback
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

            const [profileRes, AddressRes] = await Promise.all([
                fetch('/api/user/profile', { headers }),
                fetch('/api/user/addresses', { headers })
            ]);

            if (profileRes.status === 401 || AddressRes.status === 401) {
                console.warn('Session expired or invalid token');

                // Auto-recovery: If 401, clear tokens and reload once
                if (typeof window !== 'undefined' && !sessionStorage.getItem('reloaded')) {
                    sessionStorage.setItem('reloaded', 'true');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.reload();
                    return;
                }

                sessionStorage.removeItem('reloaded');
                setLoading(false);
                return;
            }

            if (profileRes.ok) {
                const data = await profileRes.json();
                setProfile(data);
                setName(data.name || '');
            }
            if (AddressRes.ok) {
                const data = await AddressRes.json();
                setAddresses(data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            const imageUrl = data.url;

            await handleUpdateProfile(name, imageUrl);

        } catch (error) {
            Swal.fire('Error', 'Failed to upload image', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async (newName: string, newImage?: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    name: newName,
                    image: newImage || profile?.image
                })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setProfile(updatedUser);
                updateUser(updatedUser);

                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: false
                });
                Toast.fire({ icon: 'success', title: 'อัปเดตข้อมูลสำเร็จ' });
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            // Construct City string from separate fields
            const fullCity = `ต.${newAddress.subdistrict} อ.${newAddress.district} จ.${newAddress.province}`;

            const payload = {
                ...newAddress,
                city: fullCity
            };

            const res = await fetch('/api/user/addresses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchProfileData();
                setShowAddressForm(false);
                setNewAddress({
                    label: 'Home', firstName: '', lastName: '', phone: '',
                    addressLine: '', subdistrict: '', district: '', province: '', zipCode: '', isDefault: false
                });
                Swal.fire({ icon: 'success', title: 'เพิ่มที่อยู่สำเร็จ', timer: 1500, showConfirmButton: false });
            } else {
                const err = await res.json();
                Swal.fire('Error', err.message, 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to add address', 'error');
        }
    };

    const handleDeleteAddress = async (id: string) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: 'คุณต้องการลบที่อยู่นี้ใช่หรือไม่',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#ef4444'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

                const res = await fetch(`/api/user/addresses/${id}`, {
                    method: 'DELETE',
                    headers
                });
                if (res.ok) {
                    setAddresses(prev => prev.filter(a => a.id !== id));
                    Swal.fire({ icon: 'success', title: 'ลบแล้ว', timer: 1000, showConfirmButton: false });
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-blue-50" />
            <Loader2 className="w-10 h-10 animate-spin text-cyan-500 relative z-10" />
        </div>
    );

    // If fetch failed deeply (e.g. 401 and state not set)
    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <p className="text-gray-500">Session หมดอายุหรือเกิดข้อผิดพลาด</p>
                <button
                    onClick={() => { logout(); router.push('/login'); }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all"
                >
                    เข้าสู่ระบบใหม่
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative pb-24 md:pb-20 font-sans selection:bg-cyan-100">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-cyan-100/40 to-blue-100/40 rounded-full blur-3xl" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-purple-100/40 to-pink-100/40 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-white/50">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-gray-500 hover:text-cyan-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-cyan-50"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">ย้อนกลับ</span>
                    </button>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        บัญชีผู้ใช้
                    </h1>
                    <div className="w-24"></div> {/* Spacer for balance */}
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-10 relative z-10 space-y-8">

                {/* Profile Card */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-cyan-900/5 border border-white p-8 relative overflow-hidden group">
                    {/* Decorative Background inside card */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-10" />

                    <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
                        {/* Avatar Section */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full p-1 bg-white shadow-lg ring-4 ring-cyan-50 relative group-hover:ring-cyan-100 transition-all">
                                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 relative">
                                    {profile.image ? (
                                        <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                                            <User className="w-12 h-12" />
                                        </div>
                                    )}
                                    {/* Edit Overlay */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white font-medium gap-1 backdrop-blur-[2px]"
                                    >
                                        <Camera className="w-5 h-5" />
                                        <span>แก้ไข</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-1 right-2 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white pointer-events-none">
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>

                        {/* Valid Info Section */}
                        <div className="flex-1 w-full text-center md:text-left space-y-4 pt-2">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-1">{profile.username}</h2>
                                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-md">
                                        <Mail className="w-3.5 h-3.5" /> {profile.email}
                                    </span>
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-md">
                                        <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" /> {profile.role || 'Member'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg mx-auto md:mx-0 bg-white/50 p-4 rounded-2xl border border-white/60 shadow-sm">
                                <div className="flex-1 w-full">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block pl-1">ชื่อที่ใช้แสดง</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-transparent border-b border-gray-300 focus:border-cyan-500 px-1 py-1 text-gray-800 font-medium outline-none transition-colors placeholder:text-gray-300"
                                        placeholder="ตั้งชื่อของคุณ..."
                                    />
                                </div>
                                <button
                                    onClick={() => handleUpdateProfile(name)}
                                    className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Save className="w-4 h-4" />
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* My Orders Card */}
                    <div
                        onClick={() => router.push('/my-orders')}
                        className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-cyan-900/5 border border-white p-6 cursor-pointer hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all group"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Package className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">ประวัติการสั่งซื้อ</h3>
                                <p className="text-gray-500 text-sm">ดูรายการสั่งซื้อและสถานะพัสดุ</p>
                            </div>
                        </div>
                        <div className="flex items-center text-sm font-bold text-gray-400 group-hover:text-blue-600 transition-colors">
                            <span>ดูทั้งหมด</span>
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>

                    {/* Placeholder for future features or another menu */}
                    {/* For layout balance, or left empty in grid */}
                </div>

                {/* Addresses Section */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-cyan-900/5 border border-white p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-cyan-600" />
                                ที่อยู่จัดส่ง
                            </h2>
                            <p className="text-gray-500 text-sm mt-1 ml-8">จัดการที่อยู่สำหรับจัดส่งสินค้า (สูงสุด 5 รายการ)</p>
                        </div>

                        {addresses.length < 5 && (
                            <button
                                onClick={() => setShowAddressForm(true)}
                                disabled={showAddressForm}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-5 h-5" />
                                เพิ่มที่อยู่ใหม่
                            </button>
                        )}
                    </div>

                    {showAddressForm && (
                        <div className="mb-8 p-1 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl animate-in fade-in slide-in-from-top-4">
                            <form onSubmit={handleAddAddress} className="bg-white rounded-[14px] p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-800 text-lg">เพิ่มที่อยู่ใหม่</h3>
                                    <button type="button" onClick={() => setShowAddressForm(false)} className="text-gray-400 hover:text-gray-600">
                                        <Trash2 className="w-5 h-5 rotate-45 transform" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="input-label">ชื่อสถานที่ (Label)</label>
                                        <input placeholder="เช่น บ้าน, ที่ทำงาน, หอพัก" className="modern-input" value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="input-label">ชื่อผู้รับ</label>
                                        <input placeholder="ชื่อจริง" className="modern-input" value={newAddress.firstName} onChange={e => setNewAddress({ ...newAddress, firstName: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="input-label">นามสกุล</label>
                                        <input placeholder="นามสกุล" className="modern-input" value={newAddress.lastName} onChange={e => setNewAddress({ ...newAddress, lastName: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="input-label">เบอร์โทรศัพท์</label>
                                        <input placeholder="08x-xxx-xxxx" className="modern-input" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="input-label">ที่อยู่ (บ้านเลขที่, ถนน, ซอย, หมู่ที่)</label>
                                        <textarea placeholder="บ้านเลขที่, หมู่บ้าน, ถนน, ซอย..." className="modern-input min-h-[80px]" value={newAddress.addressLine} onChange={e => setNewAddress({ ...newAddress, addressLine: e.target.value })} required />
                                    </div>

                                    <div>
                                        <label className="input-label">ตำบล / แขวง</label>
                                        <input placeholder="ระบุตำบล..." className="modern-input" value={newAddress.subdistrict} onChange={e => setNewAddress({ ...newAddress, subdistrict: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="input-label">อำเภอ / เขต</label>
                                        <input placeholder="ระบุอำเภอ..." className="modern-input" value={newAddress.district} onChange={e => setNewAddress({ ...newAddress, district: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="input-label">จังหวัด</label>
                                        <input placeholder="ระบุจังหวัด..." className="modern-input" value={newAddress.province} onChange={e => setNewAddress({ ...newAddress, province: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="input-label">รหัสไปรษณีย์</label>
                                        <input placeholder="xxxxx" className="modern-input" value={newAddress.zipCode} onChange={e => setNewAddress({ ...newAddress, zipCode: e.target.value })} required />
                                    </div>

                                    <div className="md:col-span-2 pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={newAddress.isDefault}
                                                    onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                                />
                                                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">ตั้งเป็นที่อยู่เริ่มต้น</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">ยกเลิก</button>
                                    <button type="submit" className="px-8 py-2.5 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-black font-bold transition-transform hover:scale-105">บันทึกที่อยู่</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                            <div key={addr.id} className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-gray-900">{addr.label}</span>
                                        {addr.isDefault && (
                                            <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                                                DEFAULT
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAddress(addr.id)}
                                        className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-1 text-sm pl-[42px]">
                                    <p className="font-bold text-gray-800">{addr.firstName} {addr.lastName}</p>
                                    <p className="text-gray-500 leading-relaxed">{addr.addressLine}</p>
                                    <p className="text-gray-500">{addr.city} {addr.zipCode}</p>
                                    <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {addr.phone}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Empty State placeholder if needed, nicely handled by grid */}
                    </div>

                    {addresses.length === 0 && !showAddressForm && (
                        <div className="text-center py-16 px-4 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <MapPin className="w-8 h-8 opacity-50" />
                            </div>
                            <h3 className="text-gray-900 font-bold mb-1">ยังไม่มีที่อยู่</h3>
                            <p className="text-gray-500 text-sm mb-6">เพิ่มที่อยู่จัดส่งเพื่อให้การสั่งซื้อสินค้าง่ายขึ้น</p>
                            <button
                                onClick={() => setShowAddressForm(true)}
                                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:border-cyan-400 hover:text-cyan-600 transition-all shadow-sm"
                            >
                                เพิ่มที่อยู่แรกเลย
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <style jsx>{`
                .input-label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.5rem;
                }
                .modern-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background-color: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.75rem;
                    outline: none;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    font-size: 0.95rem;
                    color: #1f2937;
                }
                .modern-input:focus {
                    background-color: #fff;
                    border-color: #06b6d4;
                    box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
                }
                .modern-input::placeholder {
                    color: #9ca3af;
                }
            `}</style>
        </div>
    );
}
