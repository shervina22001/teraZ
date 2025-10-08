import React from 'react';
import LayoutAdmin from '@/components/teraZ/admin/LayoutAdmin';
import { BedDouble, Users, SquarePen, NotebookText, Wallet, ChartNoAxesCombined } from 'lucide-react';

interface DashboardAdminProps {
    user: {
        name: string;
        id: number;
    };
}

const DashboardAdmin: React.FC<DashboardAdminProps> = ({ user }) => {
    return (
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
            <div className="bg-[#513A32] rounded-lg p-6 text-[#F5F2EE]">
                <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium mb-3">Total Kamar</h3>
                    <p className="text-4xl font-bold">5</p>
                    <p className="text-sm mt-3 opacity-90">2 terisi, 3 kosong</p>
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
                    <p className="text-4xl font-bold">2</p>
                    <p className="text-sm mt-3 opacity-90">Penghuni Aktif</p>
                </div>
                <div className="flex items-center justify-center">
                    <Users className="w-12 h-12" strokeWidth={1.5} />
                </div>
                </div>
            </div>

            {/* Pembayaran Pending */}
            <div className="bg-[#513A32] rounded-lg p-6 text-[#F5F2EE]">
                <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium mb-3">Pembayaran Pending</h3>
                    <p className="text-4xl font-bold">1</p>
                    <p className="text-sm mt-3 opacity-90">Memerlukan Perhatian</p>
                </div>
                <div className="flex items-center justify-center">
                    <SquarePen className="w-12 h-12" strokeWidth={1.5} />
                </div>
                </div>
            </div>

            {/* Laporan Maintenance */}
            <div className="bg-[#49493A] rounded-lg p-6 text-[#F5F2EE]">
                <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium mb-3">Laporan Maintenance</h3>
                    <p className="text-4xl font-bold">1</p>
                    <p className="text-sm mt-3 opacity-90">Belum selesai</p>
                </div>
                <div className="flex items-center justify-center">
                    <NotebookText className="w-12 h-12" strokeWidth={1.5} />
                </div>
                </div>
            </div>

            {/* Pendapatan Bulan Ini */}
            <div className="bg-[#513A32] rounded-lg p-6 text-[#F5F2EE]">
                <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium mb-3">Pendapatan Bulan Ini</h3>
                    <p className="text-3xl font-bold">Rp 1.500.000</p>
                    <p className="text-sm mt-3 opacity-90">Dari sewa kamar</p>
                </div>
                <div className="flex items-center justify-center">
                    <Wallet className="w-12 h-12" strokeWidth={1.5} />
                </div>
                </div>
            </div>

            {/* Keuntungan Bersih */}
            <div className="bg-[#49493A] rounded-lg p-6 text-[#F5F2EE]">
                <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium mb-3">Keuntungan Bersih</h3>
                    <p className="text-3xl font-bold">Rp -1.800.000</p>
                    <p className="text-sm mt-3 opacity-90">Setelah dikurangi pengeluaran</p>
                </div>
                <div className="flex items-center justify-center">
                    <ChartNoAxesCombined className="w-12 h-12" strokeWidth={1.5} />
                </div>
                </div>
            </div>

            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-2 gap-8">
                {/* Pembayaran Terbaru */}
                <div className="bg-[#F5F2EE] rounded-lg shadow-md p-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-[#412E27] mb-1">Pembayaran Terbaru</h2>
                        <p className="text-base text-[#6B5D52]">5 transaksi terakhir</p>
                    </div>
                    
                    <div className="space-y-0">
                        {/* Item 1 */}
                        <div className="flex justify-between items-center py-4 border-b border-[#9a876d] hover:bg-[#cebfaa] px-3 rounded transition-colors">
                            <div className="flex-1">
                                <p className="font-semibold text-[#412E27] text-lg mb-2">Kamar A01</p>
                                <p className="text-base text-[#6B5D52]">Sewa bulan September 2025</p>
                            </div>
                            <div className="text-right ml-4">
                                <p className="font-bold text-[#412E27] text-lg mb-2">Rp 850.000</p>
                                <span className="inline-block min-w-[120px] text-center px-6 py-2 bg-[#A75B3E] text-white text-sm font-medium">
                                    Menunggu
                                </span>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="flex justify-between items-center py-4 border-b border-[#9a876d] hover:bg-[#cebfaa] px-3 rounded transition-colors">
                            <div className="flex-1">
                                <p className="font-semibold text-[#412E27] text-lg mb-2">Kamar A02</p>
                                <p className="text-base text-[#6B5D52]">Sewa bulan September 2025</p>
                            </div>
                            <div className="text-right ml-4">
                                <p className="font-bold text-[#412E27] text-lg mb-2">Rp 850.000</p>
                                <span className="inline-block min-w-[120px] text-center px-6 py-2 bg-[#2FA336] text-white text-sm font-medium">
                                    Lunas
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Laporan Maintenance */}
                <div className="bg-[#F5F2EE] rounded-lg shadow-md p-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-[#412E27] mb-1">Laporan Maintenance</h2>
                        <p className="text-base text-[#6B5D52]">Masalah yang perlu ditangani</p>
                    </div>
                    
                    <div className="space-y-0">
                        {/* Item 1 */}
                        <div className="flex justify-between items-center py-4 border-b border-[#9a876d] hover:bg-[#cebfaa] px-3 rounded transition-colors">
                            <div className="flex-1">
                                <p className="font-semibold text-[#412E27] text-lg mb-2">Kamar A01</p>
                                <p className="text-base text-[#6B5D52]">AC tidak dingin</p>
                            </div>
                            <div className="text-right ml-4">
                                <span className="inline-block min-w-[120px] text-center px-6 py-2 bg-[#265578] text-white text-sm font-medium">
                                    Proses
                                </span>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="flex justify-between items-center py-4 border-b border-[#9a876d] hover:bg-[#cebfaa] px-3 rounded transition-colors">
                            <div className="flex-1">
                                <p className="font-semibold text-[#412E27] text-lg mb-2">Kamar A01</p>
                                <p className="text-base text-[#6B5D52]">Keran air bocor</p>
                            </div>
                            <div className="text-right ml-4">
                                <span className="inline-block min-w-[120px] text-center px-6 py-2 bg-[#214423] text-white text-sm font-medium">
                                    Selesai
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutAdmin>
    );
};

export default DashboardAdmin;