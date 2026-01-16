'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Users, Search, Shield, ShieldCheck,
    User as UserIcon, MoreVertical, Loader2, CheckCircle2, Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';

interface UserData {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire('Error', 'Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            setUpdatingId(userId); // Show loading state for this specific row

            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                // Update local state directly to reflect change immediately
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));

                const Toast = Swal.mixin({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: false
                });
                Toast.fire({
                    icon: 'success',
                    title: `Updated role to ${newRole}`
                });
            } else {
                Swal.fire('Error', 'Failed to update role', 'error');
            }
        } catch (error) {
            console.error('Update error:', error);
            Swal.fire('Error', 'Something went wrong', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteUser = async (userId: string, username: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You want to delete user "${username}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/users/${userId}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    setUsers(prev => prev.filter(u => u.id !== userId));
                    Swal.fire('Deleted!', `User "${username}" has been deleted.`, 'success');
                } else {
                    const errorMsg = await res.json();
                    Swal.fire('Error', errorMsg.message || 'Failed to delete user', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Something went wrong', 'error');
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">จัดการผู้ใช้งาน</h1>
                        <p className="text-gray-500 mt-1">กำหนดสิทธิ์การใช้งาน (Role) ให้กับสมาชิกในระบบ</p>
                    </div>
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Total Users: {users.length}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                        <Search className="text-gray-400 w-5 h-5 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="ค้นหาด้วยชื่อ, username หรือ email..."
                            className="flex-1 bg-transparent border-none outline-none font-sans placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex justify-center items-center text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mr-2" />
                            กำลังโหลดข้อมูล...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <p>ไม่พบผู้ใช้งาน</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        <th className="px-6 py-4">ผู้ใช้งาน</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">วันที่สมัคร</th>
                                        <th className="px-6 py-4">สิทธิ์การใช้งาน (Role)</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${user.role === 'Admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                                        }`}>
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{user.username}</p>
                                                        <p className="text-xs text-gray-500">{user.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(user.createdAt).toLocaleDateString('th-TH', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    {updatingId === user.id ? (
                                                        <div className="flex items-center gap-2 text-blue-600 text-sm">
                                                            <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                                                        </div>
                                                    ) : (
                                                        <div className={`flex items-center px-3 py-1.5 rounded-lg border transition-all shadow-sm ${user.role === 'Admin'
                                                            ? 'bg-purple-50 border-purple-200 text-purple-700'
                                                            : 'bg-green-50 border-green-200 text-green-700'
                                                            }`}>
                                                            {/* Icon */}
                                                            <div className="mr-2 flex-shrink-0">
                                                                {user.role === 'Admin' ? (
                                                                    <ShieldCheck className={`w-4 h-4 ${user.role === 'Admin' ? 'text-purple-600' : 'text-gray-400'}`} />
                                                                ) : (
                                                                    <UserIcon className={`w-4 h-4 ${user.role === 'Customer' ? 'text-green-600' : 'text-gray-400'}`} />
                                                                )}
                                                            </div>

                                                            {/* Select */}
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                                className="bg-transparent border-none outline-none appearance-none font-medium text-sm cursor-pointer flex-1"
                                                                style={{ backgroundImage: 'none', minWidth: '80px' }}
                                                            >
                                                                <option value="Admin">Admin</option>
                                                                <option value="Customer">Customer</option>
                                                            </select>

                                                            {/* Custom Arrow */}
                                                            <div className="ml-2 pointer-events-none text-current opacity-50 flex-shrink-0">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.username)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
