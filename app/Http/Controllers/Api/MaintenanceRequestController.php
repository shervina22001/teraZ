<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceRequest;
use App\Models\Tenant;
use Illuminate\Http\Request;

class MaintenanceRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $tenant = Tenant::where('user_id', $user->id)->firstOrFail();

        return MaintenanceRequest::where('tenant_id', $tenant->id)
            ->with('room')
            ->latest()
            ->paginate((int)$request->get('per_page', 15));
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $tenant = Tenant::where('user_id', $user->id)->firstOrFail();

        $data = $request->validate([
            'room_id'  => ['required','exists:rooms,id'],
            'judul'    => ['required','string','max:200'],
            'deskripsi'=> ['nullable','string'],
        ]);

        // opsional: validasi kamar harus milik kontrak tenant ini
        if ($tenant->room_id !== (int)$data['room_id']) {
            return response()->json(['message' => 'Room tidak sesuai dengan kontrak Anda'], 422);
        }

        $data['tenant_id'] = $tenant->id;
        $data['status']    = 'pending';
        $data['biaya']     = 0;

        $req = MaintenanceRequest::create($data);
        return response()->json($req->load('room'), 201);
    }

    // ADMIN: melihat semua maintenance
    public function adminIndex(Request $request)
    {
        return MaintenanceRequest::with(['room','tenant'])
            ->latest()
            ->paginate((int)$request->get('per_page', 20));
    }
}
