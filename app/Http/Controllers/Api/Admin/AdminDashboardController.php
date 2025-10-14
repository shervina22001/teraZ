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

        return response()->json([
            'message' => 'Admin dashboard stats',
            'data'    => $stats,
        ]);
    }
}
