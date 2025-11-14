import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import LayoutAdmin from '@/components/teraZ/admin/LayoutAdmin';
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
} from 'lucide-react';

interface Pengeluaran {
  id: number;
  judul: string;
  kategori: string | null;
  deskripsi: string | null;
  tanggal: string;
  nominal: number;
}

interface Stats {
  total: number;
  month_total: number;
  today_total: number;
}

interface Filters {
  month: number | null;
  year: number | null;
  kategori: string | null;
}

interface PengeluaranAdminProps {
  user: {
    name: string;
    id: number;
    role: string;
  };
  pengeluarans: Pengeluaran[];
  stats: Stats;
  filters: Filters;
}

const monthOptions = [
  { value: '', label: 'Semua' },
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

const presetKategori = ['air', 'listrik', 'sampah'];

const parseTanggal = (str: string): Date | null => {
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  const day = parseInt(d, 10);
  const month = parseInt(m, 10);
  const year = parseInt(y, 10);
  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null;
  return new Date(year, month - 1, day);
};

const PengeluaranAdminPage: React.FC<PengeluaranAdminProps> = ({
  user,
  pengeluarans,
  stats,
  filters,
}) => {
  const [month, setMonth] = useState<string>(filters.month ? String(filters.month) : '');
  const [year, setYear] = useState<string>(filters.year ? String(filters.year) : '');
  const [kategoriFilter, setKategoriFilter] = useState<string>(filters.kategori || '');

  const handleFilterChange = () => {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    if (kategoriFilter) params.kategori = kategoriFilter;

    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/admin/pengeluaran?${queryString}` : '/admin/pengeluaran';

    router.get(url, {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(pengeluarans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = pengeluarans.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const [form, setForm] = useState({
    judul: '',
    deskripsi: '',
    tanggal: '',
    nominal: '',
  });
  const [kategoriSelect, setKategoriSelect] = useState<string>('');
  const [customKategori, setCustomKategori] = useState<string>('');

  const resetAddForm = () => {
    setForm({
      judul: '',
      deskripsi: '',
      tanggal: '',
      nominal: '',
    });
    setKategoriSelect('');
    setCustomKategori('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.judul || !form.tanggal || !form.nominal) {
      setAlertMessage('Judul, tanggal, dan nominal wajib diisi.');
      setShowErrorAlert(true);
      return;
    }

    let kategoriToSend: string | null = null;
    if (kategoriSelect === 'lainnya') {
      kategoriToSend = customKategori.trim() || null;
    } else if (kategoriSelect) {
      kategoriToSend = kategoriSelect;
    }

    const payload = {
      judul: form.judul,
      kategori: kategoriToSend,
      deskripsi: form.deskripsi || null,
      tanggal: form.tanggal,
      nominal: parseInt(form.nominal.replace(/[^0-9]/g, ''), 10) || 0,
    };

    router.post('/admin/pengeluaran', payload, {
      preserveScroll: true,
      onSuccess: () => {
        resetAddForm();
        setAlertMessage('Pengeluaran berhasil ditambahkan!');
        setShowSuccessAlert(true);
        router.reload({ only: ['pengeluarans', 'stats'] });
      },
      onError: (errors) => {
        console.error(errors);
        setAlertMessage('Gagal menambahkan pengeluaran.');
        setShowErrorAlert(true);
      },
    });
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Pengeluaran | null>(null);
  const [editForm, setEditForm] = useState({
    judul: '',
    deskripsi: '',
    tanggal: '',
    nominal: '',
  });
  const [editKategoriSelect, setEditKategoriSelect] = useState<string>('');
  const [editCustomKategori, setEditCustomKategori] = useState<string>('');

  const openEditModal = (item: Pengeluaran) => {
    const [d, m, y] = item.tanggal.split('/');
    const isoDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

    setSelectedItem(item);
    setEditForm({
      judul: item.judul,
      deskripsi: item.deskripsi || '',
      tanggal: isoDate,
      nominal: String(item.nominal),
    });

    if (!item.kategori) {
      setEditKategoriSelect('');
      setEditCustomKategori('');
    } else if (presetKategori.includes(item.kategori.toLowerCase())) {
      setEditKategoriSelect(item.kategori.toLowerCase());
      setEditCustomKategori('');
    } else {
      setEditKategoriSelect('lainnya');
      setEditCustomKategori(item.kategori);
    }

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedItem(null);
    setEditForm({
      judul: '',
      deskripsi: '',
      tanggal: '',
      nominal: '',
    });
    setEditKategoriSelect('');
    setEditCustomKategori('');
  };

  const handleUpdatePengeluaran = () => {
    if (!selectedItem) return;

    if (!editForm.judul || !editForm.tanggal || !editForm.nominal) {
      setAlertMessage('Judul, tanggal, dan nominal wajib diisi.');
      setShowErrorAlert(true);
      return;
    }

    let kategoriToSend: string | null = null;
    if (editKategoriSelect === 'lainnya') {
      kategoriToSend = editCustomKategori.trim() || null;
    } else if (editKategoriSelect) {
      kategoriToSend = editKategoriSelect;
    }

    const payload = {
      judul: editForm.judul,
      kategori: kategoriToSend,
      deskripsi: editForm.deskripsi || null,
      tanggal: editForm.tanggal,
      nominal: parseInt(editForm.nominal.replace(/[^0-9]/g, ''), 10) || 0,
    };

    router.patch(`/admin/pengeluaran/${selectedItem.id}`, payload, {
      preserveScroll: true,
      onSuccess: () => {
        closeEditModal();
        setAlertMessage('Pengeluaran berhasil diperbarui!');
        setShowSuccessAlert(true);
        router.reload({ only: ['pengeluarans', 'stats'] });
      },
      onError: (errors) => {
        console.error(errors);
        setAlertMessage('Gagal memperbarui pengeluaran.');
        setShowErrorAlert(true);
      },
    });
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleDeleteClick = (id: number) => {
    setPendingDeleteId(id);
    setShowConfirmDialog(true);
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setPendingDeleteId(null);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;

    router.delete(`/admin/pengeluaran/${pendingDeleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        setShowConfirmDialog(false);
        setPendingDeleteId(null);
        setAlertMessage('Pengeluaran berhasil dihapus!');
        setShowSuccessAlert(true);
        router.reload({ only: ['pengeluarans', 'stats'] });
      },
      onError: (errors) => {
        console.error(errors);
        setShowConfirmDialog(false);
        setPendingDeleteId(null);
        setAlertMessage('Gagal menghapus pengeluaran.');
        setShowErrorAlert(true);
      },
    });
  };

  const today = new Date();
  const totalSemuaWaktu = pengeluarans.reduce((sum, p) => sum + (p.nominal || 0), 0);

  const totalBulanIni = pengeluarans.reduce((sum, p) => {
    const d = parseTanggal(p.tanggal);
    if (!d) return sum;
    if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
      return sum + (p.nominal || 0);
    }
    return sum;
  }, 0);

  const totalHariIni = pengeluarans.reduce((sum, p) => {
    const d = parseTanggal(p.tanggal);
    if (!d) return sum;
    if (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    ) {
      return sum + (p.nominal || 0);
    }
    return sum;
  }, 0);

  return (
    <LayoutAdmin user={user} currentPath="/admin/pengeluaran">
      <div className="flex justify-between items-center mb-8 mt-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#7A2B1E]">
            Pengeluaran Operasional
          </h1>
          <p className="text-base text-[#6B5D52] mt-1">
            Catat pengeluaran seperti air, iuran sampah, dan lainnya.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-[#412E27] mb-2">Total Semua Waktu</p>
          <p className="text-2xl md:text-3xl font-bold text-[#412E27]">
            Rp {totalSemuaWaktu.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-[#412E27] mb-2">Total Bulan Ini</p>
          <p className="text-2xl md:text-3xl font-bold text-[#412E27]">
            Rp {totalBulanIni.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-6">
          <p className="text-sm text-green-800 mb-2">Total Hari Ini</p>
          <p className="text-2xl md:text-3xl font-bold text-green-600">
            Rp {totalHariIni.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#412E27]">
            Tambah Pengeluaran
          </h2>
        </div>

        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#412E27] mb-1">
                Judul <span className="text-red-500">*</span>
                </label>
                <input
                type="text"
                value={form.judul}
                onChange={e =>
                    setForm(prev => ({ ...prev, judul: e.target.value }))
                }
                className="w-full px-4 py-2 border border-[#CCB89D] rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]
                            bg-[#F5F2EE] text-[#412E27] placeholder:text-sm placeholder:text-[#9b8a78]"
                placeholder="Contoh: Pengeluaran air bulan ini"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-[#412E27] mb-1">
                Kategori
                </label>
                <select
                value={kategoriSelect}
                onChange={e => {
                    setKategoriSelect(e.target.value);
                    if (e.target.value !== 'lainnya') setCustomKategori('');
                }}
                className="w-full px-4 py-2 border border-[#CCB89D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] bg-[#F5F2EE] text-[#412E27]"
                >
                <option value="">Pilih Kategori</option>
                <option value="air">Air</option>
                <option value="listrik">Listrik</option>
                <option value="sampah">Sampah</option>
                <option value="lainnya">Lainnya</option>
                </select>

                {kategoriSelect === 'lainnya' && (
                <input
                    type="text"
                    value={customKategori}
                    onChange={e => setCustomKategori(e.target.value)}
                    className="mt-2 w-full px-4 py-2 border border-[#CCB89D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] bg-[#F5F2EE] placeholder:text-sm placeholder:text-[#9b8a78]"
                    placeholder="Tulis kategori lainnya di sini"
                />
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-[#412E27] mb-1">
                Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                    type="date"
                    value={form.tanggal}
                    onChange={e =>
                    setForm(prev => ({ ...prev, tanggal: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-[#CCB89D] rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]
                            bg-[#F5F2EE] text-[#412E27]"
                    style={{
                      colorScheme: 'light'
                    }}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-[#412E27] mb-1">
                Nominal (Rp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    Rp
                </span>
                <input
                    type="text"
                    value={
                    form.nominal
                        ? parseInt(form.nominal, 10).toLocaleString('id-ID')
                        : ''
                    }
                    onChange={e =>
                    setForm(prev => ({
                        ...prev,
                        nominal: e.target.value.replace(/[^0-9]/g, ''),
                    }))
                    }
                    className="w-full pl-10 pr-4 py-2 border border-[#CCB89D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] bg-[#F5F2EE] text-[#412E27] placeholder:text-sm placeholder:text-[#9b8a78]"
                    placeholder="0"
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-[#412E27] mb-1">
                Deskripsi
                </label>
                <textarea
                value={form.deskripsi}
                onChange={e =>
                    setForm(prev => ({ ...prev, deskripsi: e.target.value }))
                }
                className="w-full px-4 py-2 border border-[#CCB89D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] bg-[#F5F2EE] text-[#412E27] h-[80px] placeholder:text-sm placeholder:text-[#9b8a78]"
                placeholder="Keterangan tambahan (opsional)"
                />
            </div>

            <div className="md:col-span-2 flex justify-end">
                <button
                type="submit"
                className="px-6 py-2.5 bg-[#214423] text-white rounded-lg font-medium flex items-center gap-2 hover:bg-[#1a3319]"
                >
                <Plus className="w-4 h-4" />
                Tambah Pengeluaran
                </button>
            </div>
            </form>

      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-[#412E27] mb-1">
            Bulan
          </label>
          <select
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[#CCB89D] bg-[#F5F2EE] text-[#412E27]"
          >
            {monthOptions.map(opt => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#412E27] mb-1">
            Tahun
          </label>
          <input
            type="number"
            value={year}
            onChange={e => setYear(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[#CCB89D] bg-[#F5F2EE] text-[#412E27] w-32"
            placeholder="2025"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#412E27] mb-1">
            Kategori
          </label>
          <select
            value={kategoriFilter}
            onChange={e => setKategoriFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[#CCB89D] bg-[#F5F2EE] text-[#412E27]"
          >
            <option value="">Pilih Kategori</option>
            <option value="air">Air</option>
            <option value="listrik">Listrik</option>
            <option value="sampah">Sampah</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>

        <button
          onClick={handleFilterChange}
          className="ml-auto px-5 py-2.5 bg-[#7A2B1E] text-white rounded-lg font-medium flex items-center gap-2 hover:bg-[#5C1F14]"
        >
          <Calendar className="w-4 h-4" />
          Terapkan Filter
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {pengeluarans.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-500">
            Belum ada pengeluaran yang tercatat.
          </div>
        ) : (
          currentData.map(item => (
            <div
              key={item.id}
              className="bg-[#F5F2EE] rounded-lg shadow-sm px-8 py-6 flex items-center justify-between"
            >
              <div className="flex flex-col gap-1 flex-1">
                <h3 className="text-lg font-semibold text-[#412E27] mb-1">
                  {item.judul}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B5D52]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {item.tanggal}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-[#412E27]">
                    <DollarSign className="w-4 h-4" />
                    Rp {item.nominal.toLocaleString('id-ID')}
                  </span>
                  {item.kategori && (
                    <span className="px-3 py-1 text-xs bg-white rounded-full border border-[#CCB89D] text-[#412E27]">
                      {item.kategori}
                    </span>
                  )}
                </div>
                {item.deskripsi && (
                  <p className="text-sm text-[#6B5D52] mt-1">{item.deskripsi}</p>
                )}
              </div>

              <div className="ml-6 flex items-center gap-4">
                <button
                  onClick={() => openEditModal(item)}
                  className="bg-[#4e5f7d] text-white px-4 py-2 rounded-lg hover:bg-[#3d4c65] transition-colors flex items-center gap-2"
                  title="Edit Pengeluaran"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="font-medium">Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteClick(item.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                  title="Hapus Pengeluaran"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium">Hapus</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {pengeluarans.length > 0 && totalPages > 1 && (
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-full transition-colors ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#7A2B1E] text-white hover:bg-[#5C1F14]'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${
                    currentPage === page
                      ? 'bg-[#7A2B1E] text-white scale-110 shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full transition-colors ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#7A2B1E] text-white hover:bg-[#5C1F14]'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto text-black">
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-[#412E27] mb-6">
              Edit Pengeluaran
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">
                Judul
              </label>
              <input
                type="text"
                value={editForm.judul}
                onChange={e =>
                  setEditForm(prev => ({ ...prev, judul: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                placeholder="Judul pengeluaran"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">
                Kategori
              </label>
              <select
                value={editKategoriSelect}
                onChange={e => {
                  setEditKategoriSelect(e.target.value);
                  if (e.target.value !== 'lainnya') setEditCustomKategori('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
              >
                <option value="">Pilih Kategori</option>
                <option value="air">Air</option>
                <option value="listrik">Listrik</option>
                <option value="sampah">Sampah</option>
                <option value="lainnya">Lainnya</option>
              </select>

              {editKategoriSelect === 'lainnya' && (
                <input
                  type="text"
                  value={editCustomKategori}
                  onChange={e => setEditCustomKategori(e.target.value)}
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                  placeholder="Tulis kategori lainnya"
                />
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">
                Tanggal
              </label>
              <input
                type="date"
                value={editForm.tanggal}
                onChange={e =>
                  setEditForm(prev => ({ ...prev, tanggal: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]
                        bg-white text-[#412E27] [color-scheme:light]"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#412E27] mb-2">
                Nominal (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  Rp
                </span>
                <input
                  type="text"
                  value={
                    editForm.nominal
                      ? parseInt(editForm.nominal, 10).toLocaleString('id-ID')
                      : ''
                  }
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      nominal: e.target.value.replace(/[^0-9]/g, ''),
                    }))
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E]"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#412E27] mb-2">
                Deskripsi
              </label>
              <textarea
                value={editForm.deskripsi}
                onChange={e =>
                  setEditForm(prev => ({ ...prev, deskripsi: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A2B1E] h-[80px]"
                placeholder="Keterangan tambahan (opsional)"
              />
            </div>

            <button
              onClick={handleUpdatePengeluaran}
              className="w-full bg-[#6B5D52] text-white py-3 rounded-lg font-medium hover:bg-[#4d3e33] transition-colors"
            >
              Update Pengeluaran
            </button>
          </div>
        </div>
      )}

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

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-[#412E27] mb-2">Konfirmasi Hapus</h3>
              <p className="text-[#6B5D52] mb-6">
                Apakah Anda yakin ingin menghapus pengeluaran ini?
              </p>
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

export default PengeluaranAdminPage;