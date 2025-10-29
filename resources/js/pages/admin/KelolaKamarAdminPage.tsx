import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import LayoutAdmin from '@/components/teraZ/admin/LayoutAdmin';
import { Edit2, X, Trash2, CheckCircle, AlertCircle, Plus } from 'lucide-react';

interface KelolaKamarAdminProps {
  user: { name: string; id: number };
  rooms: Room[];
}

interface Room {
  id: number;
  number: string;
  price: number;
  status: 'Terisi' | 'Kosong';
  facilities: string;
}

const rupiah = (v: number | string) =>
  Number(v).toLocaleString('id-ID', { maximumFractionDigits: 0 });

const KelolaKamarAdmin: React.FC<KelolaKamarAdminProps> = ({ user, rooms: initialRooms }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomPrice, setRoomPrice] = useState('');
  const [roomFacilities, setRoomFacilities] = useState('');
  const [roomStatus, setRoomStatus] = useState<'Terisi' | 'Kosong'>('Kosong');
  const [rooms] = useState<Room[]>(initialRooms);

  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomPrice, setNewRoomPrice] = useState('');
  const [newRoomFacilities, setNewRoomFacilities] = useState('');
  const [newRoomStatus, setNewRoomStatus] = useState<'Terisi' | 'Kosong'>('Kosong');

  // Custom Alert States
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

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
      if (!roomNumber || !roomPrice || !roomFacilities) {
        setAlertMessage('Mohon lengkapi semua field!');
        setShowErrorAlert(true);
        return;
      }

      router.patch(
        `/admin/rooms/${selectedRoom.id}`,
        {
          number: roomNumber,
          price: parseInt(roomPrice),
          facilities: roomFacilities,
          status: roomStatus,
        },
        {
          onSuccess: () => {
            setShowEditModal(false);
            setSelectedRoom(null);
            setAlertMessage('Kamar berhasil diupdate!');
            setShowSuccessAlert(true);
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          },
          onError: (errors) => {
            console.error('Update failed:', errors);
            setAlertMessage('Update gagal, silakan coba lagi.');
            setShowErrorAlert(true);
          },
        }
      );
    }
  };

  const handleAddRoom = () => {
    if (!newRoomNumber || !newRoomPrice || !newRoomFacilities) {
      setAlertMessage('Mohon lengkapi semua field!');
      setShowErrorAlert(true);
      return;
    }

    router.post(
      '/admin/rooms',
      {
        nomor_kamar: newRoomNumber,
        harga: parseInt(newRoomPrice),
        status: newRoomStatus === 'Kosong' ? 'tersedia' : 'terisi',
        fasilitas: newRoomFacilities,
        tipe: '3x3',
      },
      {
        onSuccess: () => {
          setShowAddModal(false);
          resetAddForm();
          setAlertMessage('Kamar berhasil ditambahkan!');
          setShowSuccessAlert(true);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        onError: (errors) => {
          console.error('Tambah kamar gagal:', errors);
          setAlertMessage('Gagal menambahkan kamar, silakan coba lagi.');
          setShowErrorAlert(true);
        },
      }
    );
  };

  const handleDeleteRoom = (id: number) => {
    setPendingDeleteId(id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (pendingDeleteId) {
      router.delete(`/admin/rooms/${pendingDeleteId}`, {
        onSuccess: () => {
          setShowConfirmDialog(false);
          setPendingDeleteId(null);
          setAlertMessage('Kamar berhasil dihapus!');
          setShowSuccessAlert(true);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        onError: (errors) => {
          console.error('Delete failed:', errors);
          setShowConfirmDialog(false);
          setPendingDeleteId(null);
          setAlertMessage('Gagal menghapus kamar. Mungkin masih ada penghuni aktif.');
          setShowErrorAlert(true);
        },
      });
    }
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setPendingDeleteId(null);
  };

  const resetAddForm = () => {
    setNewRoomNumber('');
    setNewRoomPrice('');
    setNewRoomFacilities('');
    setNewRoomStatus('Kosong');
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
    <LayoutAdmin user={user} currentPath="/admin/rooms">
      {/* Header and Tambah Kamar button (disamakan seperti Tambah Penghuni) */}
      <div className="mb-8 mt-6 flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-[#7A2B1E]">Manajemen Kamar Kos</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#6B5D52] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#4d3e33] transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Kamar
        </button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-2 gap-8">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-[#F5F2EE] rounded-lg shadow-xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#412E27] mb-3">
                    Kamar {room.number}
                  </h3>
                  <p className="text-3xl font-bold text-[#412E27] mb-1">
                    Rp {rupiah(room.price)}
                  </p>
                  <p className="text-sm text-[#6B5D52]">Per bulan</p>
                </div>
                <div className="flex flex-col items-end gap-5">
                  <span
                    className={`${getStatusColor(room.status)} text-white text-sm inline-block min-w-[120px] text-center px-6 py-2`}
                  >
                    {room.status}
                  </span>
                </div>
              </div>

              <div className="border-2 border-[#7A2B1E] rounded-lg text-[#7A2B1E] text-sm py-2 px-4 text-center">
                {room.facilities}
              </div>
            </div>

            {/* CRUD Buttons */}
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => handleEdit(room)}
                className="bg-[#4e5f7d] text-white px-4 py-2 rounded-lg hover:bg-[#3d4c65] transition-colors flex items-center gap-2"
                aria-label="Edit Kamar"
              >
                <Edit2 className="w-5 h-5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDeleteRoom(room.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                aria-label="Hapus Kamar"
              >
                <Trash2 className="w-5 h-5" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="text-black bg-white rounded-xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Tutup modal"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-[#412E27] mb-6">Edit Kamar</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">Nomor Kamar</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                placeholder="01"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">Harga per Bulan</label>
              <input
                type="number"
                value={roomPrice}
                onChange={(e) => setRoomPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                placeholder="850000"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">Status Kamar</label>
              <select
                value={roomStatus}
                onChange={(e) => setRoomStatus(e.target.value as 'Terisi' | 'Kosong')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] text-[#412E27]"
              >
                <option value="Terisi">Terisi</option>
                <option value="Kosong">Kosong</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#412E27] mb-2">Fasilitas</label>
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

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Tutup modal tambah kamar"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-[#412E27] mb-6">Tambah Kamar</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">Nomor Kamar</label>
              <input
                type="text"
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                placeholder="01"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">Harga per Bulan</label>
              <input
                type="number"
                value={newRoomPrice}
                onChange={(e) => setNewRoomPrice(e.target.value)}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                placeholder="850000"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">Status Kamar</label>
              <select
                value={newRoomStatus}
                onChange={(e) => setNewRoomStatus(e.target.value as 'Terisi' | 'Kosong')}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
              >
                <option value="Terisi">Terisi</option>
                <option value="Kosong">Kosong</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#412E27] mb-2">Fasilitas</label>
              <textarea
                value={newRoomFacilities}
                onChange={(e) => setNewRoomFacilities(e.target.value)}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] resize-none"
                placeholder="Kasur, Bantal, Guling, Lemari, Kipas, Meja dan Kursi Belajar"
                rows={3}
              />
            </div>

            <button
              onClick={handleAddRoom}
              className="w-full bg-[#6B5D52] text-white py-3 rounded-lg font-medium hover:bg-[#5C4E43] transition-colors"
            >
              Tambah Kamar
            </button>
          </div>
        </div>
      )}

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
                className="w-full bg-[#6B5D52] text-white py-3 rounded-lg font-medium hover:bg-[#4d3e33] transition-colors"
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
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#412E27] mb-2">Gagal!</h3>
              <p className="text-[#6B5D52] mb-6">{alertMessage}</p>
              <button
                onClick={() => setShowErrorAlert(false)}
                className="w-full bg-[#6B5D52] text-white py-3 rounded-lg font-medium hover:bg-[#4d3e33] transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-[#412E27] mb-2">Konfirmasi Hapus</h3>
              <p className="text-[#6B5D52] mb-6">Apakah Anda yakin ingin menghapus kamar ini?</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={cancelDelete}
                  className="flex-1 bg-gray-200 text-[#412E27] py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutAdmin>
  );
};

export default KelolaKamarAdmin;
