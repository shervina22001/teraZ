import React, { useState } from 'react';
import LayoutAdmin from '@/components/teraZ/admin/LayoutAdmin';
import { Edit2, X } from 'lucide-react';

interface KelolaKamarAdminProps {
    user: {
        name: string;
        id: number;
    };
}

interface Room {
    id: number;
    number: string;
    price: number;
    status: 'Terisi' | 'Kosong';
    facilities: string;
}

const KelolaKamarAdmin: React.FC<KelolaKamarAdminProps> = ({ user }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [roomNumber, setRoomNumber] = useState('');
    const [roomPrice, setRoomPrice] = useState('');
    const [roomFacilities, setRoomFacilities] = useState('');
    const [roomStatus, setRoomStatus] = useState<'Terisi' | 'Kosong'>('Kosong');

    const [rooms, setRooms] = useState<Room[]>([
        { id: 1, number: '01', price: 850000, status: 'Terisi', facilities: 'Kasur, Bantal, Guling, Lemari, Kipas, Meja dan Kursi Belajar' },
        { id: 2, number: '02', price: 850000, status: 'Terisi', facilities: 'Kasur, Bantal, Guling, Lemari, Kipas, Meja dan Kursi Belajar' },
        { id: 3, number: '03', price: 850000, status: 'Kosong', facilities: 'Kasur, Bantal, Guling, Lemari, Kipas, Meja dan Kursi Belajar' },
        { id: 4, number: '04', price: 1000000, status: 'Terisi', facilities: 'Kasur, Bantal, Guling, Lemari, AC, Meja dan Kursi Belajar' },
        { id: 5, number: '05', price: 1000000, status: 'Kosong', facilities: 'Kasur, Bantal, Guling, Lemari, AC, Meja dan Kursi Belajar' },
    ]);

    const handleEdit = (room: Room) => {
        setSelectedRoom(room);
        setRoomNumber(room.number);
        setRoomPrice(room.price.toString());
        setRoomFacilities(room.facilities);
        setRoomStatus(room.status);
        setShowEditModal(true);
    };

    const handleUpdateRoom = () => {
        if (selectedRoom) {
            setRooms(rooms.map(room =>
                room.id === selectedRoom.id
                    ? { ...room, number: roomNumber, price: parseInt(roomPrice), facilities: roomFacilities, status: roomStatus }
                    : room
            ));
            setShowEditModal(false);
            setSelectedRoom(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Terisi':
                return 'bg-[#414833]';
            case 'Kosong':
                return 'bg-[#878181]';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <LayoutAdmin user={user} currentPath="/admin/kelola-kamar">
            {/* Header */}
            <div className="mb-8 mt-6">
                <h1 className="text-3xl font-semibold text-[#7A2B1E]">Manajemen Kamar Kos</h1>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-2 gap-8">
                {rooms.map((room) => (
                    <div key={room.id} className="bg-[#F5F2EE] rounded-lg shadow-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-[#412E27] mb-3">Kamar {room.number}</h3>
                                <p className="text-3xl font-bold text-[#412E27] mb-1">
                                    Rp {room.price.toLocaleString('id-ID')}
                                </p>
                                <p className="text-sm text-[#6B5D52]">Per bulan</p>
                            </div>
                            <div className="flex flex-col items-end gap-5">
                                <span className={`${getStatusColor(room.status)} text-white text-sm inline-block min-w-[120px] text-center px-6 py-2`}>
                                    {room.status}
                                </span>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleEdit(room)}
                                        className="bg-[#654e3d] text-white p-2 rounded-lg hover:bg-[#412E27] transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border-2 border-[#7A2B1E] rounded-lg  text-[#7A2B1E] text-sm py-2 px-4 text-center">
                            {room.facilities}
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full relative">
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-[#412E27] mb-6">Edit Kamar</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#412E27] mb-2">
                                Nomor Kamar
                            </label>
                            <input
                                type="text"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                                placeholder="01"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#412E27] mb-2">
                                Harga per Bulan
                            </label>
                            <input
                                type="number"
                                value={roomPrice}
                                onChange={(e) => setRoomPrice(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                                placeholder="850000"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#412E27] mb-2">
                                Status Kamar
                            </label>
                            <select
                                value={roomStatus}
                                onChange={(e) => setRoomStatus(e.target.value as 'Terisi' | 'Kosong')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                            >
                                <option value="Terisi">Terisi</option>
                                <option value="Kosong">Kosong</option>
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[#412E27] mb-2">
                                Fasilitas
                            </label>
                            <textarea
                                value={roomFacilities}
                                onChange={(e) => setRoomFacilities(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] resize-none"
                                placeholder="Kasur, Bantal, Guling, Lemari, Kipas, Meja dan Kursi Belajar"
                                rows={3}
                            />
                        </div>

                        <button
                            onClick={handleUpdateRoom}
                            className="w-full bg-[#6B5D52] text-white py-3 rounded-lg font-medium hover:bg-[#5C4E43] transition-colors"
                        >
                            Update Kamar
                        </button>
                    </div>
                </div>
            )}
        </LayoutAdmin>
    );
};

export default KelolaKamarAdmin;
