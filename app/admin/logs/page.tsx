'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Clock, Shield, Search, RefreshCcw, Download } from 'lucide-react';
import Swal from 'sweetalert2';

interface Log {
    id: string;
    action: string;
    details: string | null;
    ipAddress: string | null;
    createdAt: string;
    user: {
        name: string;
        username: string;
        email: string;
    };
}

export default function ActivityLogsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'Admin') {
                Swal.fire('Access Denied', 'You do not have permission to view logs.', 'error');
                router.push('/shop');
            } else {
                fetchLogs();
            }
        }
    }, [user, authLoading, router]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await fetch('/api/admin/logs', { headers });

            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            } else {
                console.error('Failed to fetch logs');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('th-TH');
    };

    const getActionColor = (action: string) => {
        if (action === 'LOGIN') return 'text-green-600 bg-green-100';
        if (action === 'UPDATE_PROFILE') return 'text-blue-600 bg-blue-100';
        if (action === 'ADD_ADDRESS') return 'text-purple-600 bg-purple-100';
        return 'text-gray-600 bg-gray-100';
    };

    const filteredLogs = logs.filter(log =>
        log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleExport = () => {
        const csvHeader = 'Date,Time,User Name,User Email,Action,Details,IP Address\n';
        const csvRows = filteredLogs.map(log => {
            const date = new Date(log.createdAt);
            const cleanDetails = (log.details || '').replace(/"/g, '""');
            return `"${date.toLocaleDateString('th-TH')}","${date.toLocaleTimeString('th-TH')}","${log.user.name}","${log.user.email}","${log.action}","${cleanDetails}","${log.ipAddress || ''}"`;
        }).join('\n');

        const csvString = '\uFEFF' + csvHeader + csvRows;
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </button>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleExport}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium shadow-md"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Activity Logs
                    </h1>
                    <Shield className="w-6 h-6 text-purple-600" />
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search user, action, or details..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            />
                        </div>
                        <button
                            onClick={fetchLogs}
                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                        >
                            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Logs Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading logs...</td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No logs found</td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {formatDate(log.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">{log.user.name}</span>
                                                    <span className="text-xs text-gray-500">{log.user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={log.details || ''}>
                                                {log.details || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {log.ipAddress || 'Unknown'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
