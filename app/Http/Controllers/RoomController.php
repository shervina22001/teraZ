<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomController extends Controller
{
    // READ: Show all rooms page with Inertia
    public function index()
    {
        $rooms = Room::with('tenants')->get()->map(function ($room) {
            return [
                'id' => $room->id,
                'number' => $room->nomor_kamar,
                'price' => $room->harga,
                'status' => $room->status === 'terisi' ? 'Terisi' : 'Kosong',
                'facilities' => $room->fasilitas ?? '',
                'type' => $room->tipe,
            ];
        });

        return Inertia::render('admin/KelolaKamarAdminPage', [
            'rooms' => $rooms,
        ]);
    }

    // STORE: Handle room creation form submit
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_kamar' => 'required|string|max:10|unique:rooms,nomor_kamar',
            'tipe' => 'required|string|max:50',
            'harga' => 'required|numeric',
            'fasilitas' => 'nullable|string',
            'status' => 'required|in:tersedia,terisi,maintenance',
        ]);

        Room::create($validated);

        return redirect()->route('admin.rooms.index')->with('success', 'Room created successfully.');
    }

    // READ: Show single room page
    public function show($id)
    {
        $room = Room::with(['tenants' => function($query) {
            $query->where('status', 'aktif');
        }])->findOrFail($id);

        return response()->json([
            'id' => $room->id,
            'number' => $room->nomor_kamar,
            'price' => $room->harga,
            'status' => $room->status,
            'facilities' => $room->fasilitas,
            'type' => $room->tipe,
            'current_tenant' => $room->tenants->first(),
        ]);
    }

    // UPDATE: Handle room update form submit
    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'number' => 'required|string|max:10|unique:rooms,nomor_kamar,' . $room->id,
            'price' => 'required|numeric',
            'facilities' => 'nullable|string',
            'status' => 'required|in:Terisi,Kosong,Maintenance',
        ]);

        // Map frontend status to database status
        $statusMap = [
            'Terisi' => 'terisi',
            'Kosong' => 'tersedia',
            'Maintenance' => 'maintenance',
        ];

        $room->update([
            'nomor_kamar' => $validated['number'],
            'harga' => $validated['price'],
            'fasilitas' => $validated['facilities'],
            'status' => $statusMap[$validated['status']] ?? 'tersedia',
        ]);

        return redirect()->back()->with('success', 'Room updated successfully.');
    }

    // UPDATE STATUS: Update room status (auto-called when tenant assigned/removed)
    public function updateStatus(Request $request, $id)
    {
        $room = Room::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:tersedia,terisi,maintenance',
        ]);

        $room->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Room status updated successfully.',
            'room' => $room,
        ]);
    }

    // DELETE
    public function destroy($id)
    {
        $room = Room::findOrFail($id);
        
        // Check if room has active tenants
        if ($room->tenants()->where('status', 'aktif')->exists()) {
            return redirect()->back()->with('error', 'Cannot delete room with active tenants.');
        }

        $room->delete();
        return redirect()->back()->with('success', 'Room deleted successfully.');
    }
}