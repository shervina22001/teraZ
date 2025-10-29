import React from 'react';
import { Head } from '@inertiajs/react';
import LayoutAdmin from '@/components/teraZ/admin/LayoutAdmin';
import { BedDouble, Users, TriangleAlert, NotebookText, Wallet, ChartNoAxesCombined } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardAdminProps {
    user: {
        name: string;
        id: number;
        role: string;
    };
    stats: {
        rooms: {
            total: number;
            occupied: number;
            empty: number;
        };
        tenants: {
            active: number;
        };
        payments: {
            pending: number;
            waiting_approval: number;
        };
        maintenance: {
            pending: number;
        };
        finance: {
            monthly_income: number;
            monthly_outcome: number;
            monthly_profit: number;
            total_income: number;
            total_outcome: number;
            total_profit: number;
        };
    };
    chart_data: ChartDataPoint[];
    recent_payments: RecentPayment[];
    recent_maintenance: RecentMaintenance[];
}

interface ChartDataPoint {
    month: string;
    income: number;
    outcome: number;
    profit: number;
}

interface RecentPayment {
    id: number;
    room_number: string;
    tenant_name: string;
    description: string;
    amount: number;
    status: string;
    status_label: string;
    status_color: string;
}

interface RecentMaintenance {
    id: number;
    room_number: string;
    tenant_name: string;
    title: string;
    description: string;
    status: string;
    status_label: string;
    status_color: string;
    priority: string;
    biaya: number | null;
}

const DashboardAdminPage: React.FC<DashboardAdminProps> = ({ user, stats, chart_data, recent_payments, recent_maintenance }) => {
    const getPaymentStatusColor = (color: string) => {
        switch (color) {
            case 'yellow':
                return 'bg-[#A75B3E]';
            case 'blue':
                return 'bg-[#265578]';
            case 'green':
                return 'bg-[#2FA336]';
            case 'red':
                return 'bg-[#8B2E1F]';
            default:
                return 'bg-gray-500';
        }
    };

    const getMaintenanceStatusColor = (color: string) => {
        switch (color) {
            case 'yellow':
                return 'bg-[#A75B3E]';
            case 'blue':
                return 'bg-[#265578]';
            case 'green':
                return 'bg-[#214423]';
            default:
                return 'bg-gray-500';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatChartCurrency = (value: number) => {
        return `Rp ${(value / 1000).toFixed(0)}k`;
    };

    // Custom tooltip for chart
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
                    <p className="font-semibold text-[#412E27] mb-2">{payload[0].payload.month}</p>
                    <p className="text-sm text-green-600">
                        Pendapatan: {formatCurrency(payload[0].value)}
                    </p>
                    <p className="text-sm text-red-600">
                        Pengeluaran: {formatCurrency(payload[1].value)}
                    </p>
                    <p className="text-sm font-semibold text-[#412E27] mt-2">
                        Profit: {formatCurrency(payload[0].payload.profit)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <Head title="Dashboard Admin" />

            <LayoutAdmin user={user} currentPath="/admin/dashboard">
                {/* Header */}
                <div className="mb-10 mt-8">
                    <h1 className="text-4xl font-bold text-left">
                        <span className="bg-gradient-to-r from-[#412E27] to-[#A77664] bg-clip-text text-transparent">
                            Dashboard Admin
                        </span>
                    </h1>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-3 gap-8 mb-10">
                    {/* Total Kamar */}
                    <div className="bg-[#49493A] rounded-lg p-6 text-[#F5F2EE]">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium mb-3">Total Kamar</h3>
                                <p className="text-4xl font-bold">{stats.rooms.total}</p>
                                <p className="text-sm mt-3 opacity-90">
                                    {stats.rooms.occupied} terisi, {stats.rooms.empty} kosong
                                </p>
                            </div>
                            <div className="flex items-center justify-center">
                                <BedDouble className="w-12 h-12" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>

                    {/* Total Penghuni */}
                    <div className="bg-[#49493A] rounded-lg p-6 text-[#F5F2EE]">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium mb-3">Total Penghuni</h3>
                                <p className="text-4xl font-bold">{stats.tenants.active}</p>
                                <p className="text-sm mt-3 opacity-90">Penghuni Aktif</p>
                            </div>
                            <div className="flex items-center justify-center">
                                <Users className="w-12 h-12" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>

                    {/* Pembayaran Pending */}
                    <div className="bg-red-900 rounded-lg p-6 text-[#F5F2EE]">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium mb-3">Pembayaran Pending</h3>
                                <p className="text-4xl font-bold">
                                    {stats.payments.pending + stats.payments.waiting_approval}
                                </p>
                                <p className="text-sm mt-3 opacity-90">
                                    {stats.payments.pending} belum bayar, {stats.payments.waiting_approval} menunggu
                                </p>
                            </div>
                            <div className="flex items-center justify-center">
                                <TriangleAlert className="w-12 h-12" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>

                    {/* Laporan Maintenance */}
                    <div className="bg-[#49493A] rounded-lg p-6 text-[#F5F2EE]">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium mb-3">Laporan Maintenance</h3>
                                <p className="text-4xl font-bold">{stats.maintenance.pending}</p>
                                <p className="text-sm mt-3 opacity-90">Belum selesai</p>
                            </div>
                            <div className="flex items-center justify-center">
                                <NotebookText className="w-12 h-12" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>

                    {/* Total Pendapatan (ALL TIME) */}
                    <div className="bg-[#2E5A8B] rounded-lg p-6 text-[#F5F2EE]">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium mb-3">Total Pendapatan</h3>
                                <p className="text-3xl font-bold">
                                    {formatCurrency(stats.finance.total_income)}
                                </p>
                                <p className="text-sm mt-3 opacity-90">
                                    Bulan ini: {formatCurrency(stats.finance.monthly_income)}
                                </p>
                            </div>
                            <div className="flex items-center justify-center">
                                <Wallet className="w-12 h-12" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>

                    {/* Keuntungan Bersih (ALL TIME) */}
                    <div className={`rounded-lg p-6 text-[#F5F2EE] ${stats.finance.total_profit >= 0 ? 'bg-[#2FA336]' : 'bg-red-900'}`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium mb-3">Keuntungan Bersih</h3>
                                <p className="text-3xl font-bold">
                                    {formatCurrency(stats.finance.total_profit)}
                                </p>
                                <p className="text-sm mt-3 opacity-90">
                                    Pengeluaran: {formatCurrency(stats.finance.total_outcome)}
                                </p>
                            </div>
                            <div className="flex items-center justify-center">
                                <ChartNoAxesCombined className="w-12 h-12" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Section - LINE CHART */}
                <div className="bg-[#F5F2EE] rounded-lg shadow-md p-6 mb-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-[#412E27] mb-1">Statistik Keuangan</h2>
                        <p className="text-base text-[#6B5D52]">Pendapatan vs Pengeluaran (6 Bulan Terakhir)</p>
                    </div>

                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                            data={chart_data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis
                                dataKey="month"
                                stroke="#6B5D52"
                                style={{ fontSize: '14px', fontWeight: 500 }}
                            />
                            <YAxis
                                tickFormatter={formatChartCurrency}
                                stroke="#6B5D52"
                                style={{ fontSize: '14px' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                            />
                            <Line
                                type="monotone"
                                dataKey="income"
                                name="Pendapatan"
                                stroke="#2FA336"
                                strokeWidth={3}
                                dot={{ fill: '#2FA336', r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="outcome"
                                name="Pengeluaran"
                                stroke="#8B2E1F"
                                strokeWidth={3}
                                dot={{ fill: '#8B2E1F', r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Pembayaran Terbaru */}
                    <div className="bg-[#F5F2EE] rounded-lg shadow-md p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-[#412E27] mb-1">Pembayaran Terbaru</h2>
                            <p className="text-base text-[#6B5D52]">{recent_payments.length} transaksi terakhir</p>
                        </div>

                        <div className="space-y-0">
                            {recent_payments.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Belum ada pembayaran</p>
                            ) : (
                                recent_payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex justify-between items-center py-4 border-b border-[#9a876d] hover:bg-[#cebfaa] px-3 rounded transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-semibold text-[#412E27] text-lg mb-2">
                                                Kamar {payment.room_number} - {payment.tenant_name}
                                            </p>
                                            <p className="text-base text-[#6B5D52]">{payment.description}</p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="font-bold text-[#412E27] text-lg mb-2">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                            <span className={`inline-block min-w-[120px] text-center px-6 py-2 ${getPaymentStatusColor(payment.status_color)} text-white text-sm font-medium`}>
                                                {payment.status_label}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Laporan Maintenance */}
                    <div className="bg-[#F5F2EE] rounded-lg shadow-md p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-[#412E27] mb-1">Laporan Maintenance</h2>
                            <p className="text-base text-[#6B5D52]">Masalah yang perlu ditangani</p>
                        </div>

                        <div className="space-y-0">
                            {recent_maintenance.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Belum ada laporan maintenance</p>
                            ) : (
                                recent_maintenance.map((maintenance) => (
                                    <div
                                        key={maintenance.id}
                                        className="flex justify-between items-center py-4 border-b border-[#9a876d] hover:bg-[#cebfaa] px-3 rounded transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-semibold text-[#412E27] text-lg mb-2">
                                                Kamar {maintenance.room_number}
                                            </p>
                                            <p className="text-base text-[#6B5D52]">{maintenance.title}</p>
                                            {maintenance.biaya && maintenance.biaya > 0 && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    Biaya: {formatCurrency(maintenance.biaya)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right ml-4">
                                            <span className={`inline-block min-w-[120px] text-center px-6 py-2 ${getMaintenanceStatusColor(maintenance.status_color)} text-white text-sm font-medium`}>
                                                {maintenance.status_label}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </LayoutAdmin>
        </>
    );
};

export default DashboardAdminPage;
