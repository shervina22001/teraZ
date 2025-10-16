<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MaintenanceRequest;
use Illuminate\Support\Facades\Auth;

class MaintenanceAdminController extends Controller
{
    /**
     * Tampilkan halaman daftar laporan maintenance
     */
    public function index()
    {
        // Ambil semua laporan maintenance beserta relasi kamar
        $laporans = MaintenanceRequest::with('room')
            ->orderBy('dilaporkan_pada', 'desc')
            ->get()
            ->map(function ($laporan) {
                // Mapping agar cocok dengan data yang dipakai di React
                return [
                    'id' => $laporan->id,
                    'kamar' => $laporan->room?->room_number ?? 'Tidak diketahui',
                    'judul' => $laporan->judul,
                    'deskripsi' => $laporan->deskripsi,
                    'tanggal' => $laporan->dilaporkan_pada?->format('d/m/Y'),
                    'status' => $this->mapStatus($laporan->status),
                    'icon' => $this->mapIcon($laporan->status),
                ];
            });

        return Inertia::render('admin/MaintenanceAdminPage', [
            'user' => auth::user(),
            'laporans' => $laporans,
        ]);
    }

    /**
     * Ubah status laporan maintenance (Menunggu, Sedang Proses, Selesai)
     */
    public function update(Request $request, MaintenanceRequest $maintenance)
    {
        $request->validate([
            'status' => 'required|in:Menunggu,Sedang Proses,Selesai',
        ]);

        // Mapping balik ke versi database
        $statusMap = [
            'Menunggu' => 'pending',
            'Sedang Proses' => 'in_progress',
            'Selesai' => 'done',
        ];

        $maintenance->update([
            'status' => $statusMap[$request->status],
        ]);

        return back()->with('success', 'Status laporan berhasil diperbarui.');
    }

    /**
     * Mapping status database → status tampilan
     */
    private function mapStatus($status)
    {
        return match ($status) {
            'pending' => 'Menunggu',
            'in_progress' => 'Sedang Proses',
            'done' => 'Selesai',
            default => 'Menunggu',
        };
    }

    /**
     * Mapping status → icon di UI
     */
    private function mapIcon($status)
    {
        return match ($status) {
            'pending' => 'alert',
            'in_progress' => 'loader',
            'done' => 'check',
            default => 'alert',
        };
    }
    /**
     * Hapus laporan maintenance
     */
    public function destroy(MaintenanceRequest $maintenance)
    {
        $maintenance->delete();
        return back()->with('success', 'Laporan maintenance berhasil dihapus.');
    }

    /**
     * Simpan laporan maintenance baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
        ]);

        MaintenanceRequest::create([
            'room_id' => $request->room_id,
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'status' => 'pending',
            'dilaporkan_pada' => now(),
        ]);

        return back()->with('success', 'Laporan maintenance berhasil ditambahkan.');
    }
}