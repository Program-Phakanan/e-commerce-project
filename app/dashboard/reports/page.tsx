'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    BarChart3, TrendingUp, DollarSign, Package, Users,
    Calendar, ArrowUpRight, Loader2, FileDown, FileSpreadsheet, FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
    salesChart: { date: string; sales: number }[];
    topProducts: { name: string; quantity: number; revenue: number }[];
    stats: {
        totalCustomers: number;
        totalOrders: number;
        paidOrders: number;
        totalRevenue: number;
    };
}

export default function ReportsPage() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
        const interval = setInterval(fetchReports, 10000); // Real-time update every 10s
        return () => clearInterval(interval);
    }, []);

    const fetchReports = async () => {
        try {
            const res = await fetch('/api/reports');
            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (!data) return;

        // 1. Prepare Data Sheets
        const statsData = [
            { Metric: 'Total Revenue', Value: data.stats.totalRevenue },
            { Metric: 'Total Orders', Value: data.stats.totalOrders },
            { Metric: 'Paid Orders', Value: data.stats.paidOrders },
            { Metric: 'Total Customers', Value: data.stats.totalCustomers },
        ];

        const salesData = data.salesChart.map(item => ({
            Date: item.date,
            Sales: item.sales
        }));

        const productsData = data.topProducts.map((item, index) => ({
            Rank: index + 1,
            Product: item.name,
            Quantity: item.quantity,
            Revenue: item.revenue
        }));

        // 2. Create Workbook
        const wb = XLSX.utils.book_new();

        const wsStats = XLSX.utils.json_to_sheet(statsData);
        XLSX.utils.book_append_sheet(wb, wsStats, "Overview Stats");

        const wsSales = XLSX.utils.json_to_sheet(salesData);
        XLSX.utils.book_append_sheet(wb, wsSales, "Sales (7 Days)");

        const wsProducts = XLSX.utils.json_to_sheet(productsData);
        XLSX.utils.book_append_sheet(wb, wsProducts, "Top Products");

        // 3. Download
        XLSX.writeFile(wb, `Business_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleExportPDF = () => {
        if (!data) return;

        const doc = new jsPDF();

        // Fonts - Standard font support for Thai is limited in base jsPDF.
        // For production, you'd load a custom Thai font (like Sarabun).
        // Here we'll use English labels or transcribe to be safe, or just accept basic font fallback.

        doc.setFontSize(20);
        doc.text("Business Performance Report", 14, 22);

        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        // Section 1: Overview
        doc.setFontSize(14);
        doc.text("1. Overview Statistics", 14, 45);

        const statsBody = [
            ['Total Revenue', `THB ${data.stats.totalRevenue.toLocaleString()}`],
            ['Total Orders', data.stats.totalOrders.toString()],
            ['Paid Orders', data.stats.paidOrders.toString()],
            ['Total Customers', data.stats.totalCustomers.toString()],
        ];

        autoTable(doc, {
            startY: 50,
            head: [['Metric', 'Value']],
            body: statsBody,
            theme: 'striped',
            headStyles: { fillColor: [66, 139, 202] }
        });

        // Section 2: Last 7 Days Sales
        const finalY = (doc as any).lastAutoTable.finalY || 50;
        doc.text("2. Sales (Last 7 Days)", 14, finalY + 15);

        const salesBody = data.salesChart.map(item => [item.date, `THB ${item.sales.toLocaleString()}`]);

        autoTable(doc, {
            startY: finalY + 20,
            head: [['Date', 'Sales']],
            body: salesBody,
            theme: 'grid',
        });

        // Section 3: Top Products
        const finalY2 = (doc as any).lastAutoTable.finalY || 100;
        doc.text("3. Top Selling Products", 14, finalY2 + 15);

        const productsBody = data.topProducts.map((item, index) => [
            (index + 1).toString(),
            item.name, // Note: Thai characters might not render correctly without custom font
            item.quantity.toString(),
            `THB ${item.revenue.toLocaleString()}`
        ]);

        autoTable(doc, {
            startY: finalY2 + 20,
            head: [['Rank', 'Product Name', 'Quantity', 'Revenue']],
            body: productsBody,
            theme: 'striped',
            headStyles: { fillColor: [255, 140, 0] }
        });

        doc.save(`Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (loading && !data) {
        return (
            <DashboardLayout>
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                </div>
            </DashboardLayout>
        );
    }

    // Calculate max value for chart scaling
    const maxSales = data?.salesChart.reduce((max, item) => Math.max(max, item.sales), 0) || 1;

    return (
        <DashboardLayout>
            <div className="space-y-8 fade-in">
                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">รายงานสรุปผล</h1>
                        <p className="text-gray-500 mt-1">วิเคราะห์ยอดขายและประสิทธิภาพของร้านค้า (Real-time)</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold animate-pulse mr-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Live
                        </div>
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Export Excel
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                        >
                            <FileText className="w-4 h-4" />
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="รายได้รวมทั้งหมด"
                        value={`฿${data?.stats.totalRevenue.toLocaleString()}`}
                        icon={DollarSign}
                        color="blue"
                    />
                    <StatCard
                        title="คำสั่งซื้อทั้งหมด"
                        value={data?.stats.totalOrders.toString() || '0'}
                        subValue={`${data?.stats.paidOrders} สำเร็จ`}
                        icon={Package}
                        color="purple"
                    />
                    <StatCard
                        title="ลูกค้าทั้งหมด"
                        value={data?.stats.totalCustomers.toString() || '0'}
                        icon={Users}
                        color="orange"
                    />
                    <StatCard
                        title="ยอดขายเฉลี่ย/ออเดอร์"
                        value={`฿${data?.stats.paidOrders ? Math.round(data.stats.totalRevenue / data.stats.paidOrders).toLocaleString() : '0'}`}
                        icon={TrendingUp}
                        color="emerald"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sales Chart (Custom CSS Bar Chart) */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-500" />
                                ยอดขาย 7 วันล่าสุด
                            </h2>
                        </div>

                        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4">
                            {data?.salesChart.map((item, index) => {
                                const heightPercent = (item.sales / maxSales) * 100;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="relative w-full bg-gray-100 rounded-t-lg overflow-hidden h-full flex items-end">
                                            <div
                                                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 opacity-80 group-hover:opacity-100 transition-all duration-500 ease-out rounded-t-lg relative"
                                                style={{ height: `${heightPercent}%` }}
                                            >
                                                {/* Tooltip */}
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-sans">
                                                    ฿{item.sales.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 rotate-0 sm:rotate-0">{item.date}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <ArrowUpRight className="w-5 h-5 text-orange-500" />
                            สินค้าขายดี (Top 5)
                        </h2>
                        <div className="space-y-4">
                            {data?.topProducts.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">ไม่มีข้อมูลสินค้าขายดี</p>
                            ) : (
                                data?.topProducts.map((product, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500">{product.quantity} ชิ้น</p>
                                            </div>
                                        </div>
                                        <div className="text-right font-medium text-gray-900">
                                            ฿{product.revenue.toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatCard({ title, value, subValue, icon: Icon, color }: any) {
    const colors: any = {
        blue: 'bg-blue-500 text-blue-500',
        purple: 'bg-purple-500 text-purple-500',
        orange: 'bg-orange-500 text-orange-500',
        emerald: 'bg-emerald-500 text-emerald-500',
    };

    const bgColors: any = {
        blue: 'bg-blue-50',
        purple: 'bg-purple-50',
        orange: 'bg-orange-50',
        emerald: 'bg-emerald-50',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${bgColors[color]} ${colors[color].split(' ')[1]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                    {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
                </div>
            </div>
        </div>
    );
}
