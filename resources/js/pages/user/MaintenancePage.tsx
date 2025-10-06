import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/components/teraZ/user/LayoutUser';
import { Calendar, CheckCircle } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    photo?: string;
}

interface MaintenanceReport {
    id: number;
    title: string;
    description: string;
    reported_date: string;
    resolved_date?: string;
    priority: 'Tinggi' | 'Sedang' | 'Rendah';
    status: 'Tinggi' | 'Sedang Proses' | 'Selesai';
}

interface MaintenancePageProps {
    user: User;
    reports: MaintenanceReport[];
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ user, reports }) => {
    const [issueType, setIssueType] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState(''); // Changed from 'Sedang' to ''

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Tinggi':
                return 'bg-[#8B2E1F] text-white';
            case 'Sedang Proses':
                return 'bg-[#2E5A8B] text-white';
            case 'Selesai':
                return 'bg-[#2E6B4A] text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Tinggi':
                return 'bg-[#8B2E1F] text-white';
            case 'Sedang':
                return 'bg-[#D97236] text-white';
            case 'Rendah':
                return 'bg-[#2E6B4A] text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log({ issueType, description, priority });
    };

    return (
        <>
            <Head title="Laporan Maintenance" />

            <Layout user={user} currentPath="/lapor-kerusakan">
                {/* Page Title */}
                <h1 className="text-3xl font-semibold text-[#7A2B1E] mt-8 mb-8">Laporan Kerusakan</h1>

                {/* Riwayat Laporan Section */}
                <div className="bg-[#F7ECE0] rounded-xl p-8 shadow-md mb-8">
                    <h2 className="text-2xl font-semibold text-[#412E27] mb-6">
                        Riwayat Laporan
                    </h2>

                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div key={report.id} className="bg-white rounded-lg p-6 shadow-lg">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-[#412E27] mb-2">
                                            {report.title}
                                        </h3>
                                        <p className="text-[#412E27] text-md mb-3">
                                            {report.description}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <span className={`px-4 py-1 rounded-md text-sm font-medium ${getPriorityColor(report.priority)}`}>
                                            {report.priority}
                                        </span>
                                        <span className={`px-4 py-1 rounded-md text-sm font-medium ${getStatusColor(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-sm text-[#412E27]">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Dilaporkan pada {formatDate(report.reported_date)}</span>
                                    </div>
                                    {report.resolved_date && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Selesai pada {formatDate(report.resolved_date)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buat Laporan Section */}
                <div className="bg-white border-6 border-[#F7ECE0] rounded-xl p-8 shadow-xl">
                    <h2 className="text-2xl font-semibold text-[#412E27] mb-6">
                        Buat Laporan
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Jenis Masalah */}
                            <div>
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Jenis Masalah
                                </label>
                                <input
                                    type="text"
                                    value={issueType}
                                    onChange={(e) => setIssueType(e.target.value)}
                                    placeholder="contoh: lampu mati, keran bocor"
                                    className="w-full px-4 py-2 border border-[#D1C4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] bg-white text-[#412E27]"
                                />
                            </div>

                            {/* Deskripsi Detail */}
                            <div>
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Deskripsi Detail
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="jelaskan masalah secara detail..."
                                    className="w-full px-4 py-2 border border-[#D1C4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] bg-white text-[#412E27]"
                                />
                            </div>

                            {/* Tingkat Prioritas */}
                            <div>
                                <label className="block text-sm font-medium text-[#412E27] mb-2">
                                    Tingkat Prioritas
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full px-4 py-2 border border-[#D1C4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] bg-white"
                                    style={{ color: priority === '' ? '#A09693' : '#412E27' }}
                                >
                                    <option value="" disabled style={{ color: '#A09693' }}>Pilih</option>
                                    <option value="Tinggi" style={{ color: '#412E27' }}>Tinggi</option>
                                    <option value="Sedang" style={{ color: '#412E27' }}>Sedang</option>
                                    <option value="Rendah" style={{ color: '#412E27' }}>Rendah</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                className="bg-[#7A2B1E] text-white px-4 py-2 rounded-sm text-sm font-semibold hover:bg-[#4e1108] transition-colors"
                            >
                                Kirim Laporan
                            </button>
                        </div>
                    </form>
                </div>
            </Layout>
        </>
    );
};

export default MaintenancePage;