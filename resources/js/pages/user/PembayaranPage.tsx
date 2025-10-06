import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Layout from '@/components/teraZ/user/LayoutUser';
import { Calendar, CheckCircle, Upload, X, Receipt } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    photo?: string;
}

interface Payment {
    id: number;
    title: string;
    amount: number;
    due_date: string;
    paid_date?: string;
    status: 'Terlambat' | 'Lunas' | 'Belum Dibayar';
}

interface PembayaranProps {
    user: User;
    payments: Payment[];
}

const Pembayaran: React.FC<PembayaranProps> = ({ user, payments }) => {
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const { data, setData, post, processing, reset } = useForm({
        payment_id: 0,
        payment_method: '',
        payment_proof: null as File | null,
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handlePaymentClick = (payment: Payment) => {
        if (payment.status === 'Terlambat' || payment.status === 'Belum Dibayar') {
            setSelectedPayment(payment);
            setData('payment_id', payment.id);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('payment_proof', e.target.files[0]);
        }
    };

    const handleSubmitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/pembayaran/confirm', {
            onSuccess: () => {
                setSelectedPayment(null);
                reset();
            },
        });
    };

    const handleCloseModal = () => {
        setSelectedPayment(null);
        reset();
    };

    return (
        <>
            <Head title="Pembayaran" />

            <Layout user={user} currentPath="/pembayaran">
                <div className="min-h-screen">
                    {/* Page Title */}
                    <h1 className="text-3xl font-semibold text-[#7A2B1E] mt-8 mb-8">Pembayaran</h1>

                    {/* Payment List */}
                    <div className="space-y-6">
                    {payments.map((payment) => (
                        <div
                            key={payment.id}
                            className="bg-white border-2 border-[#C8B8A8] rounded-xl p-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                {/* Left Section - Payment Info */}
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-[#412E27] mb-3">
                                        {payment.title}
                                    </h3>
                                    
                                    <div className="flex items-center gap-3 text-[#615348] mb-2">
                                        <Calendar className="w-5 h-5 font" />
                                        <span>
                                            Jatuh tempo: <span className="font-semibold">{formatDate(payment.due_date)}</span>
                                        </span>
                                        </div>

                                        {payment.paid_date && (
                                            <div className="flex items-center gap-3 text-[#615348]">
                                                <CheckCircle className="w-5 h-5" />
                                                <span>
                                                Dibayar: <span className="font-semibold">{formatDate(payment.paid_date)}</span>
                                                </span>
                                            </div>
                                        )}
                                </div>

                                {/* Right Section - Amount & Action */}
                                <div className="flex items-center gap-6">
                                    <div className="text-right w-40">
                                        <p className="text-2xl font-semibold text-[#412E27]">
                                            {formatCurrency(payment.amount)}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 w-36">
                                        {payment.status === 'Terlambat' && (
                                            <button
                                                className="w-full py-2 rounded-lg font-medium bg-red-500 text-white"
                                                disabled
                                            >
                                                Terlambat
                                            </button>
                                        )}
                                        
                                        {payment.status === 'Lunas' ? (
                                            <button
                                                className="w-full py-2 rounded-lg font-medium bg-green-600 text-white"
                                                disabled
                                            >
                                                Lunas
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handlePaymentClick(payment)}
                                                className="flex items-center justify-center gap-2 w-full py-2 rounded-sm font-medium bg-[#F1E0CB] text-[#412E27] hover:bg-[#a89681] transition-colors"
                                            >
                                                <Receipt className="w-5 h-5" />
                                                Bukti Bayar
                                            </button>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
            </Layout>

            {/* Payment Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full relative">
                        {/* Close Button */}
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-[#412E27] hover:text-[#7A2B1E]"
                            type="button"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Modal Title */}
                        <h2 className="text-2xl font-semibold text-[#412E27] mb-2">
                            Konfirmasi Pembayaran
                        </h2>
                        <p className="text-[#615348] mb-6">
                            {selectedPayment.title} - {formatCurrency(selectedPayment.amount)}
                        </p>

                        <form onSubmit={handleSubmitPayment}>
                            {/* Payment Method */}
                            <div className="mb-6">
                                <label className="block text-[#412E27] font-medium mb-2">
                                    Metode Pembayaran
                                </label>
                                <select
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-[#C8B8A8] text-[#412E27] focus:outline-none focus:border-[#7A2B1E]"
                                    required
                                >
                                    <option value="" disabled> Pilih Metode Pembayaran</option>
                                    <option value="transfer">Transfer Bank</option>
                                    <option value="cash">Tunai</option>
                                    <option value="ewallet">E-Wallet</option>
                                </select>
                            </div>

                            {/* Upload Proof */}
                            <div className="mb-8">
                                <label className="block text-[#412E27] font-medium mb-2">
                                    Upload Bukti Pembayaran
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        id="payment-proof"
                                        required
                                    />
                                    <label
                                        htmlFor="payment-proof"
                                        className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-[#C8B8A8] text-[#615348] cursor-pointer hover:border-[#7A2B1E] transition-colors"
                                    >
                                        <span>
                                            {data.payment_proof ? data.payment_proof.name : 'Pilih File'}
                                        </span>
                                        <Upload className="w-5 h-5" />
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!data.payment_method || !data.payment_proof || processing}
                                className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                                    data.payment_method && data.payment_proof && !processing
                                        ? 'bg-[#7A2B1E] hover:bg-[#5A1B0E]'
                                        : 'bg-[#C8B8A8] cursor-not-allowed'
                                }`}
                            >
                                {processing ? 'Mengirim...' : 'Konfirmasi Pembayaran'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Pembayaran;