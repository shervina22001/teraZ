import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from '@/components/teraZ/user/LayoutUser';
import { Calendar, CheckCircle } from 'lucide-react';

interface User {
    id: number;
    name: string;
    username: string;
    phone: string;
    role: string;
}

interface MaintenanceReport {
    id: number;
    title: string;
    description: string;
    reported_date: string;
    resolved_date?: string;
    room_number: string;
    priority: string;
    priority_color: string;
    status: string;
    status_color: string;
}

interface MaintenancePageProps {
    user: User;
    reports: MaintenanceReport[];
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ user, reports }) => {
    const [issueType, setIssueType] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getStatusBadgeColor = (statusColor: string) => {
        switch (statusColor) {
            case 'yellow':
                return 'bg-[#D97236] text-white';
            case 'blue':
                return 'bg-[#2E5A8B] text-white';
            case 'green':
                return 'bg-[#2E6B4A] text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getPriorityBadgeColor = (priorityColor: string) => {
        switch (priorityColor) {
            case 'red':
                return 'bg-[#8B2E1F] text-white';
            case 'orange':
                return 'bg-[#D97236] text-white';
            case 'blue':
                return 'bg-[#2E5A8B] text-white';
            case 'gray':
                return 'bg-[#6B7280] text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!issueType.trim() || !description.trim()) {
            alert('Mohon isi semua field yang diperlukan');
            return;
        }

        setIsSubmitting(true);

        router.post(
            '/lapor-kerusakan',
            {
                title: issueType,
                description: description,
            },
            {
                preserveState: false,
                preserveScroll: false,
                onSuccess: () => {
                    setIssueType('');
                    setDescription('');
                    setIsSubmitting(false);
                    alert('✅ Laporan berhasil dikirim!');
                },
                onError: (errors) => {
                    console.error('Submit failed:', errors);
                    setIsSubmitting(false);
                    alert('❌ Gagal mengirim laporan. Silakan coba lagi.');
                },
            }
        );
    };

    return (
        <>
            <Head title="Laporan Maintenance" />

            <Layout user={user} currentPath="/lapor-kerusakan">
                {/* Page Title */}
                <h1 className="text-3xl font-semibold text-[#7A2B1E] mt-8 mb-8">
                    Laporan Kerusakan
                </h1>

                {/* Riwayat Laporan Section */}
                <div className="bg-[#F7ECE0] rounded-xl p-8 shadow-md mb-8">
                    <h2 className="text-2xl font-semibold text-[#412E27] mb-6">
                        Riwayat Laporan
                    </h2>

                    <div className="space-y-4">
                        {reports.length === 0 ? (
                            <div className="bg-white rounded-lg p-8 text-center">
                                <p className="text-gray-500">Belum ada laporan kerusakan</p>
                            </div>
                        ) : (
                            reports.map((report) => (
                                <div key={report.id} className="bg-white rounded-lg p-6 shadow-lg">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-semibold text-[#412E27]">
                                                    {report.title}
                                                </h3>
                                                <span className="text-sm text-gray-600">
                                                    • Kamar {report.room_number}
                                                </span>
                                            </div>
                                            <p className="text-[#412E27] text-md mb-3">
                                                {report.description}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <span
                                                className={`px-4 py-1 rounded-md text-sm font-medium ${getPriorityBadgeColor(
                                                    report.priority_color
                                                )}`}
                                            >
                                                {report.priority}
                                            </span>
                                            <span
                                                className={`px-4 py-1 rounded-md text-sm font-medium ${getStatusBadgeColor(
                                                    report.status_color
                                                )}`}
                                            >
                                                {report.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-[#412E27]">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Dilaporkan pada {report.reported_date}</span>
                                        </div>
                                        {report.resolved_date && (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Selesai pada {report.resolved_date}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Buat Laporan Section */}
                <div className="bg-white border-6 border-[#F7ECE0] rounded-xl p-8 shadow-xl">
                    <h2 className="text-2xl font-semibold text-[#412E27] mb-6">
                        Buat Laporan Baru
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Jenis Masalah */}
                            <div>
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Jenis Masalah <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={issueType}
                                    onChange={(e) => setIssueType(e.target.value)}
                                    placeholder="contoh: lampu mati, keran bocor"
                                    className="w-full px-4 py-2 border border-[#D1C4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] bg-white text-[#412E27]"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Deskripsi Detail */}
                            <div>
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Deskripsi Detail <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="jelaskan masalah secara detail..."
                                    className="w-full px-4 py-2 border border-[#D1C4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] bg-white text-[#412E27]"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-sm text-gray-600 mb-4">
                                * Admin akan menentukan tingkat prioritas laporan Anda
                            </p>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#7A2B1E] text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-[#4e1108] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                            </button>
                        </div>
                    </form>
                </div>
            </Layout>
        </>
    );
};

export default MaintenancePage;
