import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from '@/components/teraZ/user/LayoutUser';
import { Calendar, CheckCircle, Clock, AlertTriangle, X, CreditCard, Upload, Import, Image as ImageIcon } from 'lucide-react';

interface User {
    id: number;
    name: string;
    username: string;
    phone: string;
    role: string;
}

interface Payment {
    id: number;
    payment_type: string;
    payment_type_label: string;
    amount: number;
    due_date: string;
    payment_date: string | null;
    status: 'pending' | 'paid' | 'confirmed' | 'rejected';
    status_label: string;
    status_color: string;
    payment_method: string | null;
    reference: string | null; // Image URL
    has_proof_image: boolean;
    notes: string | null;
    period: string;
    is_overdue: boolean;
}

interface Stats {
    total: number;
    pending: number;
    waiting_approval: number;
    confirmed: number;
    overdue: number;
}

interface PembayaranPageProps {
    user: User;
    payments: Payment[];
    stats: Stats;
}

/** Helper format rupiah: 850000 -> "850.000" */
const rupiah = (v: number | string) =>
  Number(v).toLocaleString('id-ID', { maximumFractionDigits: 0 });

const PembayaranPage: React.FC<PembayaranPageProps> = ({ user, payments, stats }) => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [referenceFile, setReferenceFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [notes, setNotes] = useState<string>('');

    const getStatusBadgeColor = (statusColor: string) => {
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
                return <CheckCircle className="w-5 h-5" />;
            case 'paid':
                return <Clock className="w-5 h-5" />;
            case 'rejected':
                return <X className="w-5 h-5" />;
            default:
                return <AlertTriangle className="w-5 h-5" />;
        }
    };

    const handlePayClick = (payment: Payment) => {
        setSelectedPayment(payment);
        setPaymentMethod('');
        setReferenceFile(null);
        setPreviewUrl('');
        setNotes('');
        setShowPaymentModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran file maksimal 2MB');
                e.target.value = '';
                return;
            }

            // Validate file type
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                alert('Format file harus JPG, JPEG, atau PNG');
                e.target.value = '';
                return;
            }

            setReferenceFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = () => {
        setReferenceFile(null);
        setPreviewUrl('');
    };

    const handlePaymentSubmit = () => {
        if (!selectedPayment) return;

        if (!paymentMethod) {
            alert('Pilih metode pembayaran');
            return;
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('payment_id', selectedPayment.id.toString());
        formData.append('payment_method', paymentMethod);
        if (notes) formData.append('notes', notes);
        if (referenceFile) formData.append('reference', referenceFile); // Upload to reference field

        router.post('/pembayaran/confirm', formData, {
            preserveState: false,
            preserveScroll: false,
            forceFormData: true,
            onSuccess: () => {
                setShowPaymentModal(false);
                setSelectedPayment(null);
                setPaymentMethod('');
                setReferenceFile(null);
                setPreviewUrl('');
                setNotes('');
                alert('✅ Pembayaran berhasil dikonfirmasi!');
            },
            onError: (errors) => {
                console.error('Payment confirmation failed:', errors);
                alert('❌ Gagal mengkonfirmasi pembayaran. Silakan coba lagi.');
            },
        });
    };

    return (
        <>
            <Head title="Pembayaran" />

            <Layout user={user} currentPath="/pembayaran">
                {/* Page Title */}
                <h1 className="text-3xl font-semibold text-[#7A2B1E] mt-8 mb-8">
                    Pembayaran Sewa
                </h1>

                {/* Statistics Cards */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-100 rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-800 mb-2">Total Tagihan</p>
                        <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg shadow-md p-6">
                        <p className="text-sm text-yellow-800 mb-2">Belum Bayar</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg shadow-md p-6">
                        <p className="text-sm text-blue-800 mb-2">Menunggu</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.waiting_approval}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg shadow-md p-6">
                        <p className="text-sm text-green-800 mb-2">Lunas</p>
                        <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                    </div>
                </div>

                {/* Payment List */}
                <div className="bg-[#F7ECE0] rounded-xl p-8 shadow-md">
                    <h2 className="text-2xl font-semibold text-[#412E27] mb-6">
                        Riwayat Pembayaran
                    </h2>

                    <div className="space-y-4">
                        {payments.length === 0 ? (
                            <div className="bg-white rounded-lg p-8 text-center">
                                <p className="text-gray-500">Belum ada tagihan pembayaran</p>
                            </div>
                        ) : (
                            payments.map((payment) => (
                                <div key={payment.id} className="bg-white rounded-lg p-6 shadow-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-xl font-semibold text-[#412E27]">
                                                    {payment.payment_type_label}
                                                </h3>
                                                <span className={`px-4 py-1 rounded-md text-sm font-medium flex items-center gap-2 ${getStatusBadgeColor(payment.status_color)}`}>
                                                    {getStatusIcon(payment.status)}
                                                    {payment.status_label}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Periode</p>
                                                    <p className="text-base font-medium text-[#412E27]">
                                                        {payment.period}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Jumlah</p>
                                                    <p className="text-xl font-bold text-[#7A2B1E]">
                                                        Rp {rupiah(payment.amount)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 text-sm text-[#412E27]">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Jatuh tempo: {payment.due_date}</span>
                                                </div>
                                                {payment.payment_date && (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>Dibayar: {payment.payment_date}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {payment.payment_method && (
                                                <div className="mt-3 text-sm text-gray-600">
                                                    <span>Metode: {payment.payment_method.toUpperCase()}</span>
                                                </div>
                                            )}

                                            {/* Show payment proof image if exists */}
                                            {payment.has_proof_image && payment.reference && (
                                                <div className="mt-3">
                                                    <p className="text-sm text-gray-600 mb-2">Bukti Pembayaran:</p>
                                                    <img
                                                        src={payment.reference}
                                                        alt="Bukti Pembayaran"
                                                        className="w-48 h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:opacity-80"
                                                        onClick={() => window.open(payment.reference!, '_blank')}
                                                    />
                                                </div>
                                            )}

                                            {payment.status === 'rejected' && payment.notes && (
                                                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                                    <p className="text-sm text-red-800">
                                                        <strong>Alasan Penolakan:</strong> {payment.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {(payment.status === 'pending' || payment.status === 'rejected') && (
                                            <button
                                              onClick={() => handlePayClick(payment)}
                                              className="ml-3 inline-flex items-center gap-2 px-3 py-2 bg-[#6B5D52] text-white text-sm font-medium rounded-md hover:bg-[#5C4E43] transition-colors"
                                            >
                                              <Import className="w-4 h-4" />
                                              Upload Bukti Bayar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Payment Confirmation Modal */}
                {showPaymentModal && selectedPayment && (
                    <div className="text-black fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setSelectedPayment(null);
                                }}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                                <CreditCard className="w-8 h-8 text-green-600" />
                            </div>

                            <h2 className="text-2xl font-bold text-[#412E27] mb-3 text-center">
                                Konfirmasi Pembayaran
                            </h2>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-600">Periode</p>
                                <p className="text-lg font-semibold text-[#412E27]">{selectedPayment.period}</p>
                                <p className="text-sm text-gray-600 mt-2">Jumlah</p>
                                <p className="text-2xl font-bold text-[#7A2B1E]">
                                    Rp {rupiah(selectedPayment.amount)}
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Metode Pembayaran <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] text-[#412E27]"
                                    required
                                >
                                    <option value="">Pilih metode</option>
                                    <option value="transfer">Transfer Bank</option>
                                    <option value="qris">QRIS</option>
                                    <option value="cash">Tunai</option>
                                </select>
                            </div>

                            {/* Photo Upload Section */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Bukti Pembayaran (Opsional)
                                </label>

                                {!previewUrl ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#7A2B1E] transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="payment-proof"
                                        />
                                        <label htmlFor="payment-proof" className="cursor-pointer">
                                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600 mb-1">
                                                Klik untuk upload foto
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                JPG, JPEG, PNG (Max 2MB)
                                            </p>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                                            <ImageIcon className="w-4 h-4" />
                                            <span>{referenceFile?.name}</span>
                                        </div>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    💡 Upload screenshot/foto bukti transfer untuk mempercepat verifikasi
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Catatan (Opsional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] resize-none text-[#412E27]"
                                    placeholder="Catatan tambahan"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setSelectedPayment(null);
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handlePaymentSubmit}
                                    className="flex-1 bg-[#7A2B1E] text-white py-3 rounded-lg font-medium hover:bg-[#4e1108] transition-colors"
                                >
                                    Konfirmasi
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Layout>
        </>
    );
};

export default PembayaranPage;
