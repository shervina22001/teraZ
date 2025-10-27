import React, { useState, useMemo } from 'react';
import LayoutAdmin from '@/components/teraZ/admin/LayoutAdmin';
import { Calendar, CreditCard, X, Check, TrendingUp, AlertTriangle } from 'lucide-react';
import { router } from '@inertiajs/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";

interface KeuanganAdminProps {
    user: {
        name: string;
        id: number;
    };
    statistics: {
        total_pendapatan: number;
        pembayaran_tertunda: number;
        total_pengeluaran: number;
        keuntungan_bersih: number;
    };
    pemasukan: Array<{
        id: number;
        kamar: string;
        kategori: string;
        tanggal: string;
        jumlah: number;
    }>;
    pengeluaran: Array<{
        id: number;
        judul: string;
        kategori: string;
        tanggal: string;
        jumlah: number;
        status: string;
    }>;
    pending: Array<{
        id: number;
        kamar: string;
        periode: string;
        jatuh_tempo: string;
        jumlah: number;
        bukti_pembayaran?: string;
    }>;
    maintenance?: Array<{
        id: number;
        kamar: string;
        judul: string;
        tanggal: string;
        status: string;
    }>;
}

type TabType = 'Pemasukan' | 'Pengeluaran' | 'Menunggu';

const KeuanganAdmin: React.FC<KeuanganAdminProps> = ({ 
    user, 
    statistics,
    pemasukan,
    pengeluaran,
    pending,
    maintenance = []
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('Pemasukan');
    const [showModal, setShowModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<typeof pending[0] | null>(null);

    const formatRupiah = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const monthlyData = useMemo(() => {
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const data = months.map((m) => ({
      name: m,
      income: 0,
      expense: 0,
    }));

    pemasukan.forEach((item) => {
      const date = new Date(item.tanggal);
      const monthIndex = date.getMonth();
        data[monthIndex].income += item.jumlah;
    });

    pengeluaran.forEach((item) => {
      const date = new Date(item.tanggal);
      const monthIndex = date.getMonth();
        data[monthIndex].expense += item.jumlah;
    });

    return data;
  }, [pemasukan, pengeluaran]);

    // Analisis untuk rekomendasi harga
    const priceAnalysis = useMemo(() => {
        const totalIncome = pemasukan.reduce((sum, item) => sum + item.jumlah, 0);
        const totalExpense = pengeluaran.reduce((sum, item) => sum + item.jumlah, 0);
        const netProfit = totalIncome - totalExpense;
        const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

        // Hitung biaya maintenance per bulan
        const maintenanceCosts = pengeluaran.filter(item => 
            item.kategori?.toLowerCase().includes('maintenance') || 
            item.kategori?.toLowerCase().includes('perbaikan')
        );
        const totalMaintenanceCost = maintenanceCosts.reduce((sum, item) => sum + item.jumlah, 0);
        const maintenanceFrequency = maintenance.length;

        // Analisis tren pengeluaran
        const last3MonthsExpenses = monthlyData.slice(-3).reduce((sum, m) => sum + m.expense, 0);
        const avgMonthlyExpense = last3MonthsExpenses / 3;
        const avgMonthlyIncome = monthlyData.slice(-3).reduce((sum, m) => sum + m.income, 0) / 3;

        // Rekomendasi
        let recommendation = 'Stabil';
        let recommendationColor = '#2FA336';
        let priceIncreasePercentage = 0;
        let reason = '';

        if (profitMargin < 15) {
            recommendation = 'Perlu Kenaikan Harga';
            recommendationColor = '#FF0000';
            priceIncreasePercentage = 15 - profitMargin;
            reason = `Margin keuntungan hanya ${profitMargin.toFixed(1)}% (di bawah standar 15%)`;
        } else if (profitMargin < 25 && totalMaintenanceCost > avgMonthlyIncome * 0.3) {
            recommendation = 'Pertimbangkan Kenaikan';
            recommendationColor = '#F5A623';
            priceIncreasePercentage = 10;
            reason = `Biaya maintenance tinggi (${((totalMaintenanceCost / totalIncome) * 100).toFixed(1)}% dari pendapatan)`;
        } else if (avgMonthlyExpense > avgMonthlyIncome * 0.7) {
            recommendation = 'Waspada';
            recommendationColor = '#F5A623';
            priceIncreasePercentage = 8;
            reason = `Pengeluaran mendekati ${((avgMonthlyExpense / avgMonthlyIncome) * 100).toFixed(0)}% dari pemasukan`;
        } else if (profitMargin >= 25) {
            recommendation = 'Kondisi Baik';
            recommendationColor = '#2FA336';
            reason = `Margin keuntungan sehat (${profitMargin.toFixed(1)}%)`;
        }

        return {
            profitMargin,
            totalMaintenanceCost,
            maintenanceFrequency,
            recommendation,
            recommendationColor,
            priceIncreasePercentage,
            reason,
            avgMonthlyExpense,
            avgMonthlyIncome,
        };
    }, [pemasukan, pengeluaran, maintenance, monthlyData]);

    // Data untuk grafik breakdown pengeluaran
    const expenseBreakdown = useMemo(() => {
        const categories = new Map<string, number>();
        
        pengeluaran.forEach(item => {
            const category = item.kategori || 'Lainnya';
            categories.set(category, (categories.get(category) || 0) + item.jumlah);
        });

        return Array.from(categories.entries()).map(([name, value]) => ({
            name,
            value,
            percentage: ((value / statistics.total_pengeluaran) * 100).toFixed(1)
        })).sort((a, b) => b.value - a.value);
    }, [pengeluaran, statistics.total_pengeluaran]);

    const COLORS = ['#A75B3E', '#7A2B1E', '#8B9A7A', '#214423', '#6B5D52'];

    const handleTerimaButton = (id: number) => {
        console.log('Terima pembayaran ID:', id);
        // TODO: Implementasi logika terima pembayaran
        // Bisa menggunakan Inertia.post() untuk kirim ke backend
    };

    const handleKonfirmasiButton = (item: typeof pending[0]) => {
        setSelectedPayment(item);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPayment(null);
    };

    const handleSetujuiPembayaran = () => {
        if (selectedPayment) {
            router.post(`/admin/payments/${selectedPayment.id}/approve`, {}, {
                onSuccess: () => {
                    handleCloseModal();
                },
                onError: (errors) => {
                    console.error('Approve failed:', errors);
                }
            });
        }
    };

    const handleTolakPembayaran = () => {
        if (selectedPayment) {
            router.post(`/admin/payments/${selectedPayment.id}/reject`, {}, {
                onSuccess: () => {
                    handleCloseModal();
                },
                onError: (errors) => {
                    console.error('Reject failed:', errors);
                }
            });
        }
    };

    return (
        <LayoutAdmin user={user} currentPath="/admin/keuangan">
            {/* Title */}
            <div className="mb-8 mt-6">
                <h1 className="text-3xl font-semibold text-[#7A2B1E]">Keuangan</h1>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-base text-[#412E27] mb-2">Total Pendapatan</p>
                    <p className="text-2xl font-bold text-[#412E27]">{formatRupiah(statistics.total_pendapatan)}</p>
                    <p className="text-sm text-[#6B5D52] mt-1">Pembayaran yang sudah masuk</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-base text-[#412E27] mb-2">Pembayaran Tertunda</p>
                    <p className="text-2xl font-bold text-[#412E27]">{formatRupiah(statistics.pembayaran_tertunda)}</p>
                    <p className="text-sm text-[#6B5D52] mt-1">Menunggu pembayaran</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-base text-[#412E27] mb-2">Total Pengeluaran</p>
                    <p className="text-2xl font-bold text-[#412E27]">{formatRupiah(statistics.total_pengeluaran)}</p>
                    <p className="text-sm text-[#6B5D52] mt-1">Pengeluaran Operasional</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-base text-[#412E27] mb-2">Keuntungan Bersih</p>
                    <p className="text-2xl font-bold text-[#214423]">+{formatRupiah(statistics.keuntungan_bersih)}</p>
                    <p className="text-sm text-[#6B5D52] mt-1">Pendapatan - Pengeluaran</p>
                </div>
            </div>

            {/* Chart Placeholder */}
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#412E27]">
                        Grafik Pendapatan & Pengeluaran Bulanan
                    </h2>
                    <span className="text-sm text-[#F5A623] font-medium">Goal</span>
                    </div>

                    <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                        data={monthlyData}
                        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                        >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E0DA" />
                        <XAxis dataKey="name" stroke="#6B5D52" />
                        <YAxis stroke="#6B5D52" />
                        <Tooltip
                            formatter={(value: number) => formatRupiah(value)}
                            contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #D1C7BC",
                            borderRadius: "8px",
                            }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Line
                            type="monotone"
                            dataKey="income"
                            name="Pemasukan"
                            stroke="#2FA336"
                            strokeWidth={3}
                            dot={{ r: 5 }}
                            activeDot={{ r: 7 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="expense"
                            name="Pengeluaran"
                            stroke="#A75B3E"
                            strokeWidth={3}
                            dot={{ r: 5 }}
                            activeDot={{ r: 7 }}
                        />
                        </LineChart>
                    </ResponsiveContainer>
                    </div>

                    <div className="flex justify-between text-xs text-[#6B5D52] mt-2">
                    <span>Sunday</span>
                    <span>Monday</span>
                    <span>Tuesday</span>
                    <span>Wednesday</span>
                    <span>Thursday</span>
                    <span>Friday</span>
                    <span>Saturday</span>
                    </div>
                </div>

            {/* GRAFIK ANALISIS REKOMENDASI HARGA - BAGIAN BARU */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Card Rekomendasi */}
                <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-6 h-6" style={{ color: priceAnalysis.recommendationColor }} />
                        <h2 className="text-lg font-semibold text-[#412E27]">Analisis Harga</h2>
                    </div>

                    <div 
                        className="rounded-lg p-4 mb-4"
                        style={{ backgroundColor: `${priceAnalysis.recommendationColor}15` }}
                    >
                        <p className="text-sm text-[#6B5D52] mb-1">Status</p>
                        <p 
                            className="text-2xl font-bold mb-2"
                            style={{ color: priceAnalysis.recommendationColor }}
                        >
                            {priceAnalysis.recommendation}
                        </p>
                        <p className="text-sm text-[#412E27]">{priceAnalysis.reason}</p>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-[#F5F2EE] rounded-lg p-3">
                            <p className="text-xs text-[#6B5D52] mb-1">Margin Keuntungan</p>
                            <p className="text-xl font-bold text-[#412E27]">
                                {priceAnalysis.profitMargin.toFixed(1)}%
                            </p>
                        </div>

                        <div className="bg-[#F5F2EE] rounded-lg p-3">
                            <p className="text-xs text-[#6B5D52] mb-1">Biaya Maintenance</p>
                            <p className="text-xl font-bold text-[#412E27]">
                                {formatRupiah(priceAnalysis.totalMaintenanceCost)}
                            </p>
                            <p className="text-xs text-[#6B5D52] mt-1">
                                {priceAnalysis.maintenanceFrequency} laporan
                            </p>
                        </div>

                        {priceAnalysis.priceIncreasePercentage > 0 && (
                            <div 
                                className="rounded-lg p-3 border-2"
                                style={{ 
                                    borderColor: priceAnalysis.recommendationColor,
                                    backgroundColor: `${priceAnalysis.recommendationColor}10`
                                }}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="w-4 h-4" style={{ color: priceAnalysis.recommendationColor }} />
                                    <p className="text-xs font-semibold" style={{ color: priceAnalysis.recommendationColor }}>
                                        Rekomendasi Kenaikan
                                    </p>
                                </div>
                                <p className="text-2xl font-bold" style={{ color: priceAnalysis.recommendationColor }}>
                                    +{priceAnalysis.priceIncreasePercentage.toFixed(0)}%
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grafik Breakdown Pengeluaran */}
                <div className="bg-white rounded-lg shadow-sm p-6 col-span-2">
                    <h2 className="text-lg font-semibold text-[#412E27] mb-4">
                        Breakdown Pengeluaran per Kategori
                    </h2>
                    
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={expenseBreakdown}
                                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0DA" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#6B5D52"
                                    angle={-15}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis stroke="#6B5D52" />
                                <Tooltip
                                    formatter={(value: number) => formatRupiah(value)}
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #D1C7BC",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Bar dataKey="value" name="Pengeluaran" radius={[8, 8, 0, 0]}>
                                    {expenseBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {expenseBreakdown.slice(0, 4).map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-sm text-[#412E27]">{item.name}</span>
                                <span className="text-xs text-[#6B5D52] ml-auto">{item.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('Pemasukan')}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                        activeTab === 'Pemasukan'
                            ? 'bg-[#8B9A7A] text-white'
                            : 'bg-[#F5F2EE] text-[#6B5D52]'
                    }`}
                >
                    Pemasukan
                </button>
                <button
                    onClick={() => setActiveTab('Pengeluaran')}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                        activeTab === 'Pengeluaran'
                            ? 'bg-[#8B9A7A] text-white'
                            : 'bg-[#F5F2EE] text-[#6B5D52]'
                    }`}
                >
                    Pengeluaran
                </button>
                <button
                    onClick={() => setActiveTab('Menunggu')}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                        activeTab === 'Menunggu'
                            ? 'bg-[#8B9A7A] text-white'
                            : 'bg-[#F5F2EE] text-[#6B5D52]'
                    }`}
                >
                    Menunggu
                </button>
            </div>

            {/* Content berdasarkan tab */}
            <div className="bg-[#8B9A7A] rounded-lg p-6">
                {activeTab === 'Pemasukan' && (
                    <>
                        <h3 className="text-xl font-semibold text-white mb-6">Riwayat Pemasukan</h3>
                        <div className="space-y-4">
                            {pemasukan.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white bg-opacity-90 rounded-lg px-6 py-5 flex items-center justify-between"
                                >
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-[#412E27] mb-2">
                                            {item.kamar}
                                        </h4>
                                        <p className="text-sm text-[#6B5D52] mb-1">{item.kategori}</p>
                                        <div className="flex items-center gap-2 text-[#6B5D52]">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs">Dibayar: {item.tanggal}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-bold text-[#214423]">
                                            +{formatRupiah(item.jumlah)}
                                        </span>
                                        <button className="bg-[#2FA336] text-white inline-block min-w-[120px] text-center px-6 py-2 text-sm">
                                            Lunas
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'Pengeluaran' && (
                    <>
                        <h3 className="text-xl font-semibold text-white mb-6">Riwayat Pengeluaran</h3>
                        <div className="space-y-4">
                            {pengeluaran.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white bg-opacity-90 rounded-lg px-6 py-5 flex items-center justify-between"
                                >
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-[#412E27] mb-2">
                                            {item.judul}
                                        </h4>
                                        <p className="text-sm text-[#6B5D52] mb-1">Kategori: {item.kategori}</p>
                                        <div className="flex items-center gap-2 text-[#6B5D52]">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs">Tanggal: {item.tanggal}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-bold text-[#A75B3E]">
                                            -{formatRupiah(item.jumlah)}
                                        </span>
                                        <button className="bg-[#A75B3E] text-white inline-block min-w-[120px] text-center px-6 py-2 text-sm">
                                            {item.status}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'Menunggu' && (
                    <>
                        <h3 className="text-xl font-semibold text-white mb-6">Pembayaran Pending</h3>
                        <div className="space-y-4">
                            {pending.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white bg-opacity-90 rounded-lg px-6 py-5 flex items-center justify-between"
                                >
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-[#412E27] mb-2">
                                            {item.kamar}
                                        </h4>
                                        <p className="text-sm text-[#6B5D52] mb-1">{item.periode}</p>
                                        <div className="flex items-center gap-2 text-[#6B5D52]">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs">Jatuh tempo: {item.jatuh_tempo}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-bold text-[#412E27]">
                                            {formatRupiah(item.jumlah)}
                                        </span>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleTerimaButton(item.id)}
                                                className="bg-[#FF0000] text-white inline-block min-w-[120px] text-center px-6 py-2 text-sm"
                                            >
                                                Terlambat
                                            </button>
                                            <button
                                                onClick={() => handleKonfirmasiButton(item)}
                                                className="bg-[#F5F2EE] text-[#412E27] px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#e8e3dd] transition-colors border border-[#D1C7BC] flex items-center justify-center gap-2"
                                            >
                                                <CreditCard className="w-4 h-4" />
                                                <span>Konfirmasi</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Modal Konfirmasi Pembayaran */}
            {showModal && selectedPayment && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-[#412E27] mb-6">Konfirmasi Pembayaran</h2>

                        {/* Detail Pembayaran */}
                        <div className="mb-6 bg-[#F5F2EE] rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-[#412E27] mb-3">Detail Pembayaran</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-[#6B5D52]">Kamar:</span>
                                    <span className="font-medium text-[#412E27]">{selectedPayment.kamar}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#6B5D52]">Periode:</span>
                                    <span className="font-medium text-[#412E27]">{selectedPayment.periode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#6B5D52]">Jatuh Tempo:</span>
                                    <span className="font-medium text-[#412E27]">{selectedPayment.jatuh_tempo}</span>
                                </div>
                                <div className="flex justify-between border-t border-[#D1C7BC] pt-2 mt-2">
                                    <span className="text-[#6B5D52] font-semibold">Total:</span>
                                    <span className="font-bold text-[#412E27] text-lg">{formatRupiah(selectedPayment.jumlah)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bukti Pembayaran */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-[#412E27] mb-3">Bukti Pembayaran</h3>
                            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                                {selectedPayment.bukti_pembayaran ? (
                                    <img
                                        src={selectedPayment.bukti_pembayaran}
                                        alt="Bukti Pembayaran"
                                        className="w-full h-auto max-h-96 object-contain"
                                    />
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-gray-400">
                                        <p>Tidak ada bukti pembayaran</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleTolakPembayaran}
                                className="flex-1 bg-[#FF0000] text-white py-3 rounded-lg font-medium hover:bg-[#cc0000] transition-colors flex items-center justify-center gap-2"
                            >
                                <X className="w-5 h-5" />
                                <span>Tolak Pembayaran</span>
                            </button>
                            <button
                                onClick={handleSetujuiPembayaran}
                                className="flex-1 bg-[#2FA336] text-white py-3 rounded-lg font-medium hover:bg-[#258a2b] transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" />
                                <span>Setujui & Tandai Lunas</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </LayoutAdmin>
    );
};

export default KeuanganAdmin;