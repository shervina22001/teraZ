import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import LayoutAdmin from '@/components/teraZ/admin/LayoutAdmin';
import { Calendar, DollarSign, CheckCircle, X, Plus, Clock, AlertTriangle, User, Phone, Home, Image as ImageIcon, Eye, ZoomIn } from 'lucide-react';

interface KeuanganAdminProps {
    user: {
        name: string;
        id: number;
        role: string;
    };
    payments: Payment[];
    stats: {
        total: number;
        pending: number;
        waiting_approval: number;
        confirmed: number;
        rejected: number;
    };
    tenants: Tenant[];
    filters: {
        status: string | null;
    };
}

interface Payment {
    id: number;
    tenant_name: string;
    tenant_phone: string;
    room_number: string;
    payment_type: string;
    payment_type_label: string;
    amount: number;
    due_date: string;
    payment_date: string | null;
    status: 'pending' | 'paid' | 'confirmed' | 'rejected';
    status_label: string;
    status_color: string;
    payment_method: string | null;
    reference: string | null;
    has_proof_image: boolean;
    notes: string | null;
    period: string;
    is_overdue: boolean;
}

interface Tenant {
    id: number;
    nama: string;
    room_number: string;
    room_price: number;
}

const KeuanganAdmin: React.FC<KeuanganAdminProps> = ({ user, payments, stats, tenants, filters }) => {
    const [filterStatus, setFilterStatus] = useState<string>(filters.status || 'all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>('');

    // Create payment form
    const [tenantId, setTenantId] = useState('');
    const [paymentType, setPaymentType] = useState('rent');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [periodMonth, setPeriodMonth] = useState('');
    const [periodYear, setPeriodYear] = useState(new Date().getFullYear().toString());
    const [notes, setNotes] = useState('');

    // Generate payments form
    const [generateMonth, setGenerateMonth] = useState('');
    const [generateYear, setGenerateYear] = useState(new Date().getFullYear().toString());

    // Reject reason
    const [rejectionReason, setRejectionReason] = useState('');

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const getStatusColor = (statusColor: string) => {
        switch (statusColor) {
            case 'green':
                return 'bg-[#2E6B4A] text-white';
            case 'blue':
                return 'bg-[#2E5A8B] text-white';
            case 'yellow':
                return 'bg-[#D97236] text-white';
            case 'red':
                return 'bg-[#8B2E1F] text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="w-4 h-4" />;
            case 'paid':
                return <Clock className="w-4 h-4" />;
            case 'rejected':
                return <X className="w-4 h-4" />;
            default:
                return <AlertTriangle className="w-4 h-4" />;
        }
    };

    const handleFilterChange = (newStatus: string) => {
        const url = newStatus !== 'all' ? `/admin/keuangan?status=${newStatus}` : '/admin/keuangan';
        router.get(url, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleTenantChange = (tenantId: string) => {
        setTenantId(tenantId);
        if (tenantId) {
            const selectedTenant = tenants.find(t => t.id === parseInt(tenantId));
            if (selectedTenant && paymentType === 'rent') {
                setAmount(selectedTenant.room_price.toString());
            }
        } else {
            setAmount('');
        }
    };

    const handlePaymentTypeChange = (type: string) => {
        setPaymentType(type);
        if (type === 'rent' && tenantId) {
            const selectedTenant = tenants.find(t => t.id === parseInt(tenantId));
            if (selectedTenant) {
                setAmount(selectedTenant.room_price.toString());
            }
        } else if (type !== 'rent') {
            setAmount('');
        }
    };

    const handleCreatePayment = () => {
        if (!tenantId || !amount || !dueDate || !periodMonth) {
            alert('Mohon lengkapi semua field yang wajib diisi');
            return;
        }

        router.post('/admin/payments', {
            tenant_id: tenantId,
            payment_type: paymentType,
            amount: parseFloat(amount),
            due_date: dueDate,
            period_month: parseInt(periodMonth),
            period_year: parseInt(periodYear),
            notes: notes,
        }, {
            preserveState: false,
            preserveScroll: false,
            onSuccess: () => {
                setShowCreateModal(false);
                resetCreateForm();
                alert('✅ Tagihan berhasil dibuat');
            },
            onError: (errors) => {
                console.error('Create failed:', errors);
                alert('❌ Gagal membuat tagihan');
            },
        });
    };

    const handleGeneratePayments = () => {
        if (!generateMonth || !generateYear) {
            alert('Pilih bulan dan tahun');
            return;
        }

        if (confirm(`Buat tagihan sewa untuk semua tenant aktif periode ${months[parseInt(generateMonth) - 1]} ${generateYear}?`)) {
            router.post('/admin/payments/generate', {
                period_month: parseInt(generateMonth),
                period_year: parseInt(generateYear),
            }, {
                preserveState: false,
                preserveScroll: false,
                onSuccess: () => {
                    setShowGenerateModal(false);
                    setGenerateMonth('');
                },
                onError: (errors) => {
                    console.error('Generate failed:', errors);
                },
            });
        }
    };

    const handleViewDetail = (payment: Payment) => {
        setSelectedPayment(payment);
        setShowDetailModal(true);
    };

    const handleViewImage = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    const handleApprove = () => {
        if (!selectedPayment) return;

        router.post(`/admin/payments/${selectedPayment.id}/approve`, {}, {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setShowApproveModal(false);
                setShowDetailModal(false);
                setSelectedPayment(null);
            },
            onError: (errors) => {
                console.error('Approve failed:', errors);
            },
        });
    };

    const handleReject = () => {
        if (!selectedPayment) return;

        router.post(`/admin/payments/${selectedPayment.id}/reject`, {
            rejection_reason: rejectionReason,
        }, {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectModal(false);
                setShowDetailModal(false);
                setSelectedPayment(null);
                setRejectionReason('');
            },
            onError: (errors) => {
                console.error('Reject failed:', errors);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus tagihan ini?')) {
            router.delete(`/admin/payments/${id}`, {
                preserveState: false,
                preserveScroll: true,
            });
        }
    };

    const resetCreateForm = () => {
        setTenantId('');
        setPaymentType('rent');
        setAmount('');
        setDueDate('');
        setPeriodMonth('');
        setPeriodYear(new Date().getFullYear().toString());
        setNotes('');
    };

    return (
        <LayoutAdmin user={user} currentPath="/admin/keuangan">
            {/* Title and Actions */}
            <div className="flex justify-between items-center mb-8 mt-6">
                <div>
                    <h1 className="text-3xl font-semibold text-[#7A2B1E]">Manajemen Keuangan</h1>
                    <p className="text-base text-[#6B5D52] mt-1">
                        Kelola pembayaran dan tagihan tenant
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowGenerateModal(true)}
                        className="px-6 py-3 bg-[#2E5A8B] text-white rounded-xl shadow-xl hover:bg-[#234670] transition-colors flex items-center gap-2"
                    >
                        <Calendar className="w-5 h-5" />
                        Generate Tagihan
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-[#7A2B1E] text-white rounded-xl shadow-xl hover:bg-[#561E15] transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Buat Tagihan
                    </button>
                    <select
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            handleFilterChange(e.target.value);
                        }}
                        className="px-6 py-3 bg-[#F5F2EE] text-[#7A2B1E] rounded-xl shadow-xl focus:outline-none text-base font-medium cursor-pointer"
                    >
                        <option value="all">Semua Status</option>
                        <option value="pending">Belum Bayar</option>
                        <option value="paid">Menunggu Konfirmasi</option>
                        <option value="confirmed">Lunas</option>
                        <option value="rejected">Ditolak</option>
                    </select>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-5 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-sm text-[#412E27] mb-2">Total Tagihan</p>
                    <p className="text-3xl font-bold text-[#412E27]">{stats.total}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg shadow-sm p-6">
                    <p className="text-sm text-yellow-800 mb-2">Belum Bayar</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-blue-50 rounded-lg shadow-sm p-6">
                    <p className="text-sm text-blue-800 mb-2">Menunggu</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.waiting_approval}</p>
                </div>
                <div className="bg-green-50 rounded-lg shadow-sm p-6">
                    <p className="text-sm text-green-800 mb-2">Lunas</p>
                    <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <div className="bg-red-50 rounded-lg shadow-sm p-6">
                    <p className="text-sm text-red-800 mb-2">Ditolak</p>
                    <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                </div>
            </div>

            {/* Payments List - REDESIGNED */}
            <div className="space-y-4">
                {payments.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center">
                        <p className="text-gray-500 text-lg">Tidak ada tagihan pembayaran</p>
                    </div>
                ) : (
                    payments.map((payment) => (
                        <div
                            key={payment.id}
                            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100"
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-6">
                                    {/* Left: Image Preview */}
                                    {payment.has_proof_image && payment.reference ? (
                                        <div className="flex-shrink-0">
                                            <div
                                                className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer group"
                                                onClick={() => handleViewImage(payment.reference!)}
                                            >
                                                <img
                                                    src={payment.reference}
                                                    alt="Bukti Pembayaran"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <ZoomIn className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-center text-gray-500 mt-2">Klik untuk perbesar</p>
                                        </div>
                                    ) : (
                                        <div className="flex-shrink-0">
                                            <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                                                <div className="text-center">
                                                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-xs text-gray-500">Tidak ada bukti</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Middle: Payment Info */}
                                    <div className="flex-1">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-[#412E27]">
                                                        {payment.tenant_name}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatusColor(payment.status_color)}`}>
                                                        {getStatusIcon(payment.status)}
                                                        {payment.status_label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <Home className="w-4 h-4" />
                                                        <span>Kamar {payment.room_number}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="w-4 h-4" />
                                                        <span>{payment.tenant_phone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Details Grid */}
                                        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Periode</p>
                                                <p className="text-sm font-semibold text-[#412E27]">{payment.period}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Jenis</p>
                                                <p className="text-sm font-semibold text-[#412E27]">{payment.payment_type_label}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Jatuh Tempo</p>
                                                <p className="text-sm font-semibold text-[#412E27]">{payment.due_date}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Jumlah</p>
                                                <p className="text-lg font-bold text-[#7A2B1E]">
                                                    Rp {payment.amount.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        {payment.payment_method && (
                                            <div className="flex items-center gap-6 text-sm mb-3">
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <DollarSign className="w-4 h-4" />
                                                    <span className="font-medium">Metode:</span>
                                                    <span className="font-semibold text-[#412E27]">{payment.payment_method.toUpperCase()}</span>
                                                </div>
                                                {payment.payment_date && (
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="font-medium">Dibayar:</span>
                                                        <span className="font-semibold text-[#412E27]">{payment.payment_date}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {payment.notes && (
                                            <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded">
                                                <p className="text-sm text-amber-900">
                                                    <span className="font-semibold">Catatan:</span> {payment.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex-shrink-0 flex flex-col gap-2">
                                        <button
                                            onClick={() => handleViewDetail(payment)}
                                            className="px-4 py-2 bg-[#7A2B1E] text-white rounded-lg text-sm font-medium hover:bg-[#561E15] transition-colors flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Detail
                                        </button>

                                        {payment.status === 'paid' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedPayment(payment);
                                                        setShowApproveModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                                >
                                                    Setujui
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedPayment(payment);
                                                        setShowRejectModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                                >
                                                    Tolak
                                                </button>
                                            </>
                                        )}

                                        {(payment.status === 'pending' || payment.status === 'rejected') && (
                                            <button
                                                onClick={() => handleDelete(payment.id)}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedPayment && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => {
                                setShowDetailModal(false);
                                setSelectedPayment(null);
                            }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-[#412E27] mb-6">Detail Pembayaran</h2>

                        <div className="space-y-6">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <span className={`px-6 py-3 rounded-lg text-base font-semibold flex items-center gap-2 ${getStatusColor(selectedPayment.status_color)}`}>
                                    {getStatusIcon(selectedPayment.status)}
                                    {selectedPayment.status_label}
                                </span>
                            </div>

                            {/* Tenant Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Informasi Tenant</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Nama</p>
                                        <p className="text-base font-semibold text-[#412E27]">{selectedPayment.tenant_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Kamar</p>
                                        <p className="text-base font-semibold text-[#412E27]">Kamar {selectedPayment.room_number}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-500">No. Telepon</p>
                                        <p className="text-base font-semibold text-[#412E27]">{selectedPayment.tenant_phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Detail Pembayaran</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Periode</p>
                                        <p className="text-base font-semibold text-[#412E27]">{selectedPayment.period}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Jenis</p>
                                        <p className="text-base font-semibold text-[#412E27]">{selectedPayment.payment_type_label}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Jatuh Tempo</p>
                                        <p className="text-base font-semibold text-[#412E27]">{selectedPayment.due_date}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Jumlah</p>
                                        <p className="text-xl font-bold text-[#7A2B1E]">
                                            Rp {selectedPayment.amount.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    {selectedPayment.payment_method && (
                                        <>
                                            <div>
                                                <p className="text-xs text-gray-500">Metode Pembayaran</p>
                                                <p className="text-base font-semibold text-[#412E27]">{selectedPayment.payment_method.toUpperCase()}</p>
                                            </div>
                                            {selectedPayment.payment_date && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Tanggal Pembayaran</p>
                                                    <p className="text-base font-semibold text-[#412E27]">{selectedPayment.payment_date}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Payment Proof */}
                            {selectedPayment.has_proof_image && selectedPayment.reference && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Bukti Pembayaran</h3>
                                    <div
                                        className="relative rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer group"
                                        onClick={() => handleViewImage(selectedPayment.reference!)}
                                    >
                                        <img
                                            src={selectedPayment.reference}
                                            alt="Bukti Pembayaran"
                                            className="w-full h-64 object-contain bg-gray-100 group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <ZoomIn className="w-12 h-12 mx-auto mb-2" />
                                                <p className="text-sm font-medium">Klik untuk perbesar</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedPayment.notes && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Catatan</h3>
                                    <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
                                        <p className="text-sm text-amber-900">{selectedPayment.notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            {selectedPayment.status === 'paid' && (
                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            setShowApproveModal(true);
                                        }}
                                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                                    >
                                        Setujui Pembayaran
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            setShowRejectModal(true);
                                        }}
                                        className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                                    >
                                        Tolak Pembayaran
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Image Lightbox Modal */}
            {showImageModal && selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
                    onClick={() => setShowImageModal(false)}
                >
                    <button
                        onClick={() => setShowImageModal(false)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Bukti Pembayaran Full"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Create Payment Modal */}
            {showCreateModal && (
                <div className="text-black fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => {
                                setShowCreateModal(false);
                                resetCreateForm();
                            }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-[#412E27] mb-6">Buat Tagihan Baru</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Tenant <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={tenantId}
                                    onChange={(e) => handleTenantChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                                    required
                                >
                                    <option value="">Pilih Tenant</option>
                                    {tenants.map((tenant) => (
                                        <option key={tenant.id} value={tenant.id}>
                                            {tenant.nama} - Kamar {tenant.room_number} (Rp {tenant.room_price.toLocaleString('id-ID')}/bulan)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Jenis Pembayaran <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={paymentType}
                                    onChange={(e) => handlePaymentTypeChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                                >
                                    <option value="rent">Sewa Bulanan</option>
                                    <option value="deposit">Deposit</option>
                                    <option value="utilities">Utilitas</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    💡 Sewa Bulanan otomatis mengisi harga kamar
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Jumlah (Rp) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={amount ? parseFloat(amount).toLocaleString('id-ID') : ''}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setAmount(value);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                                    placeholder="0"
                                    required
                                />
                                {amount && (
                                    <p className="text-xs text-green-600 mt-1">
                                        = Rp {parseFloat(amount).toLocaleString('id-ID')}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Tanggal Jatuh Tempo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Bulan Periode <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={periodMonth}
                                    onChange={(e) => setPeriodMonth(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                                    required
                                >
                                    <option value="">Pilih Bulan</option>
                                    {months.map((month, index) => (
                                        <option key={index + 1} value={index + 1}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Tahun Periode <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={periodYear}
                                    onChange={(e) => setPeriodYear(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                                    min="2020"
                                    max="2100"
                                    required
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Catatan (Opsional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] resize-none"
                                    rows={3}
                                    placeholder="Catatan tambahan"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetCreateForm();
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleCreatePayment}
                                className="flex-1 bg-[#7A2B1E] text-white py-3 rounded-lg font-medium hover:bg-[#561E15] transition-colors"
                            >
                                Buat Tagihan
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Generate Payments Modal */}
            {showGenerateModal && (
                <div className="text-black fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full relative">
                        <button
                            onClick={() => setShowGenerateModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-blue-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-[#412E27] mb-3 text-center">
                            Generate Tagihan Bulanan
                        </h2>

                        <p className="text-gray-600 text-center mb-6">
                            Buat tagihan sewa untuk semua tenant aktif
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Bulan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={generateMonth}
                                    onChange={(e) => setGenerateMonth(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                                    required
                                >
                                    <option value="">Pilih</option>
                                    {months.map((month, index) => (
                                        <option key={index + 1} value={index + 1}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Tahun <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={generateYear}
                                    onChange={(e) => setGenerateYear(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                                    min="2020"
                                    max="2100"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowGenerateModal(false)}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleGeneratePayments}
                                className="flex-1 bg-[#2E5A8B] text-white py-3 rounded-lg font-medium hover:bg-[#234670] transition-colors"
                            >
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Modal */}
            {showApproveModal && selectedPayment && (
                <div className="text-black fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full relative">
                        <button
                            onClick={() => {
                                setShowApproveModal(false);
                                setSelectedPayment(null);
                            }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-[#412E27] mb-3 text-center">
                            Setujui Pembayaran
                        </h2>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-600">Tenant</p>
                            <p className="text-lg font-semibold text-[#412E27]">{selectedPayment.tenant_name}</p>
                            <p className="text-sm text-gray-600 mt-2">Periode</p>
                            <p className="text-base font-medium text-[#412E27]">{selectedPayment.period}</p>
                            <p className="text-sm text-gray-600 mt-2">Jumlah</p>
                            <p className="text-xl font-bold text-[#7A2B1E]">
                                Rp {selectedPayment.amount.toLocaleString('id-ID')}
                            </p>
                            {selectedPayment.payment_method && (
                                <>
                                    <p className="text-sm text-gray-600 mt-2">Metode</p>
                                    <p className="text-base font-medium text-[#412E27]">
                                        {selectedPayment.payment_method.toUpperCase()}
                                        {selectedPayment.reference && ` - ${selectedPayment.reference}`}
                                    </p>
                                </>
                            )}
                        </div>

                        <p className="text-center text-gray-600 mb-6">
                            Apakah Anda yakin ingin menyetujui pembayaran ini?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setSelectedPayment(null);
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleApprove}
                                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                                Setujui
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedPayment && (
                <div className="text-black fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full relative">
                        <button
                            onClick={() => {
                                setShowRejectModal(false);
                                setSelectedPayment(null);
                                setRejectionReason('');
                            }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                            <X className="w-8 h-8 text-red-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-[#412E27] mb-3 text-center">
                            Tolak Pembayaran
                        </h2>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600">Tenant</p>
                            <p className="text-lg font-semibold text-[#412E27]">{selectedPayment.tenant_name}</p>
                            <p className="text-sm text-gray-600 mt-2">Periode</p>
                            <p className="text-base font-medium text-[#412E27]">{selectedPayment.period}</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[#412E27] mb-2">
                                Alasan Penolakan (Opsional)
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                placeholder="Jelaskan alasan penolakan..."
                                rows={4}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedPayment(null);
                                    setRejectionReason('');
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                Tolak
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </LayoutAdmin>
    );
};

export default KeuanganAdmin;
