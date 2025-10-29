<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Halaman profil tenant/user.
     */
    public function profile(Request $request)
    {
        $u = $request->user();

        // Find tenant by matching nama with user's name or kontak with user's phone
        $tenant = Tenant::with('room')
            ->where('nama', $u->name)
            ->orWhere('kontak', $u->phone)
            ->latest('id')
            ->first();

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

        // Get profile photo URL
        $profilePhoto = asset('teraZ/testi1.png'); // Default
        if ($tenant && $tenant->profile_photo) {
            $profilePhoto = asset('storage/' . $tenant->profile_photo);
        }

        return Inertia::render('user/ProfilePage', [
            'user' => [
                'id'       => $u->id,
                'name'     => $u->name,
                'username' => $u->username,
                'phone'    => $u->phone,
                'role'     => $u->role,
            ],
            'tenant' => [
                'id' => $tenant->id ?? null,
                'profile_photo' => $profilePhoto,
            ],
            'room' => $room,
            'contract' => $contract,
        ]);
    }

    /**
     * Update profile photo
     */
    public function updateProfilePhoto(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'profile_photo' => 'required|image|mimes:jpeg,jpg,png|max:2048', // Max 2MB
        ]);

        // Find tenant
        $tenant = Tenant::where('nama', $user->name)
            ->orWhere('kontak', $user->phone)
            ->latest('id')
            ->first();

        if (!$tenant) {
            return back()->with('error', 'Data tenant tidak ditemukan.');
        }

        try {
            // Delete old photo if exists
            if ($tenant->profile_photo && Storage::disk('public')->exists($tenant->profile_photo)) {
                Storage::disk('public')->delete($tenant->profile_photo);
            }

            // Upload new photo
            $file = $request->file('profile_photo');
            $filename = 'profile_' . $tenant->id . '_' . time() . '.' . $file->extension();
            $path = $file->storeAs('profile_photos', $filename, 'public');

            // Update tenant
            $tenant->update([
                'profile_photo' => $path,
            ]);

            return back()->with('success', 'Foto profil berhasil diperbarui.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal memperbarui foto profil: ' . $e->getMessage());
        }
    }

    /**
     * Dashboard admin.
     */
    public function adminDashboard(Request $request)
    {
        $u = $request->user();

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

        // Get profile photo URL
        $profilePhoto = asset('teraZ/testi1.png'); // Default
        if ($tenant && $tenant->profile_photo) {
            $profilePhoto = asset('storage/' . $tenant->profile_photo);
        }

        return response()->json([
            'user' => [
                'id'       => $u->id,
                'name'     => $u->name,
                'username' => $u->username,
                'phone'    => $u->phone,
                'role'     => $u->role,
            ],
            'tenant' => [
                'id' => $tenant->id ?? null,
                'profile_photo' => $profilePhoto,
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
