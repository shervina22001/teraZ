<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\MaintenanceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    /**
     * Halaman laporan maintenance (TENANT).
     */
        public function index(Request $request)
    {
        $u = $request->user();

        $tenant = Tenant::with('room')
            ->where('user_id', $u->id)               // <- paling akurat pakai user_id
            ->latest('id')
            ->first();

        if (!$tenant) {
            return redirect()->route('profile')
                ->with('error', 'Data tenant tidak ditemukan.');
        }

        $reports = MaintenanceRequest::where('tenant_id', $tenant->id)
            ->with(['room'])
            ->orderByDesc('dilaporkan_pada')
            ->get()
            ->map(function ($report) {
                return [
                    'id'             => $report->id,
                    'title'          => $report->judul,
                    'description'    => $report->deskripsi,
                    'reported_date'  => optional($report->dilaporkan_pada)->format('d M Y'),
                    'resolved_date'  => $report->status === 'done' ? optional($report->updated_at)->format('d M Y') : null,
                    'room_number'    => $report->room->nomor_kamar ?? '-',
                    'priority'       => match ($report->priority) {
                        'low' => 'Rendah', 'medium' => 'Sedang', 'high' => 'Tinggi', 'urgent' => 'Mendesak', default => 'Sedang',
                    },
                    'priority_color' => match ($report->priority) {
                        'low' => 'gray', 'medium' => 'blue', 'high' => 'orange', 'urgent' => 'red', default => 'blue',
                    },
                    'status'         => match ($report->status) {
                        'pending' => 'Menunggu', 'in_progress' => 'Sedang Proses', 'done' => 'Selesai', default => 'Menunggu',
                    },
                    'status_color'   => match ($report->status) {
                        'pending' => 'yellow', 'in_progress' => 'blue', 'done' => 'green', default => 'gray',
                    },
                ];
            });

        return Inertia::render('user/MaintenancePage', [
            'user' => [
                'id'       => $u->id,
                'name'     => $tenant->nama ?? $u->name, 
                'username' => $u->username,
                'phone'    => $u->phone,
                'role'     => $u->role,
                'room'     => $tenant->room->nomor_kamar ?? null, 
            ],
            'reports' => $reports,
        ]);
    }


    /**
     * Simpan laporan baru dari tenant.
     */
    public function store(Request $request)
    {
        $u = $request->user();

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
        ]);

        $tenant = Tenant::where('user_id', $u->id)
            ->orWhere('nama', $u->name)
            ->orWhere('kontak', $u->phone)
            ->latest('id')
            ->first();

        if (!$tenant) {
            return redirect()
                ->route('profile') // jangan ke 'dashboard'
                ->with('error', 'Tenant tidak ditemukan. Laporan gagal dikirim.');
        }

        MaintenanceRequest::create([
            'tenant_id' => $tenant->id,
            'room_id' => $tenant->room_id,
            'judul' => $request->title,
            'deskripsi' => $request->description,
            'priority' => 'medium',
            'status' => 'pending',
            'dilaporkan_pada' => now(),
        ]);

        // kembali ke halaman maintenance tenant
        return redirect()
            ->route('maintenance.index')
            ->with('success', 'Laporan kerusakan berhasil dikirim.');
    }
}
