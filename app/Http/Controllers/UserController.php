<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
    {
        /**
         * Halaman profil tenant/user.
         */
        public function profile(Request $request)
    {
        $u = $request->user();

        // Option 2: Find tenant by matching nama with user's name
        // or kontak with user's phone
        $tenant = Tenant::with('room')
            ->where('nama', $u->name)
            ->orWhere('kontak', $u->phone)
            ->latest('id')
            ->first();

        // Alternative: If you want to match only active tenants
        // $tenant = Tenant::with('room')
        //     ->where(function($query) use ($u) {
        //         $query->where('nama', $u->name)
        //               ->orWhere('kontak', $u->phone);
        //     })
        //     ->where('status', 'active')
        //     ->latest('id')
        //     ->first();

        // Map data room (kalau ada)
        $room = $tenant && $tenant->room ? [
            'number'        => $tenant->room->nomor_kamar ?? '01',
            'type'          => $tenant->room->tipe ?? 'Single Room',
            'monthly_rent'  => $tenant->room->harga ?? 850000,
            'status'        => $tenant->room->status ?? 'occupied',
        ] : [
            'number'        => '01',
            'type'          => 'Single Room',
            'monthly_rent'  => 850000,
            'status'        => 'occupied',
        ];

        // Map data kontrak (kalau ada)
        $contract = $tenant ? [
            'start_date'      => optional($tenant->tanggal_mulai)->format('Y-m-d') ?? '2025-09-01',
            'end_date'        => optional($tenant->tanggal_selesai)->format('Y-m-d') ?? '2025-12-01',
            'duration_months' => ($tenant->tanggal_mulai && $tenant->tanggal_selesai)
                ? \Illuminate\Support\Carbon::parse($tenant->tanggal_mulai)
                    ->diffInMonths(\Illuminate\Support\Carbon::parse($tenant->tanggal_selesai))
                : 3,
            'status'          => $tenant->status ?? 'active',
            'note'            => $tenant->catatan ?? '',
        ] : [
            'start_date'      => '2025-09-01',
            'end_date'        => '2025-12-01',
            'duration_months' => 3,
            'status'          => 'active',
            'note'            => '',
        ];

        return Inertia::render('user/ProfilePage', [
            'user' => [
                'id'       => $u->id,
                'name'     => $u->name,
                'username' => $u->username,
                'phone'    => $u->phone,
                'role'     => $u->role,
            ],
            'room' => $room,
            'contract' => $contract,
        ]);
    }


    /**
     * Dashboard admin.
     */
    public function adminDashboard(Request $request)
    {
        $u = $request->user();

        // PENTING: Sesuaikan path dengan struktur file TSX Anda
        // Jika file ada di resources/js/Pages/admin/DashboardAdminPage.tsx → gunakan 'admin/DashboardAdminPage'
        return Inertia::render('admin/DashboardAdminPage', [
            'user' => [
                'id'   => $u->id,
                'name' => $u->name,
            ],
        ]);
    }

    /**
 * API endpoint: Return user profile as JSON
 */
public function me(Request $request)
{
    $u = $request->user();

    // Ambil relasi tenant + room
    $tenant = Tenant::with('room')
        ->where('user_id', $u->id)
        ->latest('id')
        ->first();

    return response()->json([
        'user' => [
            'id'       => $u->id,
            'name'     => $u->name,
            'username' => $u->username,
            'phone'    => $u->phone,
            'role'     => $u->role,
        ],
        'room' => $tenant && $tenant->room ? [
            'number'        => $tenant->room->nomor_kamar,
            'type'          => $tenant->room->tipe,
            'monthly_rent'  => $tenant->room->harga,
            'status'        => $tenant->room->status,
        ] : null,
        'contract' => $tenant ? [
            'start_date'      => optional($tenant->tanggal_mulai)->format('Y-m-d'),
            'end_date'        => optional($tenant->tanggal_selesai)->format('Y-m-d'),
            'duration_months' => ($tenant->tanggal_mulai && $tenant->tanggal_selesai)
                ? \Illuminate\Support\Carbon::parse($tenant->tanggal_mulai)
                    ->diffInMonths(\Illuminate\Support\Carbon::parse($tenant->tanggal_selesai))
                : null,
            'status'          => $tenant->status,
            'note'            => $tenant->catatan,
        ] : null,
    ]);
}

}