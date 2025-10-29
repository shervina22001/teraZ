<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\MaintenanceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    /**
     * Menampilkan halaman laporan maintenance (hanya untuk tenant).
     */
    public function index(Request $request)
    {
        $u = $request->user();

        // Cari tenant berdasarkan nama atau kontak user
        $tenant = Tenant::where('nama', $u->name)
            ->orWhere('kontak', $u->phone)
            ->latest('id')
            ->first();

        // Kalau tenant tidak ditemukan → redirect ke dashboard
        if (!$tenant) {
            return redirect()->route('dashboard')->with('error', 'Data tenant tidak ditemukan.');
        }

        // Ambil laporan maintenance milik tenant dengan relasi room
        $reports = MaintenanceRequest::where('tenant_id', $tenant->id)
            ->with(['room'])
            ->orderByDesc('dilaporkan_pada')
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'title' => $report->judul,
                    'description' => $report->deskripsi,
                    'reported_date' => optional($report->dilaporkan_pada)->format('d M Y'),
                    'resolved_date' => $report->status === 'done' ? optional($report->updated_at)->format('d M Y') : null,
                    'room_number' => $report->room->nomor_kamar ?? '-',
                    // Priority dalam Indonesian untuk display
                    'priority' => match ($report->priority) {
                        'low' => 'Rendah',
                        'medium' => 'Sedang',
                        'high' => 'Tinggi',
                        'urgent' => 'Mendesak',
                        default => 'Sedang',
                    },
                    'priority_color' => match ($report->priority) {
                        'low' => 'gray',
                        'medium' => 'blue',
                        'high' => 'orange',
                        'urgent' => 'red',
                        default => 'blue',
                    },
                    'status' => match ($report->status) {
                        'pending' => 'Menunggu',
                        'in_progress' => 'Sedang Proses',
                        'done' => 'Selesai',
                        default => 'Menunggu',
                    },
                    'status_color' => match ($report->status) {
                        'pending' => 'yellow',
                        'in_progress' => 'blue',
                        'done' => 'green',
                        default => 'gray',
                    },
                ];
            });

        return Inertia::render('user/MaintenancePage', [
            'user' => [
                'id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'phone' => $u->phone,
                'role' => $u->role,
            ],
            'reports' => $reports,
        ]);
    }

    /**
     * Simpan laporan baru dari tenant.
     * TENANT TIDAK BISA SET PRIORITY - hanya admin yang bisa.
     */
    public function store(Request $request)
    {
        $u = $request->user();

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
        ]);

        // Cari tenant yang sesuai dengan user
        $tenant = Tenant::where('nama', $u->name)
            ->orWhere('kontak', $u->phone)
            ->latest('id')
            ->first();

        if (!$tenant) {
            return back()->with('error', 'Tenant tidak ditemukan. Laporan gagal dikirim.');
        }

        // Simpan laporan baru - priority default 'medium', admin yang akan update
        MaintenanceRequest::create([
            'tenant_id' => $tenant->id,
            'room_id' => $tenant->room_id,
            'judul' => $request->title,
            'deskripsi' => $request->description,
            'priority' => 'medium', // Default priority
            'status' => 'pending',
            'dilaporkan_pada' => now(),
        ]);

        return back()->with('success', 'Laporan kerusakan berhasil dikirim.');
    }
}
