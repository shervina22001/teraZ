<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
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
            $s = $request->string('q');
            $q->where(function ($w) use ($s) {
                $w->where('nomor_kamar', 'ilike', "%{$s}%")
                  ->orWhere('tipe', 'ilike', "%{$s}%")
                  ->orWhere('fasilitas', 'ilike', "%{$s}%");
            });
        }

        // $with sudah di model, jadi tenants & maintenanceRequests ikut otomatis
        return $q->latest()->paginate((int)$request->get('per_page', 15));
    }

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

    public function show(Room $room)
    {
        // relasi sudah eager via $with; tapi boleh explicit:
        $room->loadMissing(['tenants','maintenanceRequests']);
        return $room;
    }

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

    public function destroy(Room $room)
    {
        $room->delete();
        return response()->json(null, 204);
    }
}
