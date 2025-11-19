import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import LayoutAdmin from '@/components/teraZ/admin/LayoutAdmin';
import { ClockAlert, LoaderCircle, CheckCircle, Calendar, User, Phone, ArrowUpDown, ArrowUp, ArrowDown, X, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

interface MaintenanceAdminProps {
    user: {
        name: string;
        id: number;
        role: string;
    };
    laporans: Laporan[];
    stats: {
        total: number;
        pending: number;
        in_progress: number;
        done: number;
        urgent: number;
        high: number;
    };
    filters: {
        status: string | null;
        priority: string | null;
        sort: string | null;
    };
}

interface Laporan {
    id: number;
    kamar: string;
    tenant_name: string;
    tenant_phone: string;
    judul: string;
    deskripsi: string;
    tanggal: string;
    biaya: number | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    priority_label: string;
    priority_color: string;
    status: 'pending' | 'in_progress' | 'done';
    status_label: string;
    status_color: string;
    icon: 'alert' | 'loader' | 'check';
}

const MaintenanceAdmin: React.FC<MaintenanceAdminProps> = ({ user, laporans, stats, filters }) => {
    const [filterStatus, setFilterStatus] = useState<string>(filters.status || 'all');
    const [filterPriority, setFilterPriority] = useState<string>(filters.priority || 'all');
    const [sortOrder, setSortOrder] = useState<string>(filters.sort || 'desc');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Modal states
    const [showCostModal, setShowCostModal] = useState(false);
    const [selectedLaporanId, setSelectedLaporanId] = useState<number | null>(null);
    const [costInput, setCostInput] = useState<string>('');

    // Calculate pagination
    const totalPages = Math.ceil(laporans.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLaporans = laporans.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    const getStatusColor = (statusColor: string) => {
        switch (statusColor) {
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

    const getPriorityBadgeColor = (priorityColor: string) => {
        switch (priorityColor) {
            case 'red':
                return 'bg-red-600';
            case 'orange':
                return 'bg-orange-500';
            case 'blue':
                return 'bg-blue-500';
            case 'gray':
                return 'bg-gray-500';
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

    const handleStatusChange = (id: number, newStatus: string) => {
        if (newStatus === 'done') {
            setSelectedLaporanId(id);
            const laporan = laporans.find(l => l.id === id);
            setCostInput(laporan?.biaya?.toString() || '');
            setShowCostModal(true);
        } else {
            router.patch(
                `/admin/maintenance/${id}`,
                { status: newStatus },
                {
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: () => {
                        console.log('Status updated successfully');
                    },
                    onError: (errors) => {
                        console.error('Update failed:', errors);
                    },
                }
            );
        }
    };

    const handleCostSubmit = () => {
        if (!selectedLaporanId) return;

        const cost = parseInt(costInput);

        if (!costInput || isNaN(cost) || cost < 0) {
            alert('Mohon masukkan biaya yang valid (minimal 0)');
            return;
        }

        router.patch(
            `/admin/maintenance/${selectedLaporanId}`,
            {
                status: 'done',
                biaya: cost
            },
            {
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    setShowCostModal(false);
                    setSelectedLaporanId(null);
                    setCostInput('');
                    console.log('Status and cost updated successfully');
                },
                onError: (errors) => {
                    console.error('Update failed:', errors);
                    alert('Gagal mengupdate status. Silakan coba lagi.');
                },
            }
        );
    };

    const handlePriorityChange = (id: number, newPriority: string) => {
        router.patch(
            `/admin/maintenance/${id}`,
            { priority: newPriority },
            {
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Priority updated successfully');
                },
                onError: (errors) => {
                    console.error('Update failed:', errors);
                },
            }
        );
    };

    const handleFilterChange = (newStatus: string, newPriority: string, newSort: string) => {
        setCurrentPage(1);
        const params: any = {};
        if (newStatus !== 'all') params.status = newStatus;
        if (newPriority !== 'all') params.priority = newPriority;
        if (newSort) params.sort = newSort;

        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/admin/maintenance?${queryString}` : '/admin/maintenance';

        router.get(url, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleSort = () => {
        const newSort = sortOrder === 'desc' ? 'asc' : 'desc';
        setSortOrder(newSort);
        handleFilterChange(filterStatus, filterPriority, newSort);
    };

    const renderSortIcon = () => {
        if (sortOrder === 'desc') {
            return <ArrowDown className="w-5 h-5" />;
        } else if (sortOrder === 'asc') {
            return <ArrowUp className="w-5 h-5" />;
        }
        return <ArrowUpDown className="w-5 h-5" />;
    };

    return (
        <LayoutAdmin user={user} currentPath="/admin/maintenance">
            {/* Title and Filters */}
            <div className="flex justify-between items-center mb-8 mt-6">
                <div>
                    <h1 className="text-3xl font-semibold text-[#7A2B1E]">Laporan Maintenance</h1>
                    <p className="text-base text-[#6B5D52] mt-1">
                        Kelola laporan kerusakan dan perbaikan
                    </p>
                </div>
                <div className="flex gap-3">
                    {/* Sort Button */}
                    <button
                        onClick={toggleSort}
                        className="px-6 py-3 bg-[#F5F2EE] text-[#7A2B1E] rounded-xl shadow-xl focus:outline-none text-base font-medium cursor-pointer hover:bg-[#E8E4DE] transition-colors flex items-center gap-2"
                        title={sortOrder === 'desc' ? 'Urutkan: Tinggi ke Rendah' : 'Urutkan: Rendah ke Tinggi'}
                    >
                        {renderSortIcon()}
                        <span>
                            {sortOrder === 'desc' ? 'Prioritas ↓' : 'Prioritas ↑'}
                        </span>
                    </button>

                    {/* Priority Filter */}
                    <select
                        value={filterPriority}
                        onChange={(e) => {
                            const newPriority = e.target.value;
                            setFilterPriority(newPriority);
                            handleFilterChange(filterStatus, newPriority, sortOrder);
                        }}
                        className="px-6 py-3 bg-[#F5F2EE] text-[#7A2B1E] rounded-xl shadow-xl focus:outline-none text-base font-medium cursor-pointer"
                    >
                        <option value="all">Semua Prioritas</option>
                        <option value="urgent">Mendesak</option>
                        <option value="high">Tinggi</option>
                        <option value="medium">Sedang</option>
                        <option value="low">Rendah</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => {
                            const newStatus = e.target.value;
                            setFilterStatus(newStatus);
                            handleFilterChange(newStatus, filterPriority, sortOrder);
                        }}
                        className="px-6 py-3 bg-[#F5F2EE] text-[#7A2B1E] rounded-xl shadow-xl focus:outline-none text-base font-medium cursor-pointer"
                    >
                        <option value="all">Semua Status</option>
                        <option value="pending">Menunggu</option>
                        <option value="in_progress">Sedang Proses</option>
                        <option value="done">Selesai</option>
                    </select>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-6 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-sm text-[#412E27] mb-2">Total</p>
                    <p className="text-3xl font-bold text-[#412E27]">{stats.total}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-sm text-[#412E27] mb-2">Pending</p>
                    <p className="text-3xl font-bold text-[#412E27]">{stats.pending}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-sm text-[#412E27] mb-2">Proses</p>
                    <p className="text-3xl font-bold text-[#412E27]">{stats.in_progress}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-sm text-[#412E27] mb-2">Selesai</p>
                    <p className="text-3xl font-bold text-[#412E27]">{stats.done}</p>
                </div>
                <div className="bg-red-50 rounded-lg shadow-sm p-6">
                    <p className="text-sm text-red-800 mb-2">Mendesak</p>
                    <p className="text-3xl font-bold text-red-600">{stats.urgent}</p>
                </div>
                <div className="bg-orange-50 rounded-lg shadow-sm p-6">
                    <p className="text-sm text-orange-800 mb-2">Tinggi</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.high}</p>
                </div>
            </div>

            {/* Laporan List */}
            <div className="space-y-6 mb-8">
                {laporans.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center">
                        <p className="text-gray-500 text-lg">Tidak ada laporan maintenance</p>
                    </div>
                ) : (
                    currentLaporans.map((laporan) => (
                        <div
                            key={laporan.id}
                            className="bg-[#F5F2EE] rounded-lg shadow-sm px-8 py-8 flex items-start justify-between"
                        >
                            <div className="flex items-start gap-6 flex-1">
                                {/* Icon */}
                                <div className={`${getIconColor(laporan.icon)} flex-shrink-0 mt-1`}>
                                    {renderIcon(laporan.icon)}
                                </div>

                                {/* Info Section */}
                                <div className="flex-1">
                                    {/* Room and Tenant Info */}
                                    <div className="flex items-center gap-4 mb-3">
                                        <h3 className="text-xl font-semibold text-[#412E27]">
                                            Kamar {laporan.kamar}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-[#6B5D52]">
                                            <User className="w-4 h-4" />
                                            <span>{laporan.tenant_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-[#6B5D52]">
                                            <Phone className="w-4 h-4" />
                                            <span>{laporan.tenant_phone}</span>
                                        </div>
                                    </div>

                                    {/* Title and Date */}
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="text-base font-semibold text-[#412E27]">
                                            {laporan.judul}
                                        </p>
                                        <div className="flex items-center gap-2 text-[#6B5D52] ml-4">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm font-medium whitespace-nowrap">
                                                {laporan.tanggal}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-[#6B5D52] mb-3">
                                        {laporan.deskripsi}
                                    </p>

                                    {/* Cost if available */}
                                    {laporan.biaya !== null && (
                                        <p className="text-sm font-medium text-[#412E27]">
                                            Biaya: Rp {laporan.biaya.toLocaleString('id-ID')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Priority and Status Dropdowns */}
                            <div className="ml-6 flex flex-col gap-3 flex-shrink-0">
                                {/* Priority Dropdown */}
                                <select
                                    value={laporan.priority}
                                    onChange={(e) => handlePriorityChange(laporan.id, e.target.value)}
                                    className={`${getPriorityBadgeColor(
                                        laporan.priority_color
                                    )} text-white text-sm font-medium px-6 py-2.5 rounded-lg w-[160px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
                                    style={{
                                        textAlign: 'center',
                                        textAlignLast: 'center',
                                    }}
                                >
                                    <option value="urgent" className="bg-white text-gray-800">
                                        Mendesak
                                    </option>
                                    <option value="high" className="bg-white text-gray-800">
                                        Tinggi
                                    </option>
                                    <option value="medium" className="bg-white text-gray-800">
                                        Sedang
                                    </option>
                                    <option value="low" className="bg-white text-gray-800">
                                        Rendah
                                    </option>
                                </select>

                                {/* Status Dropdown */}
                                <select
                                    value={laporan.status}
                                    onChange={(e) => handleStatusChange(laporan.id, e.target.value)}
                                    className={`${getStatusColor(
                                        laporan.status_color
                                    )} text-white text-sm font-medium px-6 py-2.5 rounded-lg w-[160px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
                                    style={{
                                        textAlign: 'center',
                                        textAlignLast: 'center',
                                    }}
                                >
                                    <option value="pending" className="bg-white text-gray-800">
                                        Menunggu
                                    </option>
                                    <option value="in_progress" className="bg-white text-gray-800">
                                        Proses
                                    </option>
                                    <option value="done" className="bg-white text-gray-800">
                                        Selesai
                                    </option>
                                </select>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {laporans.length > 0 && totalPages > 1 && (
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-4">
                        {/* Previous Button */}
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-full transition-colors ${
                                currentPage === 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-[#7A2B1E] text-white hover:bg-[#5C1F14]'
                            }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="font-medium"></span>
                        </button>

                        {/* Page Indicators */}
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-10 h-10 rounded-full font-semibold transition-all ${
                                        currentPage === page
                                            ? 'bg-[#7A2B1E] text-white scale-110 shadow-lg'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-full transition-colors ${
                                currentPage === totalPages
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-[#7A2B1E] text-white hover:bg-[#5C1F14]'
                            }`}
                        >
                            <span className="font-medium"></span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Page Info */}
                    <div className="text-center text-sm text-gray-600 mt-4">
                        Menampilkan {startIndex + 1}-{Math.min(endIndex, laporans.length)} dari {laporans.length} laporan
                    </div>
                </div>
            )}

            {/* Cost Input Modal */}
            {showCostModal && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowCostModal(false);
                            setSelectedLaporanId(null);
                            setCostInput('');
                        }
                    }}
                >
                    <div className="bg-white rounded-xl p-8 max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => {
                                setShowCostModal(false);
                                setSelectedLaporanId(null);
                                setCostInput('');
                            }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                            <DollarSign className="w-8 h-8 text-green-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-[#412E27] mb-3 text-center">
                            Input Biaya Perbaikan
                        </h2>

                        <p className="text-gray-600 text-center mb-6">
                            Masukkan total biaya yang dikeluarkan untuk perbaikan ini
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[#412E27] mb-2">
                                Total Biaya (Rp) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">
                                    Rp
                                </span>
                                <input
                                    type="text"
                                    value={costInput}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                        setCostInput(value);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleCostSubmit();
                                        }
                                        if (e.key === 'Escape') {
                                            setShowCostModal(false);
                                            setSelectedLaporanId(null);
                                            setCostInput('');
                                        }
                                    }}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] focus:border-[#7A2B1E] text-lg font-medium text-[#412E27] bg-white"
                                    placeholder="0"
                                    autoFocus
                                    autoComplete="off"
                                />
                            </div>
                            {costInput && (
                                <p className="text-sm text-gray-600 mt-2">
                                    = Rp {parseInt(costInput).toLocaleString('id-ID')}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                                Masukkan 0 jika tidak ada biaya
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCostModal(false);
                                    setSelectedLaporanId(null);
                                    setCostInput('');
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleCostSubmit}
                                className="flex-1 bg-[#214423] text-white py-3 rounded-lg font-medium hover:bg-[#1a3319] transition-colors"
                            >
                                Selesaikan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </LayoutAdmin>
    );
};

export default MaintenanceAdmin;