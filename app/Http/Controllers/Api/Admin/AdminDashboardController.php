<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\Payment;

class AdminDashboardController extends Controller
{
    /**
     * GET /api/admin/dashboard
     * Menampilkan ringkasan statistik untuk admin
     */
    public function index()
    {
        $stats = [
            'users'    => User::count(),
            'rooms'    => Room::count(),
            'tenants'  => Tenant::count(),
            'payments' => Payment::count(),
            'unpaid'   => Payment::where('status','pending')->count(),
            'paid'     => Payment::where('status','paid')->count(),
        ];

        $reminderLogs = Payment::with(['tenant', 'room'])
        ->whereNotNull('last_notified_at')
        ->orderByDesc('last_notified_at')
        ->limit(10)
        ->get()
        ->map(function ($p) {

            $unpaidPayments = Payment::with(['tenant', 'room'])
            ->where('status', 'pending')
            ->orderBy('due_date')        // kalau tidak ada kolom due_date, bisa diganti created_at
            ->limit(10)
            ->get();

            return Inertia::render('admin/DashboardAdminPage', [
            'stats'          => $stats,
            'reminderLogs'   => $reminderLogs,
            'recent_maintenance' => $recentMaintenance,
            'reminder_logs'   => $reminderLogs,
            'unpaidPayments'  => $unpaidPayments, 

            ]);

            return [
                'id' => $p->id,
                'room_number' => $p->room->room_number ?? '-',
                'tenant_name' => $p->tenant->name ?? '-',
                'amount' => (int) $p->amount,
                'due_date' => optional($p->due_date)->format('d-m-Y'),
                'status' => $p->status,
                'status_label' => $p->status_label,   // dari accessor di model Payment
                'status_color' => $p->status_color,   // dari accessor di model Payment
                'last_notified_at' => optional($p->last_notified_at)->format('d-m-Y H:i'),
            ];
        });


        return response()->json([
            'message' => 'Admin dashboard stats',
            'data'    => $stats,
            'reminder_logs' => $reminderLogs,
        ]);
    }
}
