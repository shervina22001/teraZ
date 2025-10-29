import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from '@/components/teraZ/user/LayoutUser';
import { Mail, Phone, UserRoundCheck, Calendar, ArrowRight, ArrowLeft, Camera, X } from 'lucide-react';

interface User {
    id: number;
    name: string;
    username: string;
    phone: string;
    role: string;
}

interface Tenant {
    id: number;
    profile_photo: string;
}

interface Room {
    number: string;
    type: string;
    monthly_rent: number;
    status: string;
}

interface Contract {
    start_date: string;
    end_date: string;
    duration_months: number;
    status: string;
    note: string;
}

interface Props {
    user: User;
    tenant: Tenant;
    room: Room;
    contract: Contract;
}

const Profile: React.FC<Props> = ({ user, tenant, room, contract }) => {
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
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

            setSelectedFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = () => {
        if (!selectedFile) {
            alert('Pilih foto terlebih dahulu');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('profile_photo', selectedFile);

        router.post('/profile/update-photo', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowPhotoModal(false);
                setSelectedFile(null);
                setPreviewUrl('');
                setIsUploading(false);
            },
            onError: (errors) => {
                console.error('Upload failed:', errors);
                alert('Gagal mengupload foto');
                setIsUploading(false);
            },
        });
    };

    const handleCancel = () => {
        setShowPhotoModal(false);
        setSelectedFile(null);
        setPreviewUrl('');
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
                            <div className="relative">
                                <img
                                    src={tenant.profile_photo}
                                    alt={user.name}
                                    className="w-20 h-20 rounded-full object-cover border-3 border-[#412E27]"
                                />
                                <button
                                    onClick={() => setShowPhotoModal(true)}
                                    className="absolute bottom-0 right-0 bg-[#7A2B1E] text-white p-1.5 rounded-full hover:bg-[#561E15] transition-colors"
                                    title="Ganti foto"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
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
                    <div className="bg-[#F7ECE0] rounded-xl p-8 shadow-md">
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
                <div className="bg-[#F7ECE0] rounded-xl p-8 shadow-md">
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

                {/* Photo Upload Modal */}
                {showPhotoModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-8 max-w-md w-full relative">
                            <button
                                onClick={handleCancel}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                                <Camera className="w-8 h-8 text-blue-600" />
                            </div>

                            <h2 className="text-2xl font-bold text-[#412E27] mb-3 text-center">
                                Ganti Foto Profil
                            </h2>

                            <div className="mb-6">
                                {previewUrl ? (
                                    <div className="relative">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-48 h-48 mx-auto rounded-full object-cover border-4 border-[#7A2B1E]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setPreviewUrl('');
                                            }}
                                            className="absolute top-2 right-1/2 transform translate-x-20 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="photo-upload"
                                        />
                                        <label htmlFor="photo-upload" className="cursor-pointer">
                                            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                                            <p className="text-sm text-gray-600 mb-1">
                                                Klik untuk pilih foto
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                JPG, JPEG, PNG (Max 2MB)
                                            </p>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                    disabled={isUploading}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleUpload}
                                    className="flex-1 bg-[#7A2B1E] text-white py-3 rounded-lg font-medium hover:bg-[#561E15] transition-colors disabled:bg-gray-400"
                                    disabled={!selectedFile || isUploading}
                                >
                                    {isUploading ? 'Mengupload...' : 'Upload'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Layout>
        </>
    );
};

export default Profile;
