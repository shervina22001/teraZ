<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MaintenanceRequest;
use App\Models\Room;
use App\Models\Tenant;
use Illuminate\Support\Facades\Auth;

class MaintenanceAdminController extends Controller
{
    /**
     * Tampilkan halaman daftar laporan maintenance
     */
    public function index(Request $request)
{
    // Filter berdasarkan status, priority, dan sort order
    $statusFilter = $request->input('status');
    $priorityFilter = $request->input('priority');
    $sortOrder = $request->input('sort', 'desc'); // default: desc (urgent first)

    // Query dengan eager loading tenant dan room
    $query = MaintenanceRequest::with(['tenant', 'room']);

    // Apply priority sorting based on sort parameter
    if ($sortOrder === 'asc') {
        // ASC: low → medium → high → urgent
        $query->orderByRaw("
            CASE priority
                WHEN 'low' THEN 1
                WHEN 'medium' THEN 2
                WHEN 'high' THEN 3
                WHEN 'urgent' THEN 4
                ELSE 5
            END
        ");
    } else {
        // DESC: urgent → high → medium → low (default)
        $query->orderByRaw("
            CASE priority
                WHEN 'urgent' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
                ELSE 5
            END
        ");
    }

    // Then order by date
    $query->orderBy('dilaporkan_pada', 'desc');

    // Apply filters jika ada
    if ($statusFilter && $statusFilter !== 'all') {
        $query->where('status', $statusFilter);
    }

    if ($priorityFilter && $priorityFilter !== 'all') {
        $query->where('priority', $priorityFilter);
    }

    // Ambil semua laporan maintenance
    $laporans = $query->get()->map(function ($laporan) {
        return [
            'id' => $laporan->id,
            'kamar' => $laporan->room->nomor_kamar ?? 'Tidak diketahui',
            'tenant_name' => $laporan->tenant->nama ?? 'Unknown',
            'tenant_phone' => $laporan->tenant->kontak ?? '-',
            'judul' => $laporan->judul,
            'deskripsi' => $laporan->deskripsi,
            'tanggal' => $laporan->dilaporkan_pada?->format('d/m/Y') ?? '-',
            'biaya' => $laporan->biaya,
            
            // Priority data
            'priority' => $laporan->priority,
            'priority_label' => $this->mapPriorityLabel($laporan->priority),
            'priority_color' => $this->mapPriorityColor($laporan->priority),
            
            // Status data
            'status' => $laporan->status,
            'status_label' => $this->mapStatus($laporan->status),
            'status_color' => $this->mapStatusColor($laporan->status),
            'icon' => $this->mapIcon($laporan->status),
        ];
    });

    // Statistics untuk dashboard
    $stats = [
        'total' => MaintenanceRequest::count(),
        'pending' => MaintenanceRequest::where('status', 'pending')->count(),
        'in_progress' => MaintenanceRequest::where('status', 'in_progress')->count(),
        'done' => MaintenanceRequest::where('status', 'done')->count(),
        'urgent' => MaintenanceRequest::where('priority', 'urgent')->count(),
        'high' => MaintenanceRequest::where('priority', 'high')->count(),
    ];

    return Inertia::render('admin/MaintenanceAdminPage', [
        'user' => Auth::user(),
        'laporans' => $laporans,
        'stats' => $stats,
        'filters' => [
            'status' => $statusFilter,
            'priority' => $priorityFilter,
            'sort' => $sortOrder,
        ],
    ]);
}


    /**
     * Ubah status, priority, dan biaya laporan maintenance
     */
    public function update(Request $request, MaintenanceRequest $maintenance)
    {
        $request->validate([
            'status' => 'nullable|in:pending,in_progress,done',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'biaya' => 'nullable|integer|min:0',
        ]);

        // Update hanya field yang dikirim
        $updateData = [];
        
        if ($request->has('status')) {
            $updateData['status'] = $request->status;
        }
        
        if ($request->has('priority')) {
            $updateData['priority'] = $request->priority;
        }
        
        if ($request->has('biaya')) {
            $updateData['biaya'] = $request->biaya;
        }

        $maintenance->update($updateData);

        return back()->with('success', 'Laporan maintenance berhasil diperbarui.');
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
     * Simpan laporan maintenance baru (dari admin)
     */
    public function store(Request $request)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'tenant_id' => 'nullable|exists:tenants,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string|max:1000',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'biaya' => 'nullable|integer|min:0',
        ]);

        MaintenanceRequest::create([
            'room_id' => $request->room_id,
            'tenant_id' => $request->tenant_id,
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'priority' => $request->priority ?? 'medium',
            'status' => 'pending',
            'biaya' => $request->biaya,
            'dilaporkan_pada' => now(),
        ]);

        return back()->with('success', 'Laporan maintenance berhasil ditambahkan.');
    }

    /**
     * Mapping status database → status tampilan Indonesian
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
     * Mapping priority database → label Indonesian
     */
    private function mapPriorityLabel($priority)
    {
        return match ($priority) {
            'low' => 'Rendah',
            'medium' => 'Sedang',
            'high' => 'Tinggi',
            'urgent' => 'Mendesak',
            default => 'Sedang',
        };
    }

    /**
     * Mapping priority → color untuk badge
     */
    private function mapPriorityColor($priority)
    {
        return match ($priority) {
            'low' => 'gray',
            'medium' => 'blue',
            'high' => 'orange',
            'urgent' => 'red',
            default => 'blue',
        };
    }

    /**
     * Mapping status → color untuk badge
     */
    private function mapStatusColor($status)
    {
        return match ($status) {
            'pending' => 'yellow',
            'in_progress' => 'blue',
            'done' => 'green',
            default => 'gray',
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
}
