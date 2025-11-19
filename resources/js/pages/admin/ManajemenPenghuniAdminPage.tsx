import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import LayoutAdmin from '@/components/teraZ/admin/LayoutAdmin';
import { Mail, Phone, DoorOpen, X, Edit2, Plus, CheckCircle, Trash2 } from 'lucide-react';

interface PenghuniAdminProps {
  user: {
    name: string;
    id: number;
  };
  tenants: Penghuni[];
  availableRooms?: Room[];
}

interface Room {
  id: number;
  nomor_kamar: string;
  harga: number;
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

const PenghuniAdmin: React.FC<PenghuniAdminProps> = ({
  user,
  tenants: initialTenants,
  availableRooms = [],
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPenghuni, setSelectedPenghuni] = useState<Penghuni | null>(null);

  // Custom Alerts (UI dari kode kedua)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Form states (Edit)
  const [namaPenghuni, setNamaPenghuni] = useState('');
  const [usernamePenghuni, setUsernamePenghuni] = useState('');
  const [phonePenghuni, setPhonePenghuni] = useState('');
  const [kamarPenghuni, setKamarPenghuni] = useState('');
  const [statusPenghuni, setStatusPenghuni] = useState<'Lunas' | 'Terlambat' | 'Menunggu'>('Lunas');

  // Form states (Add)
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantEmail, setNewTenantEmail] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');
  const [newTenantRoomId, setNewTenantRoomId] = useState('');
  const [newTenantStartDate, setNewTenantStartDate] = useState('');
  const [newTenantEndDate, setNewTenantEndDate] = useState('');
  const [newTenantNotes, setNewTenantNotes] = useState('');

  const penghunis = initialTenants;
  const totalPenghuni = penghunis.length;
  const pembayaranLunas = penghunis.filter((p) => p.status === 'Lunas').length;
  const pendingPayment = penghunis.filter((p) => p.status === 'Menunggu').length;

  // === UI handlers (dari kode kedua) ===
  const handleEditClick = (penghuni: Penghuni) => {
    setSelectedPenghuni(penghuni);
    setNamaPenghuni(penghuni.name);
    setUsernamePenghuni(penghuni.username);
    setPhonePenghuni(penghuni.phone);
    setKamarPenghuni(penghuni.roomNumber);
    setStatusPenghuni(penghuni.status);
    setShowEditModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setPendingDeleteId(id);
    setShowConfirmDialog(true);
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setPendingDeleteId(null);
  };

  // === Backend actions (mengikuti kode pertama) ===
  const handleUpdatePenghuni = () => {
    if (!selectedPenghuni) return;

    router.patch(
      `/admin/tenants/${selectedPenghuni.id}`,
      {
        name: namaPenghuni,
        username: usernamePenghuni,
        phone: phonePenghuni,
        roomNumber: kamarPenghuni,
        status: statusPenghuni,
      },
      {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          setShowEditModal(false);
          setSelectedPenghuni(null);
          resetForm();

          // Tampilkan success alert dulu
          setAlertMessage('Update Berhasil!');
          setShowSuccessAlert(true);

          // Reload data setelah user sempat melihat pesan sukses
          setTimeout(() => {
            // boleh pakai window.location.reload(); kalau kamu mau full refresh
            router.reload({ only: ['tenants', 'availableRooms'] });
            // atau kalau cuma tenants aja:
            // router.reload({ only: ['tenants'] });
          }, 1200);
        },
        onError: (errors) => {
          console.error('Update failed:', errors);
          setAlertMessage('Update gagal, silakan coba lagi.');
          setShowErrorAlert(true);
        },
      }
    );
  };

  const handleAddTenant = () => {
    router.post(
      '/admin/tenants',
      {
        nama: newTenantName,
        email: newTenantEmail,
        kontak: newTenantPhone,
        room_id: newTenantRoomId,
        tanggal_mulai: newTenantStartDate,
        tanggal_selesai: newTenantEndDate,
        catatan: newTenantNotes,
      },
      {
        preserveState: false,
        preserveScroll: true,
        onSuccess: () => {
          setShowAddModal(false);
          resetAddForm();
          // refresh partial data (sesuai kode pertama)
          router.reload({ only: ['tenants', 'availableRooms'] });
          // UI feedback
          setAlertMessage('Penghuni berhasil ditambahkan!');
          setShowSuccessAlert(true);
        },
        onError: (errors) => {
          console.error('Add tenant failed:', errors);
          setAlertMessage('Gagal menambahkan penghuni, silakan coba lagi.');
          setShowErrorAlert(true);
        },
      }
    );
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;

    router.delete(`/admin/tenants/${pendingDeleteId}`, {
      preserveState: false,
      preserveScroll: true,
      onSuccess: () => {
        setShowConfirmDialog(false);
        setPendingDeleteId(null);
        // refresh partial data (sesuai kode pertama)
        router.reload({ only: ['tenants', 'availableRooms'] });
        // UI feedback
        setAlertMessage('Penghuni berhasil dihapus!');
        setShowSuccessAlert(true);
      },
      onError: (errors) => {
        console.error('Delete failed:', errors);
        setShowConfirmDialog(false);
        setPendingDeleteId(null);
        setAlertMessage('Gagal menghapus penghuni.');
        setShowErrorAlert(true);
      },
    });
  };

  // === Utils ===
  const resetForm = () => {
    setNamaPenghuni('');
    setUsernamePenghuni('');
    setPhonePenghuni('');
    setKamarPenghuni('');
    setStatusPenghuni('Lunas');
  };

  const resetAddForm = () => {
    setNewTenantName('');
    setNewTenantEmail('');
    setNewTenantPhone('');
    setNewTenantRoomId('');
    setNewTenantStartDate('');
    setNewTenantEndDate('');
    setNewTenantNotes('');
  };

  return (
    <LayoutAdmin user={user} currentPath="/admin/tenants">
      {/* Title & Add Button */}
      <div className="mb-8 mt-6 flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-[#7A2B1E]">Manajemen Penghuni Kos</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#6B5D52] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#4d3e33] transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Penghuni
        </button>
      </div>

      {/* Stats */}
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

      {/* List Penghuni (UI dari kode kedua) */}
      <div className="space-y-6">
        {penghunis.map((penghuni) => (
          <div
            key={penghuni.id}
            className="bg-[#F5F2EE] rounded-lg shadow-sm px-8 py-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-6 flex-1">
              {/* Photo */}
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={penghuni.photo}
                  alt={penghuni.name}
                  className="w-full h-full object-cover"
                  key={penghuni.id} // Force re-render when data changes
                />
              </div>

              {/* Grid 4 kolom */}
              <div className="flex-1">
                <div className="grid grid-cols-4 gap-8 items-center">
                  {/* Name */}
                  <div>
                    <p className="text-xs text-[#6B5D52] mb-1 uppercase tracking-wide">NAMA</p>
                    <h3 className="text-lg font-semibold text-[#412E27]">{penghuni.name}</h3>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#6B5D52] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#6B5D52] mb-1 uppercase tracking-wide">EMAIL</p>
                      <span className="text-base font-medium text-[#412E27]">{penghuni.username}</span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#6B5D52] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#6B5D52] mb-1 uppercase tracking-wide">TELEPON</p>
                      <span className="text-base font-medium text-[#412E27]">{penghuni.phone}</span>
                    </div>
                  </div>

                  {/* Room */}
                  <div className="flex items-center gap-3">
                    <DoorOpen className="w-5 h-5 text-[#6B5D52] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#6B5D52] mb-1 uppercase tracking-wide">KAMAR</p>
                      <span className="text-base font-medium text-[#412E27]">{penghuni.roomNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="ml-6 flex items-center gap-4">
              <button
                onClick={() => handleEditClick(penghuni)}
                className="bg-[#4e5f7d] text-white px-4 py-2 rounded-lg hover:bg-[#3d4c65] transition-colors flex items-center gap-2"
                title="Edit Penghuni"
              >
                <Edit2 className="w-4 h-4" />
                <span className="font-medium">Edit</span>
              </button>
              {/* Hapus -> dialog konfirmasi (UI kedua), aksi backend (pertama) */}
              <button
                onClick={() => handleDeleteClick(penghuni.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                title="Hapus Penghuni"
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Modals ===== */}

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
              <label className="block text-sm font-medium text-[#412E27] mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={namaPenghuni}
                onChange={(e) => setNamaPenghuni(e.target.value)}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">Username</label>
              <input
                type="text"
                value={usernamePenghuni}
                onChange={(e) => setUsernamePenghuni(e.target.value)}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                placeholder="Username pengguna"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">Nomor Telepon</label>
              <input
                type="tel"
                value={phonePenghuni}
                onChange={(e) => setPhonePenghuni(e.target.value)}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                placeholder="+62 812345678"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">Nomor Kamar</label>
              <input
                type="text"
                value={kamarPenghuni}
                onChange={(e) => setKamarPenghuni(e.target.value)}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                placeholder="01"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#412E27] mb-2">Status Pembayaran</label>
              <select
                value={statusPenghuni}
                onChange={(e) =>
                  setStatusPenghuni(e.target.value as 'Lunas' | 'Terlambat' | 'Menunggu')
                }
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
              >
                <option value="Lunas">Lunas</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Menunggu">Menunggu</option>
              </select>
            </div>

            <button
              onClick={handleUpdatePenghuni}
              className="w-full bg-[#6B5D52] text-white py-3 rounded-lg font-medium hover:bg-[#4d3e33] transition-colors"
            >
              Update Penghuni
            </button>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="text-black bg-white rounded-xl p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetAddForm();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-[#412E27] mb-6">Tambah Penghuni Baru</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">
                Nama <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newTenantName}
                onChange={(e) => setNewTenantName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">
                Email
              </label>
              <input
                type="email"
                value={newTenantEmail}
                onChange={(e) => setNewTenantEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                placeholder="email@example.com"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={newTenantPhone}
                onChange={(e) => setNewTenantPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                placeholder="+62 812345678"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">
                Pilih Kamar <span className="text-red-500">*</span>
              </label>
              <select
                value={newTenantRoomId}
                onChange={(e) => setNewTenantRoomId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                required
              >
                <option value="">Pilih kamar yang tersedia</option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Kamar {room.nomor_kamar} - Rp {room.harga.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#412E27] mb-2">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newTenantStartDate}
                  onChange={(e) => setNewTenantStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#412E27] mb-2">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newTenantEndDate}
                  onChange={(e) => setNewTenantEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#412E27] mb-2">Catatan (opsional)</label>
              <textarea
                value={newTenantNotes}
                onChange={(e) => setNewTenantNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] resize-none"
                placeholder="Catatan tambahan tentang penghuni"
                rows={3}
              />
            </div>

            <button
              onClick={handleAddTenant}
              className="w-full bg-[#6B5D52] text-white py-3 rounded-lg font-medium hover:bg-[#4d3e33] transition-colors"
            >
              Tambah Penghuni
            </button>
          </div>
        </div>
      )}

      {/* Success Alert */}
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

      {/* Error Alert */}
      {showErrorAlert && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-10 h-10 text-red-600" />
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

      {/* Confirm Delete Dialog (UI kedua) */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-[#412E27] mb-2">Konfirmasi Hapus</h3>
              <p className="text-[#6B5D52] mb-6">Apakah Anda yakin ingin menghapus penghuni ini?</p>
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

export default PenghuniAdmin;