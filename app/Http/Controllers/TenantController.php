<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\RoomController;

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
                'photo' => '/teraZ/testi1.png', // Default photo, can be customized
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
        if ($tenant->user && isset($validated['username'])) {
            $tenant->user->update(['email' => $validated['username']]);
        }

        return redirect()->back()->with('success', 'Tenant updated successfully.');
    }

    // Delete tenant
    public function destroy($id)
    {
        $tenant = Tenant::findOrFail($id);
        
        // Get room before deleting tenant
        $roomId = $tenant->room_id;
        
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