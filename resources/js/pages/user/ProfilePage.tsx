import React from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/components/teraZ/user/LayoutUser';
import { Mail, Phone, UserRoundCheck, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    photo?: string;
}

interface Room {
    number: string;
    type: string;
    monthly_rent: number;
}

interface Contract {
    start_date: string;
    end_date: string;
    duration_months: number;
}

interface ProfileProps {
    user: User;
    room: Room;
    contract: Contract;
}

const Profile: React.FC<ProfileProps> = ({ user, room, contract }) => {
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

    return (
        <>
            <Head title="Profile" />

            <Layout user={user} currentPath="/profile">
                {/* Page Title */}
                <h1 className="text-3xl font-semibold text-[#7A2B1E] mt-8 mb-8">Profil Penyewa</h1>

                {/* Top Section - Informasi Pribadi & Informasi Kamar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-18 mb-14">
                    {/* Informasi Pribadi */}
                    <div className="bg-[#D1D8BD] rounded-xl p-8 shadow-lg">
                        <h2 className="text-2xl font-semibold text-[#412E27] mb-6">
                            Informasi Pribadi
                        </h2>

                        <div className="flex items-start gap-4 mb-6">
                            <img 
                                src={user.photo || '/teraZ/testi1.png'}
                                alt={user.name}
                                className="w-20 h-20 rounded-full object-cover border-3 border-[#412E27]"
                            />
                            <div>
                                <h3 className="mb-2 font-semibold text-[#412E27]">
                                    {user.name}
                                </h3>
                                <p className="text-[#716659] font-semibold text-sm">
                                    Kamar {room.number}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-5">
                                <Mail className="w-7 h-7 text-[#615348]" />
                                <span className="text-[#412E27] font-medium">{user.email}</span>
                            </div>

                            <div className="flex items-center gap-5">
                                <Phone className="w-7 h-7 text-[#615348]" />
                                <span className="text-[#412E27] font-medium">{user.phone}</span>
                            </div>

                            <div className="flex items-center gap-5">
                                <UserRoundCheck className="w-7 h-7 text-[#615348]" />
                                <span className="text-[#412E27] font-medium">Penghuni Aktif</span>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Kamar */}
                    <div className="bg-[#F1E0CB] rounded-xl p-8 shadow-md">
                        <h2 className="text-2xl font-semibold text-[#412E27] mb-6">
                            Informasi Kamar
                        </h2>

                        <div className="space-y-8">
                            <div>
                                <p className="text-sm font-medium text-[#7B695D] mb-1">Nomor Kamar</p>
                                <p className="text-3xl font-semibold text-[#412E27]">{room.number}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-[#7B695D] mb-1">Tipe Kamar</p>
                                <p className="text-lg font-semibold text-[#412E27]">{room.type}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-[#7B695D] mb-1">Sewa Bulanan</p>
                                <p className="text-lg font-semibold text-[#412E27]">
                                    {formatCurrency(room.monthly_rent)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Informasi Kontrak */}
                <div className="bg-[#F1E0CB] rounded-xl p-8 shadow-md">
                    <h2 className="text-2xl font-semibold text-[#412E27] mb-6">
                        Informasi Kontrak
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-9">
                        <div className="flex items-start gap-5">
                            <ArrowRight className="w-7 h-7 text-[#615348]" />
                            <div>
                                <p className="text-sm font-medium text-[#7B695D] mb-1">Tanggal Masuk</p>
                                <p className="text-lg font-semibold text-[#412E27]">
                                    {formatDate(contract.start_date)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-5">
                            <ArrowLeft className="w-7 h-7 text-[#615348]" />
                            <div>
                                <p className="text-sm font-medium text-[#7B695D] mb-1">Tanggal Keluar</p>
                                <p className="text-lg font-semibold text-[#412E27]">
                                    {formatDate(contract.end_date)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-5">
                            <Calendar className="w-7 h-7 text-[#615348] mt-1" />
                            <div>
                                <p className="text-sm font-medium text-[#7B695D] mb-1">Durasi Sewa</p>
                                <p className="text-lg font-semibold text-[#412E27]">
                                    {contract.duration_months} Bulan
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default Profile;