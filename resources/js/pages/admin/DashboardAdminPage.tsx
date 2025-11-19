import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import LayoutAdmin from '@/components/teraZ/admin/LayoutAdmin';
import { BedDouble, Users, TriangleAlert, NotebookText, Wallet, ChartNoAxesCombined, TrendingUp, DollarSign, Wrench, BarChart3, AlertCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PaymentItem {
  id: number;
  amount: number;         // sesuaikan dengan field di Payment-mu (nominal/total dll)
  status: string;
  due_date?: string | null;
  tenant?: {
    nama: string;
  } | null;
  room?: {
    nomor_kamar: string;
  } | null;
}

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

        unpaidPayments: any[];
    };
    chart_data: ChartDataPoint[];
    recent_payments: RecentPayment[];
    recent_maintenance: RecentMaintenance[];
    reminder_logs: ReminderLog[];
}

interface ReminderLog {
    id: number;
    room_number: string;
    tenant_name: string;
    amount: number;
    due_date: string;
    status: string;
    status_label: string;
    status_color: string;
    last_notified_at: string | null;
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

// Price Recommendation Component

const PriceRecommendation: React.FC<{
    stats: DashboardAdminProps['stats'];
    chart_data: ChartDataPoint[];
    recent_maintenance: RecentMaintenance[];
}> = ({ stats, chart_data, recent_maintenance }) => {
    const [showDetails, setShowDetails] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // === ambil sampel 6 bulan terakhir yang ada datanya ===
    const last6WithData = chart_data
    .filter(d => (d.income ?? 0) > 0 || (d.outcome ?? 0) > 0)
    .slice(-6);

    // fallback: minimal pakai 3 bulan terakhir (kalau data tipis)
    const sample =
    last6WithData.length >= 3 ? last6WithData :
    (chart_data.slice(-3).length ? chart_data.slice(-3) : chart_data);

    // rata-rata income & profit berdasarkan sample
    const avgIncomeFromChart = sample.length
    ? sample.reduce((s, d) => s + (d.income ?? 0), 0) / sample.length
    : stats.finance.monthly_income;

    const avgProfitFromChart = sample.length
    ? sample.reduce((s, d) => s + (d.profit ?? 0), 0) / sample.length
    : stats.finance.monthly_profit;

    // Hitung rata-rata biaya maintenance per bulan
    const totalMaintenanceCost = recent_maintenance
        .filter(m => m.biaya && m.biaya > 0)
        .reduce((sum, m) => sum + (m.biaya || 0), 0);
    const avgMonthlyMaintenance = totalMaintenanceCost / 6; // dibagi 6 bulan

    // Hitung profit margin bulanan (lebih akurat dari total)
    const monthlyProfitMargin = avgIncomeFromChart > 0
        ? (avgProfitFromChart / avgIncomeFromChart) * 100
        : 0;

    // Target profit margin (25-30% adalah standar industri kos)
    const targetProfitMargin = 25;

    // Hitung tren pengeluaran (3 bulan terakhir vs 3 bulan pertama)
    const last3Months = chart_data.slice(-3);
    const first3Months = chart_data.slice(0, 3);
    const avgOutcomeLast3 = last3Months.reduce((sum, d) => sum + d.outcome, 0) / 3;
    const avgOutcomeFirst3 = first3Months.reduce((sum, d) => sum + d.outcome, 0) / 3;
    const outcomeTrend = avgOutcomeFirst3 > 0
        ? ((avgOutcomeLast3 - avgOutcomeFirst3) / avgOutcomeFirst3 * 100)
        : 0;

    // Hitung rasio maintenance terhadap pendapatan
    const maintenanceRatio = avgIncomeFromChart > 0
        ? (avgMonthlyMaintenance / avgIncomeFromChart) * 100
        : 0;

    // Tingkat okupansi
    const occupancyRate = stats.rooms.total > 0
        ? (stats.rooms.occupied / stats.rooms.total) * 100
        : 0;

    // Logika rekomendasi yang lebih masuk akal
    let recommendedIncrease = 0;
    let reason = '';
    let urgency: 'low' | 'medium' | 'high' = 'low';

    // Prioritas 1: Profit margin sangat rendah atau negatif
    if (monthlyProfitMargin < 10) {
        recommendedIncrease = 15;
        reason = 'Profit margin sangat rendah (<10%), bisnis tidak sustainable';
        urgency = 'high';
    }
    // Prioritas 2: Profit margin rendah
    else if (monthlyProfitMargin < 15) {
        recommendedIncrease = 12;
        reason = 'Profit margin rendah (10-15%), di bawah standar industri';
        urgency = 'high';
    }
    // Prioritas 3: Profit margin cukup tapi di bawah target
    else if (monthlyProfitMargin < 20) {
        recommendedIncrease = 8;
        reason = 'Profit margin cukup (15-20%), namun bisa dioptimalkan';
        urgency = 'medium';
    }
    // Prioritas 4: Biaya maintenance tinggi
    else if (maintenanceRatio > 20) {
        recommendedIncrease = 10;
        reason = `Biaya maintenance tinggi (${maintenanceRatio.toFixed(1)}% dari pendapatan)`;
        urgency = 'high';
    }
    else if (maintenanceRatio > 15) {
        recommendedIncrease = 7;
        reason = `Biaya maintenance cukup tinggi (${maintenanceRatio.toFixed(1)}% dari pendapatan)`;
        urgency = 'medium';
    }
    // Prioritas 5: Tren pengeluaran naik signifikan
    else if (outcomeTrend > 15) {
        recommendedIncrease = 8;
        reason = `Pengeluaran naik ${outcomeTrend.toFixed(1)}% dalam 6 bulan terakhir`;
        urgency = 'medium';
    }
    else if (outcomeTrend > 10) {
        recommendedIncrease = 6;
        reason = `Pengeluaran meningkat ${outcomeTrend.toFixed(1)}% dalam 6 bulan terakhir`;
        urgency = 'low';
    }
    // Prioritas 6: Profit margin baik tapi belum optimal
    else if (monthlyProfitMargin < targetProfitMargin) {
        recommendedIncrease = 5;
        reason = `Optimalisasi profit margin dari ${monthlyProfitMargin.toFixed(1)}% ke target ${targetProfitMargin}%`;
        urgency = 'low';
    }
    // Kondisi baik: hanya penyesuaian inflasi
    else {
        recommendedIncrease = 3;
        reason = 'Penyesuaian inflasi tahunan (kondisi finansial baik)';
        urgency = 'low';
    }

    // Sesuaikan rekomendasi berdasarkan tingkat okupansi
    // Jika okupansi rendah, kurangi rekomendasi kenaikan
    if (occupancyRate < 60 && recommendedIncrease > 5) {
        recommendedIncrease = Math.max(3, recommendedIncrease - 3);
        reason += ` (disesuaikan karena okupansi ${occupancyRate.toFixed(0)}%)`;
        if (urgency === 'high') urgency = 'medium';
    }

    // Simulasi harga baru per kamar
    const avgCurrentPrice = stats.rooms.occupied > 0
        ? avgIncomeFromChart / stats.rooms.occupied
        : 0;
    const recommendedNewPrice = avgCurrentPrice * (1 + recommendedIncrease / 100);
    const additionalMonthlyIncome = (recommendedNewPrice - avgCurrentPrice) * stats.rooms.occupied;
    const additionalYearlyIncome = additionalMonthlyIncome * 12;
    const priceIncrease = recommendedNewPrice - avgCurrentPrice;

    const getUrgencyBadge = () => {
        switch (urgency) {
            case 'high': return { text: 'Sangat Disarankan', color: 'bg-[#8B2E1F]' };
            case 'medium': return { text: 'Disarankan', color: 'bg-[#A75B3E]' };
            default: return { text: 'Pertimbangkan', color: 'bg-[#265578]' };
        }
    };

    return (
        <div className="bg-[#F5F2EE] rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-[#6B5D52] p-2 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-[#F5F2EE]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[#412E27]">Rekomendasi Kenaikan Harga</h2>
                            <span className={`inline-block px-4 py-1 ${getUrgencyBadge().color} text-white rounded-lg text-xs font-semibold mt-1`}>
                                {getUrgencyBadge().text}
                            </span>
                        </div>
                    </div>
                    <p className="text-[#6B5D52] text-base">{reason}</p>
                </div>

                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="bg-[#6B5D52] hover:bg-[#4d3e33] text-white p-2 rounded-lg transition-colors"
                >
                    {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-5 h-5 text-[#6B5D52]" />
                        <p className="text-sm text-[#6B5D52]">Kenaikan Disarankan</p>
                    </div>
                    <p className="text-4xl font-bold text-[#412E27]">{recommendedIncrease}%</p>
                    <p className="text-sm text-[#6B5D52] mt-2">
                        ~{formatCurrency(avgCurrentPrice * recommendedIncrease / 100)}/kamar
                    </p>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-[#6B5D52]" />
                        <p className="text-sm text-[#6B5D52]">Profit Margin Bulanan</p>
                    </div>
                    <p className="text-4xl font-bold text-[#412E27]">{monthlyProfitMargin.toFixed(1)}%</p>
                    <p className="text-sm text-[#6B5D52] mt-2">
                        Target: {targetProfitMargin}%
                    </p>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Wrench className="w-5 h-5 text-[#6B5D52]" />
                        <p className="text-sm text-[#6B5D52]">Biaya Maintenance/Bulan</p>
                    </div>
                    <p className="text-2xl font-bold text-[#412E27]">{formatCurrency(avgMonthlyMaintenance)}</p>
                    <p className="text-sm text-[#6B5D52] mt-2">
                        {maintenanceRatio.toFixed(1)}% dari pendapatan
                    </p>
                </div>
            </div>

            {showDetails && (
                <div className="mt-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-3 text-[#412E27]">
                        <Info className="w-5 h-5" />
                        Detail Analisis
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <p className="text-sm text-[#6B5D52] mb-1">Harga Rata-rata Saat Ini</p>
                            <p className="text-xl font-bold text-[#412E27]">{formatCurrency(avgCurrentPrice)}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <p className="text-sm text-[#6B5D52] mb-1">Harga Disarankan</p>
                            <p className="text-xl font-bold text-[#412E27]">{formatCurrency(recommendedNewPrice)}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <p className="text-sm text-[#6B5D52] mb-1">Tambahan Pendapatan/Bulan</p>
                            <p className="text-xl font-bold text-[#2FA336]">+{formatCurrency(additionalMonthlyIncome)}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <p className="text-sm text-[#6B5D52] mb-1">Tambahan Pendapatan/Tahun</p>
                            <p className="text-xl font-bold text-[#2FA336]">+{formatCurrency(additionalYearlyIncome)}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h4 className="font-semibold mb-3 text-[#412E27]">Faktor Pertimbangan:</h4>
                        <ul className="space-y-2 text-sm text-[#6B5D52]">
                            <li className="flex items-start gap-2">
                                <span className="text-[#2FA336]">✓</span>
                                <span>Profit Margin Bulanan: {monthlyProfitMargin.toFixed(1)}% (Target: {targetProfitMargin}%)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#2FA336]">✓</span>
                                <span>Biaya Maintenance: {formatCurrency(avgMonthlyMaintenance)}/bulan ({maintenanceRatio.toFixed(1)}% dari pendapatan)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#2FA336]">✓</span>
                                <span>Tren Pengeluaran: {outcomeTrend > 0 ? '↑' : '↓'} {Math.abs(outcomeTrend).toFixed(1)}% (6 bulan terakhir)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#2FA336]">✓</span>
                                <span>Tingkat Okupansi: {occupancyRate.toFixed(0)}% ({stats.rooms.occupied}/{stats.rooms.total} kamar terisi)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#2FA336]">✓</span>
                                <span>Laporan Maintenance Pending: {stats.maintenance.pending} masalah</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

const DashboardAdminPage: React.FC<DashboardAdminProps> = ({ user, stats, chart_data, recent_payments, recent_maintenance, reminder_logs }) => {
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
                    <div className={`rounded-lg p-6 text-[#F5F2EE] ${stats.finance.total_profit >= 0 ? 'bg-[#237728]' : 'bg-red-900'}`}>
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

                {/* Price Recommendation Component - DI BAWAH CHART */}
                <PriceRecommendation
                    stats={stats}
                    chart_data={chart_data}
                    recent_maintenance={recent_maintenance}
                />

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