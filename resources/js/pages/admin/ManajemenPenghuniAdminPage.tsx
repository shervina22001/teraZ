import React, { useState } from 'react';
import LayoutAdmin from '@/components/teraZ/admin/LayoutAdmin';
import { Mail, Phone, DoorOpen, X, Edit2 } from 'lucide-react';

interface PenghuniAdminProps {
    user: {
        name: string;
        id: number;
    };
}

interface Penghuni {
    id: number;
    name: string;
    username: string;
    phone: string;
    roomNumber: string;
    status: 'Lunas' | 'Terlambat' | 'Menunggu';
    photo: string;
}

const PenghuniAdmin: React.FC<PenghuniAdminProps> = ({ user }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPenghuni, setSelectedPenghuni] = useState<Penghuni | null>(null);
    
    const [namaPenghuni, setNamaPenghuni] = useState('');
    const [usernamePenghuni, setUsernamePenghuni] = useState('');
    const [phonePenghuni, setPhonePenghuni] = useState('');
    const [kamarPenghuni, setKamarPenghuni] = useState('');
    const [statusPenghuni, setStatusPenghuni] = useState<'Lunas' | 'Terlambat' | 'Menunggu'>('Lunas');
    const [fotoPenghuni, setFotoPenghuni] = useState('');
    const [previewFoto, setPreviewFoto] = useState('');

    const [penghunis, setPenghunis] = useState<Penghuni[]>([
        { 
            id: 1, 
            name: 'Shervina', 
            username: 'shervinaa', 
            phone: '+62 81234567890', 
            roomNumber: '01',
            status: 'Lunas',
            photo: '/teraZ/testi1.png'
        },
        { 
            id: 2, 
            name: 'Rafa', 
            username: 'tabinarafa', 
            phone: '+62 81234567891', 
            roomNumber: '02',
            status: 'Terlambat',
            photo: '/teraZ/testi3.png'
        },
        { 
            id: 3, 
            name: 'Reghina', 
            username: 'regghins', 
            phone: '+62 81234567892', 
            roomNumber: '04',
            status: 'Terlambat',
            photo: '/teraZ/testi2.png'
        },
    ]);

    const totalPenghuni = penghunis.length;
    const pembayaranLunas = penghunis.filter(p => p.status === 'Lunas').length;
    const pendingPayment = penghunis.filter(p => p.status === 'Menunggu').length;

    const handleEditClick = (penghuni: Penghuni) => {
        setSelectedPenghuni(penghuni);
        setNamaPenghuni(penghuni.name);
        setUsernamePenghuni(penghuni.username);
        setPhonePenghuni(penghuni.phone);
        setKamarPenghuni(penghuni.roomNumber);
        setStatusPenghuni(penghuni.status);
        setFotoPenghuni(penghuni.photo);
        setPreviewFoto(penghuni.photo);
        setShowEditModal(true);
    };

    const handleUpdatePenghuni = () => {
        if (selectedPenghuni) {
            const updatedPenghunis = penghunis.map(p => 
                p.id === selectedPenghuni.id 
                    ? {
                        ...p,
                        name: namaPenghuni,
                        username: usernamePenghuni,
                        phone: phonePenghuni,
                        roomNumber: kamarPenghuni,
                        status: statusPenghuni,
                        photo: fotoPenghuni || p.photo
                    }
                    : p
            );
            setPenghunis(updatedPenghunis);
            resetForm();
            setShowEditModal(false);
            setSelectedPenghuni(null);
        }
    };

    const resetForm = () => {
        setNamaPenghuni('');
        setUsernamePenghuni('');
        setPhonePenghuni('');
        setKamarPenghuni('');
        setStatusPenghuni('Lunas');
        setFotoPenghuni('');
        setPreviewFoto('');
    };

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setFotoPenghuni(result);
                setPreviewFoto(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Lunas':
                return 'bg-[#2FA336]';
            case 'Terlambat':
                return 'bg-[#FF0000]';
            case 'Menunggu':
                return 'bg-[#FFA726]';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <LayoutAdmin user={user} currentPath="/admin/penghuni">
            {/* Title */}
            <div className="mb-8 mt-6">
                <h1 className="text-3xl font-semibold text-[#7A2B1E]">Manajemen Penghuni Kos</h1>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-base text-[#412E27] mb-2">Total Penghuni</p>
                    <p className="text-4xl font-bold text-[#412E27]">{totalPenghuni}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-base text-[#412E27] mb-2">Pembayaran Lunas</p>
                    <p className="text-4xl font-bold text-[#412E27]">{pembayaranLunas}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-base text-[#412E27] mb-2">Menunggu</p>
                    <p className="text-4xl font-bold text-[#412E27]">{pendingPayment}</p>
                </div>
            </div>

            {/* Penghuni List */}
            <div className="space-y-6">
                {penghunis.map((penghuni) => (
                    <div key={penghuni.id} className="bg-[#F5F2EE] rounded-lg shadow-sm px-8 py-8 flex items-center justify-between">
                        <div className="flex items-center gap-6 flex-1">
                            {/* Photo */}
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                <img 
                                    src={penghuni.photo} 
                                    alt={penghuni.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Info Section */}
                            <div className="flex-1">
                                {/* Name */}
                                <h3 className="text-xl font-semibold text-[#412E27] mb-3">{penghuni.name}</h3>
                                
                                
                                {/* Contact Details */}
                                <div className="flex items-center gap-6">
                                    {/* Username */}
                                    <div className="flex items-center gap-2 w-34">
                                        <Mail className="w-5 h-5 text-[#6B5D52]" />
                                        <span className="text-base font-medium text-[#6B5D52]">{penghuni.username}</span>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-center gap-2 w-48">
                                        <Phone className="w-5 h-5 text-[#6B5D52]" />
                                        <span className="text-base font-medium text-[#6B5D52]">{penghuni.phone}</span>
                                    </div>

                                    {/* Room */}
                                    <div className="flex items-center gap-2 w-34">
                                        <DoorOpen className="w-5 h-5 text-[#6B5D52]" />
                                        <span className="text-base font-medium text-[#6B5D52]">Kamar {penghuni.roomNumber}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Badge and Edit Button */}
                        <div className="flex items-center gap-3">
                            <span className={`${getStatusColor(penghuni.status)} text-white text-sm px-6 py-2 inline-block min-w-[120px] text-center`}>
                                {penghuni.status}
                            </span>
                            
                            {/* Edit Button */}
                            <button
                                onClick={() => handleEditClick(penghuni)}
                                className="bg-[#654e3d] text-white p-2 rounded-lg hover:bg-[#412E27] transition-colors"
                                title="Edit Penghuni"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={() => {
                                setShowEditModal(false);
                                setSelectedPenghuni(null);
                                resetForm();
                            }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-[#412E27] mb-6">Edit Penghuni</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#412E27] mb-2">
                                Foto Penghuni
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                    {previewFoto ? (
                                        <img 
                                            src={previewFoto} 
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Mail className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFotoChange}
                                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#6B5D52] file:text-white hover:file:bg-[#654e3d] file:cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#412E27] mb-2">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                value={namaPenghuni}
                                onChange={(e) => setNamaPenghuni(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                                placeholder="Masukkan nama lengkap"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#412E27] mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={usernamePenghuni}
                                onChange={(e) => setUsernamePenghuni(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                                placeholder="Username pengguna"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#412E27] mb-2">
                                Nomor Telepon
                            </label>
                            <input
                                type="tel"
                                value={phonePenghuni}
                                onChange={(e) => setPhonePenghuni(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                                placeholder="+62 812345678"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#412E27] mb-2">
                                Nomor Kamar
                            </label>
                            <input
                                type="text"
                                value={kamarPenghuni}
                                onChange={(e) => setKamarPenghuni(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                                placeholder="01"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[#412E27] mb-2">
                                Status Pembayaran
                            </label>
                            <select
                                value={statusPenghuni}
                                onChange={(e) => setStatusPenghuni(e.target.value as 'Lunas' | 'Terlambat' | 'Menunggu')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                            >
                                <option value="Lunas">Lunas</option>
                                <option value="Terlambat">Terlambat</option>
                                <option value="Menunggu">Menunggu</option>
                            </select>
                        </div>

                        <button
                            onClick={handleUpdatePenghuni}
                            className="w-full bg-[#6B5D52] text-white py-3 rounded-lg font-medium hover:bg-[#654e3d] transition-colors"
                        >
                            Update Penghuni
                        </button>
                    </div>
                </div>
            )}
        </LayoutAdmin>
    );
};

export default PenghuniAdmin;