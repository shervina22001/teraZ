import React, { useState } from 'react';
import LayoutAdmin from '@/components/teraZ/admin/LayoutAdmin';
import { ClockAlert, LoaderCircle, CheckCircle, Calendar } from 'lucide-react';

interface MaintenanceAdminProps {
    user: {
        name: string;
        id: number;
    };
}

interface Laporan {
    id: number;
    kamar: string;
    judul: string;
    deskripsi: string;
    tanggal: string;
    status: 'Menunggu' | 'Sedang Proses' | 'Selesai';
    icon: 'alert' | 'loader' | 'check';
}

const MaintenanceAdmin: React.FC<MaintenanceAdminProps> = ({ user }) => {
    const [filterStatus, setFilterStatus] = useState<'Semua Proses' | 'Menunggu' | 'Sedang Proses' | 'Selesai'>('Semua Proses');

    const [laporans, setLaporans] = useState<Laporan[]>([
        {
            id: 1,
            kamar: 'Kamar 02',
            judul: 'Keran air bocor',
            deskripsi: 'Keran air di kamar mandi bocor dan menetes terus',
            tanggal: '11/9/2025',
            status: 'Menunggu',
            icon: 'alert'
        },
        {
            id: 2,
            kamar: 'Kamar 02',
            judul: 'AC tidak dingin',
            deskripsi: 'AC di kamar sudah tidak dingin',
            tanggal: '9/8/2025',
            status: 'Sedang Proses',
            icon: 'loader'
        },
        {
            id: 3,
            kamar: 'Kamar 01',
            judul: 'AC tidak dingin',
            deskripsi: 'AC di kamar sudah tidak dingin sejak 3 hari yang lalu',
            tanggal: '2/7/2025',
            status: 'Selesai',
            icon: 'check'
        },
    ]);

    const totalLaporan = laporans.length;
    const pendingLaporan = laporans.filter(l => l.status === 'Menunggu').length;
    const sedangProsesLaporan = laporans.filter(l => l.status === 'Sedang Proses').length;
    const selesaiLaporan = laporans.filter(l => l.status === 'Selesai').length;

    const getStatusColor = (status: 'Menunggu' | 'Sedang Proses' | 'Selesai') => {
        switch (status) {
            case 'Menunggu':
                return 'bg-[#A75B3E]';
            case 'Sedang Proses':
                return 'bg-[#265578]';
            case 'Selesai':
                return 'bg-[#214423]';
            default:
                return 'bg-gray-500';
        }
    };

    const getIconColor = (icon: 'alert' | 'loader' | 'check') => {
        switch (icon) {
            case 'alert':
                return 'text-[#A75B3E]';
            case 'loader':
                return 'text-[#265578]';
            case 'check':
                return 'text-[#214423]';
            default:
                return 'text-gray-500';
        }
    };

    const renderIcon = (icon: 'alert' | 'loader' | 'check') => {
        switch (icon) {
            case 'alert':
                return <ClockAlert className="w-8 h-8" />;
            case 'loader':
                return <LoaderCircle className="w-8 h-8" />;
            case 'check':
                return <CheckCircle className="w-8 h-8" />;
            default:
                return null;
        }
    };

    const handleStatusChange = (
        id: number,
        newStatus: 'Menunggu' | 'Sedang Proses' | 'Selesai'
    ) => {
        setLaporans(laporans.map(laporan => {
            if (laporan.id === id) {
                let newIcon: 'alert' | 'loader' | 'check' = 'alert';
                if (newStatus === 'Menunggu') {
                    newIcon = 'alert';
                } else if (newStatus === 'Sedang Proses') {
                    newIcon = 'loader';
                } else if (newStatus === 'Selesai') {
                    newIcon = 'check';
                }
                return { ...laporan, status: newStatus, icon: newIcon };
            }
            return laporan;
        }));
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterStatus(
            e.target.value as 'Semua Proses' | 'Menunggu' | 'Sedang Proses' | 'Selesai'
        );
    };

    const filteredLaporans =
        filterStatus === 'Semua Proses'
            ? laporans
            : laporans.filter(l => l.status === filterStatus);

    return (
        <LayoutAdmin user={user} currentPath="/admin/maintenance">
            {/* Title and Filter */}
            <div className="flex justify-between items-center mb-8 mt-6">
                <div>
                    <h1 className="text-3xl font-semibold text-[#7A2B1E]">Laporan Maintenance</h1>
                    <p className="text-base text-[#6B5D52] mt-1">
                        Kelola laporan kerusakan dan perbaikan
                    </p>
                </div>
                <select
                    value={filterStatus}
                    onChange={handleFilterChange}
                    className="px-6 py-3 bg-[#F5F2EE] text-[#7A2B1E] rounded-xl shadow-xl focus:outline-none text-base font-medium cursor-pointer"
                >
                    <option value="Semua Proses" className="bg-white text-gray-800">Semua Proses</option>
                    <option value="Menunggu" className="bg-white text-gray-800">Menunggu</option>
                    <option value="Sedang Proses" className="bg-white text-gray-800">Sedang Proses</option>
                    <option value="Selesai" className="bg-white text-gray-800">Selesai</option>
                </select>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-base text-[#412E27] mb-2">Total Laporan</p>
                    <p className="text-4xl font-bold text-[#412E27]">{totalLaporan}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-base text-[#412E27] mb-2">Pending</p>
                    <p className="text-4xl font-bold text-[#412E27]">{pendingLaporan}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-base text-[#412E27] mb-2">Sedang Proses</p>
                    <p className="text-4xl font-bold text-[#412E27]">{sedangProsesLaporan}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-base text-[#412E27] mb-2">Selesai</p>
                    <p className="text-4xl font-bold text-[#412E27]">{selesaiLaporan}</p>
                </div>
            </div>

            {/* Laporan List */}
            <div className="space-y-6">
                {filteredLaporans.map((laporan) => (
                    <div
                        key={laporan.id}
                        className="bg-[#F5F2EE] rounded-lg shadow-sm px-8 py-8 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-6 flex-1">
                            {/* Icon */}
                            <div className={`${getIconColor(laporan.icon)} flex-shrink-0`}>
                                {renderIcon(laporan.icon)}
                            </div>

                            {/* Info Section */}
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-[#412E27] mb-3">
                                    {laporan.kamar}
                                </h3>

                                {/* Judul dan Tanggal dalam satu baris */}
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-base font-semibold text-[#412E27]">
                                        {laporan.judul}
                                    </p>
                                    
                                    {/* Tanggal di sebelah kanan judul */}
                                    <div className="flex items-center gap-2 text-[#6B5D52] ml-4">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm font-medium whitespace-nowrap">
                                            Dilaporkan: {laporan.tanggal}
                                        </span>
                                    </div>
                                </div>

                                {/* Deskripsi di bawah */}
                                <p className="text-sm text-[#6B5D52]">
                                    {laporan.deskripsi}
                                </p>
                            </div>
                        </div>

                        {/* Status Dropdown */}
                        <div className="ml-6 flex-shrink-0">
                            <select
                                value={laporan.status}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    handleStatusChange(
                                        laporan.id,
                                        e.target.value as 'Menunggu' | 'Sedang Proses' | 'Selesai'
                                    )
                                }
                                className={`${getStatusColor(
                                    laporan.status
                                )} text-white text-sm font-medium px-6 py-2.5 rounded-lg w-[160px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
                                style={{
                                    textAlign: 'center',
                                    textAlignLast: 'center'
                                }}
                            >
                                <option value="Menunggu" className="bg-white text-gray-800 text-center">Menunggu</option>
                                <option value="Sedang Proses" className="bg-white text-gray-800 text-center">Proses</option>
                                <option value="Selesai" className="bg-white text-gray-800 text-center">Selesai</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </LayoutAdmin>
    );
};

export default MaintenanceAdmin;