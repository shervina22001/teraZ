<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoomAdminController extends Controller
{
    /**
     * GET /api/admin/rooms
     * dukung filter ?status=&tipe=&q=&per_page=
     */
    public function index()
    {
        $q = Room::query();

        if ($request->filled('status')) {
            $q->where('status', $request->string('status'));
        }
        if ($request->filled('tipe')) {
            $q->where('tipe', $request->string('tipe'));
        }
        if ($request->filled('q')) {
            $s = (string)$request->get('q');
            $q->where(function ($w) use ($s) {
                $w->where('nomor_kamar', 'ilike', "%{$s}%")
                  ->orWhere('tipe', 'ilike', "%{$s}%")
                  ->orWhere('fasilitas', 'ilike', "%{$s}%");
            });
        }

        return $q->latest()->paginate((int) $request->get('per_page', 15));
    }

    /**
     * POST /api/admin/rooms
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nomor_kamar' => ['required','string','max:50','unique:rooms,nomor_kamar'],
            'tipe'        => ['required','string','max:100'],
            'harga'       => ['required','integer','min:0'],
            'status'      => ['required','string', Rule::in(['available','occupied','maintenance'])],
            'fasilitas'   => ['nullable','string'],
        ]);

        $room = Room::create($data);
        return response()->json($room, 201);
    }

    /**
     * GET /api/admin/rooms/{room}
     */
    public function show(Room $room)
    {
        // jika kamu ingin kirim relasi juga:
        $room->loadMissing(['tenants','maintenanceRequests']);
        return $room;
    }

    /**
     * PUT/PATCH /api/admin/rooms/{room}
     */
    public function update(Request $request, Room $room)
    {
        $data = $request->validate([
            'nomor_kamar' => ['sometimes','string','max:50', Rule::unique('rooms','nomor_kamar')->ignore($room->id)],
            'tipe'        => ['sometimes','string','max:100'],
            'harga'       => ['sometimes','integer','min:0'],
            'status'      => ['sometimes','string', Rule::in(['available','occupied','maintenance'])],
            'fasilitas'   => ['nullable','string'],
        ]);

        $room->update($data);
        return response()->json($room);
    }

    /**
     * DELETE /api/admin/rooms/{room}
     */
    public function destroy(Room $room)
    {
        $room->delete();
        return response()->json(null, 204);
    }

    /**
     * (Opsional) PATCH /api/admin/rooms/{room}/status
     * payload: { "status": "available|occupied|maintenance" }
     */
    public function updateStatus(Request $request, Room $room)
    {
        $data = $request->validate([
            'status' => ['required','string', Rule::in(['available','occupied','maintenance'])],
        ]);

        $room->update(['status' => $data['status']]);
        return response()->json($room);
    }
}
