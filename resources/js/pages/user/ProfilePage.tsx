import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from '@/components/teraZ/user/LayoutUser';
import { Phone, UserRoundCheck, Calendar, ArrowRight, Camera, X, CheckCircle, AlertCircle } from 'lucide-react';

interface User {
    id: number;
    name: string;
    username: string;
    phone: string;
    role: string;
}

interface Tenant {
    id: number;
    profile_photo: string; // Full URL dari backend dengan asset()
    updated_at?: string; // Tambahkan untuk cache busting
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
    unpaidCount: number;
}

const Profile: React.FC<Props> = ({ user, tenant, room, contract, unpaidCount }) => {
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    
    // Alert states
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // State untuk force refresh gambar
    const [imageKey, setImageKey] = useState(Date.now());

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

    // FIXED: getProfilePhotoUrl dengan cache busting yang lebih reliable
    const getProfilePhotoUrl = () => {
        if (tenant.profile_photo) {
            // Gunakan updated_at dari server jika tersedia, fallback ke imageKey
            const timestamp = tenant.updated_at ? new Date(tenant.updated_at).getTime() : imageKey;
            return `${tenant.profile_photo}?v=${timestamp}`;
        }
        return '/teraZ/testi1.png'; // Default fallback
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setAlertMessage('Ukuran file maksimal 2MB');
                setShowErrorAlert(true);
                e.target.value = '';
                return;
            }

            // Validate file type
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                setAlertMessage('Format file harus JPG, JPEG, atau PNG');
                setShowErrorAlert(true);
                e.target.value = '';
                return;
            }

            const formData = new FormData();
            formData.append("profile", file);

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
            setAlertMessage('Pilih foto terlebih dahulu');
            setShowErrorAlert(true);
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('profile_photo', selectedFile);

        router.post('/profile/update-photo', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Reset modal state
                setShowPhotoModal(false);
                setSelectedFile(null);
                setPreviewUrl('');
                setIsUploading(false);
                
                // Force refresh gambar dengan update timestamp
                setImageKey(Date.now());
                
                // Show success message
                setAlertMessage('Foto profil berhasil diperbarui!');
                setShowSuccessAlert(true);
                
                // Reload data tenant dari server
                setTimeout(() => {
                    router.reload({ 
                        only: ['tenant'],
                        onSuccess: () => {
                            // Update imageKey lagi setelah reload untuk memastikan cache di-refresh
                            setImageKey(Date.now());
                        }
                    });
                }, 500);
            },
            onError: (errors) => {
                console.error('Upload failed:', errors);
                setAlertMessage('Gagal mengupload foto. Silakan coba lagi.');
                setShowErrorAlert(true);
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

            <Layout user={user} currentPath="/profile"unpaidCount={unpaidCount}>
                {/* Page Title */}
                <h1 className="text-3xl font-semibold text-[#7A2B1E] mt-8 mb-8">Profil Penyewa</h1>

                {/* Top Section - Informasi Pribadi & Informasi Kamar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
                    {/* Informasi Pribadi */}
                    <div className="bg-[#D1D8BD] rounded-xl p-8 shadow-lg">
                        <h2 className="text-2xl font-semibold text-[#412E27] mb-6">
                            Informasi Pribadi
                        </h2>

                        <div className="flex items-start gap-4 mb-6">
                            <div className="relative">
                                <img
                                    key={imageKey} // Force re-render saat imageKey berubah
                                    src={getProfilePhotoUrl()}
                                    alt={user.name}
                                    className="w-20 h-20 rounded-full object-cover border-3 border-[#412E27]"
                                    onError={(e) => {
                                        // Fallback to default avatar if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/teraZ/testi1.png';
                                    }}
                                />
                                <button
                                    onClick={() => setShowPhotoModal(true)}
                                    className="absolute bottom-0 right-0 bg-[#7A2B1E] text-white p-1.5 rounded-full hover:bg-[#561E15] transition-colors shadow-lg"
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
                                <p className="text-2xl font-semibold text-[#412E27]">{room.number}</p>
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

                {/* Photo Upload Modal */}
                {showPhotoModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-8 max-w-md w-full relative">
                            <button
                                onClick={handleCancel}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                                disabled={isUploading}
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
                                            disabled={isUploading}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <p className="text-center text-sm text-gray-600 mt-3">
                                            {selectedFile?.name}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#7A2B1E] transition-colors">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="photo-upload"
                                            disabled={isUploading}
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
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                                    disabled={isUploading}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleUpload}
                                    className="flex-1 bg-[#7A2B1E] text-white py-3 rounded-lg font-medium hover:bg-[#561E15] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={!selectedFile || isUploading}
                                >
                                    {isUploading ? 'Mengupload...' : 'Upload'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Alert Modal */}
                {showSuccessAlert && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
                        <div className="bg-white rounded-xl p-8 max-w-sm w-full relative">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-[#412E27] mb-2">Berhasil!</h3>
                                <p className="text-[#6B5D52] mb-6">{alertMessage}</p>
                                <button
                                    onClick={() => setShowSuccessAlert(false)}
                                    className="w-full bg-[#7A2B1E] text-white py-3 rounded-lg font-medium hover:bg-[#561E15] transition-colors"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Alert Modal */}
                {showErrorAlert && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
                        <div className="bg-white rounded-xl p-8 max-w-sm w-full relative">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="w-10 h-10 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-[#412E27] mb-2">Gagal!</h3>
                                <p className="text-[#6B5D52] mb-6">{alertMessage}</p>
                                <button
                                    onClick={() => setShowErrorAlert(false)}
                                    className="w-full bg-[#7A2B1E] text-white py-3 rounded-lg font-medium hover:bg-[#561E15] transition-colors"
                                >
                                    OK
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