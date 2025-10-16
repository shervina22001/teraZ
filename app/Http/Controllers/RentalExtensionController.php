<?php

namespace App\Http\Controllers;

use App\Models\RentalExtension;
use App\Models\Tenant;
use App\Models\Room;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class RentalExtensionController extends Controller
{
    // Show all extension requests
    public function index()
    {
        $extensions = RentalExtension::with(['tenant.room'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($extension) {
                return [
                    'id' => $extension->id,
                    'tenant_name' => $extension->tenant->nama,
                    'room_number' => $extension->tenant->room->nomor_kamar ?? '-',
                    'old_end_date' => Carbon::parse($extension->old_end_date)->format('d M Y'),
                    'new_end_date' => Carbon::parse($extension->new_end_date)->format('d M Y'),
                    'extension_fee' => $extension->extension_fee,
                    'status' => $extension->status,
                    'requested_at' => $extension->requested_at ? Carbon::parse($extension->requested_at)->format('d M Y H:i') : '-',
                    'notes' => $extension->notes,
                ];
            });

        // Get tenants with upcoming lease expirations (within 30 days)
        $upcomingExpirations = Tenant::with('room')
            ->where('status', 'aktif')
            ->whereBetween('tanggal_selesai', [now(), now()->addDays(30)])
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'nama' => $tenant->nama,
                    'room_number' => $tenant->room->nomor_kamar ?? '-',
                    'end_date' => Carbon::parse($tenant->tanggal_selesai)->format('d M Y'),
                    'days_remaining' => now()->diffInDays($tenant->tanggal_selesai, false),
                ];
            });

        return Inertia::render('admin/RentalExtensionAdminPage', [
            'extensions' => $extensions,
            'upcomingExpirations' => $upcomingExpirations,
        ]);
    }

    // Create extension request
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'new_end_date' => 'required|date|after:old_end_date',
            'extension_fee' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $tenant = Tenant::findOrFail($validated['tenant_id']);

        $extension = RentalExtension::create([
            'tenant_id' => $validated['tenant_id'],
            'old_end_date' => $tenant->tanggal_selesai,
            'new_end_date' => $validated['new_end_date'],
            'extension_fee' => $validated['extension_fee'] ?? 0,
            'status' => 'pending',
            'requested_at' => now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Extension request created.');
    }

    // Approve extension
    public function approve(Request $request, $id)
    {
        $extension = RentalExtension::with('tenant')->findOrFail($id);
        
        // Update extension status
        $extension->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        // Update tenant end date
        $extension->tenant->update([
            'tanggal_selesai' => $extension->new_end_date,
        ]);

        // Create notification for tenant
        if ($extension->tenant->user_id) {
            Notification::create([
                'user_id' => $extension->tenant->user_id,
                'tenant_id' => $extension->tenant_id,
                'type' => 'lease_extended',
                'title' => 'Perpanjangan Sewa Disetujui',
                'message' => "Perpanjangan sewa Anda telah disetujui hingga " . Carbon::parse($extension->new_end_date)->format('d M Y'),
            ]);
        }

        return redirect()->back()->with('success', 'Extension approved successfully.');
    }

    // Reject extension
    public function reject(Request $request, $id)
    {
        $extension = RentalExtension::with('tenant')->findOrFail($id);
        
        $extension->update([
            'status' => 'rejected',
        ]);

        // Create notification for tenant
        if ($extension->tenant->user_id) {
            Notification::create([
                'user_id' => $extension->tenant->user_id,
                'tenant_id' => $extension->tenant_id,
                'type' => 'lease_rejected',
                'title' => 'Perpanjangan Sewa Ditolak',
                'message' => 'Perpanjangan sewa Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut.',
            ]);
        }

        return redirect()->back()->with('success', 'Extension rejected.');
    }

    // Terminate lease (end tenancy)
    public function terminate($tenantId)
    {
        $tenant = Tenant::with('room')->findOrFail($tenantId);
        
        // Update tenant status
        $tenant->update([
            'status' => 'selesai',
        ]);

        // Update room status to available
        if ($tenant->room_id) {
            Room::where('id', $tenant->room_id)->update(['status' => 'tersedia']);
        }

        // Create notification
        if ($tenant->user_id) {
            Notification::create([
                'user_id' => $tenant->user_id,
                'tenant_id' => $tenant->id,
                'type' => 'lease_terminated',
                'title' => 'Sewa Berakhir',
                'message' => 'Masa sewa Anda telah berakhir. Terima kasih telah menjadi penghuni kami.',
            ]);
        }

        return redirect()->back()->with('success', 'Lease terminated successfully.');
    }

    // Check for expiring leases and send reminders
    public function checkExpiringLeases()
    {
        // Get tenants with leases expiring in 7 days
        $expiringTenants = Tenant::where('status', 'aktif')
            ->whereBetween('tanggal_selesai', [now()->addDays(7), now()->addDays(8)])
            ->get();

        $notificationCount = 0;
        foreach ($expiringTenants as $tenant) {
            if ($tenant->user_id) {
                Notification::create([
                    'user_id' => $tenant->user_id,
                    'tenant_id' => $tenant->id,
                    'type' => 'lease_expiring',
                    'title' => 'Pengingat: Sewa Akan Berakhir',
                    'message' => 'Masa sewa Anda akan berakhir dalam 7 hari. Silakan hubungi admin jika ingin memperpanjang.',
                ]);
                $notificationCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Sent {$notificationCount} expiration reminder(s).",
        ]);
    }
}
