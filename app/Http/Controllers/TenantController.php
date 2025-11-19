<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\RoomController;
use Illuminate\Support\Facades\Storage;

class TenantController extends Controller
{
    // Show all tenants page
    public function index()
    {
        $tenants = Tenant::with(['room', 'user'])->get()->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'name' => $tenant->nama,
                'username' => $tenant->user ? $tenant->user->email : $tenant->kontak,
                'phone' => $tenant->kontak,
                'roomNumber' => $tenant->room ? $tenant->room->nomor_kamar : '-',
                'status' => $this->mapPaymentStatus($tenant),
                'photo' => $tenant->profile_photo 
                    ? asset('storage/' . $tenant->profile_photo) . '?v=' . strtotime($tenant->updated_at) 
                    : asset('teraZ/testi1.png'),
                'start_date' => $tenant->tanggal_mulai?->format('Y-m-d'),
                'end_date' => $tenant->tanggal_selesai?->format('Y-m-d'),
                'tenant_status' => $tenant->status,
            ];
        });

        $rooms = Room::where('status', 'tersedia')->get();

        return Inertia::render('admin/ManajemenPenghuniAdminPage', [
            'tenants' => $tenants,
            'availableRooms' => $rooms,
        ]);

        return Inertia::render('user/Profile', [
            'user'    => $user,
            'tenant'  => [
                'id'            => $tenant->id,
                'profile_photo' => $tenant->profile_photo_full, // <- PERHATIKAN INI
                'updated_at'    => $tenant->updated_at,
            ],
            // room, contract, dst...
        ]);
    }

    // Create new tenant
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kontak' => 'required|string|max:50',
            'email' => 'nullable|email|unique:users,email',
            'room_id' => 'required|exists:rooms,id',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after:tanggal_mulai',
            'catatan' => 'nullable|string',
        ]);

        // Create user account for tenant if email provided
        $userId = null;
        if (!empty($validated['email'])) {
            $user = User::create([
                'name' => $validated['nama'],
                'username' => $validated['nama'],
                'email' => $validated['email'],
                'role' => 'tenant',
                'password' => Hash::make('password123'), // Default password
            ]);
            $userId = $user->id;
        }

        // Create tenant record
        $tenant = Tenant::create([
            'user_id' => $userId,
            'room_id' => $validated['room_id'],
            'nama' => $validated['nama'],
            'kontak' => $validated['kontak'],
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tanggal_selesai' => $validated['tanggal_selesai'],
            'status' => 'aktif',
            'catatan' => $validated['catatan'] ?? null,
        ]);

        // Update room status to occupied
        Room::where('id', $validated['room_id'])->update(['status' => 'terisi']);

        return redirect()->back()->with('success', 'Tenant added successfully.');
    }

    // Show single tenant
    public function show($id)
    {
        $tenant = Tenant::with(['room', 'user', 'payments'])->findOrFail($id);
        
        return response()->json([
            'tenant' => $tenant,
            'payment_history' => $tenant->payments()->orderBy('created_at', 'desc')->get(),
        ]);
    }

    // Update tenant
    public function update(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'nullable|string|max:255',
            'phone' => 'required|string|max:50',
            'roomNumber' => 'nullable|string|max:10',
            'status' => 'required|in:Lunas,Terlambat,Menunggu',
        ]);

        // Update tenant info
        $tenant->update([
            'nama' => $validated['name'],
            'kontak' => $validated['phone'],
        ]);

        // Update user email if username provided
        if ($tenant->user) {
            $tenant->user->update([
                'name' => $validated['name'], // Also use unique name!
            ]);
        }

        return redirect()->back()->with('success', 'Tenant updated successfully.');
    }

    // Delete tenant
    public function destroy($id)
    {
        $tenant = Tenant::findOrFail($id);
        
        // Get room before deleting tenant
        $roomId = $tenant->room_id;
        
        // Hapus foto profil jika ada
        if ($tenant->profile_photo && Storage::disk('public')->exists($tenant->profile_photo)) {
            Storage::disk('public')->delete($tenant->profile_photo);
        }
        
        // Delete tenant
        $tenant->delete();
        
        // Update room status back to available if no other active tenants
        if ($roomId) {
            $hasActiveTenants = Tenant::where('room_id', $roomId)
                ->where('status', 'aktif')
                ->exists();
            
            if (!$hasActiveTenants) {
                Room::where('id', $roomId)->update(['status' => 'tersedia']);
            }
        }

        return redirect()->back()->with('success', 'Tenant removed successfully.');
    }

    /**
     * FIXED: Update foto profil untuk tenant yang sedang login
     * Route: POST /profile/update-photo
     */
    public function updateProfilePhoto(Request $request)
    {
        // Validasi file
        $request->validate([
            'profile_photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Dapatkan user yang sedang login
        $user = Auth::user();
        
        // Dapatkan tenant berdasarkan user_id
        $tenant = Tenant::where('user_id', $user->id)->firstOrFail();

        // Hapus foto lama jika ada
        if ($tenant->profile_photo && Storage::disk('public')->exists($tenant->profile_photo)) {
            Storage::disk('public')->delete($tenant->profile_photo);
        }

        // Simpan foto baru dengan nama unik
        $file = $request->file('profile_photo');
        $filename = 'tenant_' . $tenant->id . '_' . time() . '.' . $file->extension();
        $path = $file->storeAs('profile_photos', $filename, 'public');

        // Update path foto di database dan timestamp updated_at
        $tenant->update([
            'profile_photo' => $path,
            'updated_at' => now(), // Force update timestamp
        ]);

        return back()->with('success', 'Foto profil berhasil diperbarui.');
    }

    /**
     * OPTIONAL: Update foto profil untuk tenant tertentu (untuk admin)
     * Route: POST /admin/tenants/{id}/update-photo
     */
    public function updatePhotoById(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);

        $request->validate([
            'profile_photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Hapus foto lama jika ada
        if ($tenant->profile_photo && Storage::disk('public')->exists($tenant->profile_photo)) {
            Storage::disk('public')->delete($tenant->profile_photo);
        }

        // Simpan foto baru
        $file = $request->file('profile_photo');
        $filename = 'tenant_' . $tenant->id . '_' . time() . '.' . $file->extension();
        $path = $file->storeAs('profile_photos', $filename, 'public');

        // Update path foto di database
        $tenant->update([
            'profile_photo' => $path,
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Foto profil tenant berhasil diperbarui.');
    }

    // Helper function to map payment status
    private function mapPaymentStatus($tenant)
    {
        // Check if tenant has any overdue payments
        $overduePayment = $tenant->payments()
            ->where('status', 'overdue')
            ->exists();
        
        if ($overduePayment) {
            return 'Terlambat';
        }

        // Check if tenant has pending payments
        $pendingPayment = $tenant->payments()
            ->where('status', 'pending')
            ->exists();
        
        if ($pendingPayment) {
            return 'Menunggu';
        }

        return 'Lunas';
    }
}