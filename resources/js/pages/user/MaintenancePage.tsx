import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from '@/components/teraZ/user/LayoutUser';
import { Calendar, CheckCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';

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

    // Alert states
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(reports.length / itemsPerPage);

    // Get current page reports
    const getCurrentPageReports = () => {
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return reports.slice(startIndex, endIndex);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handlePageClick = (pageIndex: number) => {
        setCurrentPage(pageIndex);
    };

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
            setAlertMessage('Mohon isi semua field yang diperlukan');
            setShowErrorAlert(true);
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
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIssueType('');
                    setDescription('');
                    setIsSubmitting(false);
                    setAlertMessage('Laporan berhasil dikirim! Admin akan segera menindaklanjuti laporan Anda.');
                    setShowSuccessAlert(true);
                    
                    // Refresh data and reset to first page
                    setCurrentPage(0);
                    router.reload({ only: ['reports'] });
                },
                onError: (errors) => {
                    console.error('Submit failed:', errors);
                    setIsSubmitting(false);
                    setAlertMessage('Gagal mengirim laporan. Silakan coba lagi.');
                    setShowErrorAlert(true);
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
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-[#412E27]">
                            Riwayat Laporan
                        </h2>
                        {reports.length > 0 && (
                            <p className="text-sm text-[#6B5D52]">
                                Menampilkan {currentPage * itemsPerPage + 1}-{Math.min((currentPage + 1) * itemsPerPage, reports.length)} dari {reports.length} laporan
                            </p>
                        )}
                    </div>

                    <div className="space-y-4 min-h-[400px]">
                        {reports.length === 0 ? (
                            <div className="bg-white rounded-lg p-8 text-center">
                                <p className="text-gray-500">Belum ada laporan kerusakan</p>
                            </div>
                        ) : (
                            getCurrentPageReports().map((report) => (
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

                    {/* Carousel Navigation */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8">
                            {/* Previous Button */}
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 0}
                                className={`p-2 rounded-full transition-colors ${
                                    currentPage === 0
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#7A2B1E] text-white hover:bg-[#5C1F14]'
                                }`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Page Indicators */}
                            <div className="flex gap-2">
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePageClick(index)}
                                        className={`w-3 h-3 rounded-full transition-all ${
                                            currentPage === index
                                                ? 'bg-[#7A2B1E] w-8'
                                                : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                        aria-label={`Go to page ${index + 1}`}
                                    />
                                ))}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages - 1}
                                className={`p-2 rounded-full transition-colors ${
                                    currentPage === totalPages - 1
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#7A2B1E] text-white hover:bg-[#5C1F14]'
                                }`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
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

            {/* Success Alert Modal */}
            {showSuccessAlert && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-sm w-full relative">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-[#412E27] mb-2">Berhasil!</h3>
                            <p className="text-[#6B5D52] mb-6">{alertMessage}</p>
                            <button
                                onClick={() => setShowSuccessAlert(false)}
                                className="w-full bg-[#6B5D52] text-white py-3 rounded-lg font-medium hover:bg-[#654e3d] transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Alert Modal */}
            {showErrorAlert && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-sm w-full relative">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <X className="w-10 h-10 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-[#412E27] mb-2">Gagal!</h3>
                            <p className="text-[#6B5D52] mb-6">{alertMessage}</p>
                            <button
                                onClick={() => setShowErrorAlert(false)}
                                className="w-full bg-[#6B5D52] text-white py-3 rounded-lg font-medium hover:bg-[#654e3d] transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MaintenancePage;