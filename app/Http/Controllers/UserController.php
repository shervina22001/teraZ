<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Payment;
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

        // Cari tenant pakai user_id langsung (lebih aman daripada nama/kontak)
        $tenant = Tenant::with('room')
            ->where('user_id', $u->id)
            ->latest('id')
            ->first();

        if (!$tenant) {
            return redirect()->route('dashboard')->with('error', 'Data tenant tidak ditemukan.');
        }

        $unpaidCount = $tenant->payments()
        ->where('status', 'pending')   // sesuaikan kalau status di DB-mu beda, misal 'unpaid'
        ->count();

        // Map data room
        $room = $tenant->room ? [
            'number'        => $tenant->room->nomor_kamar,
            'type'          => $tenant->room->tipe,
            'monthly_rent'  => $tenant->room->harga,
            'status'        => $tenant->room->status,
        ] : null;

        // Map data kontrak
        $contract = [
            'start_date'      => optional($tenant->tanggal_mulai)->format('Y-m-d'),
            'end_date'        => optional($tenant->tanggal_selesai)->format('Y-m-d'),
            'duration_months' => ($tenant->tanggal_mulai && $tenant->tanggal_selesai)
                ? \Illuminate\Support\Carbon::parse($tenant->tanggal_mulai)
                    ->diffInMonths(\Illuminate\Support\Carbon::parse($tenant->tanggal_selesai))
                : null,
            'status'          => $tenant->status,
            'note'            => $tenant->catatan,
        ];

        // Foto profil dengan cache busting
        $profilePhoto = $tenant->profile_photo
            ? asset('storage/' . $tenant->profile_photo) . '?v=' . strtotime($tenant->updated_at)
            : asset('teraZ/testi1.png');

        return Inertia::render('user/ProfilePage', [
            'user' => [
                'id'       => $u->id,
                'name'     => $tenant->nama ?? $u->name, 
                'username' => $tenant->user?->email ?? $u->username,
                'phone'    => $tenant->kontak,
                'role'     => $u->role,
                'room'     => $tenant->room->nomor_kamar ?? null, 
            ],
            'tenant' => [
                'id'            => $tenant->id,
                'profile_photo' => $profilePhoto,
            ],
            'room'     => $room,
            'contract' => $contract,

            'unpaidCount' => $unpaidCount,
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

        // Find tenant - KONSISTEN dengan method profile()
        $tenant = Tenant::where('user_id', $user->id)
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
            \Log::error('Profile photo update failed: ' . $e->getMessage());
            return back()->with('error', 'Gagal memperbarui foto profil.');
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

        // Get profile photo URL dengan cache busting
        $profilePhoto = asset('teraZ/testi1.png'); // Default
        if ($tenant && $tenant->profile_photo) {
            $profilePhoto = asset('storage/' . $tenant->profile_photo) . '?v=' . strtotime($tenant->updated_at);
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
