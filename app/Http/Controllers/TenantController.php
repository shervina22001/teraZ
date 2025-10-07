<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    public function index()
    {
        return response()->json(Tenant::all(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'room_id' => 'nullable|exists:rooms,id',
            'identity_number' => 'required|string|max:20|unique:tenants',
            'emergency_contact' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:20',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'deposit' => 'nullable|numeric|min:0',
            'status' => 'in:active,expired,terminated'
        ]);

        $tenant = Tenant::create($validated);
        return response()->json($tenant, 201);
    }

    public function show($id)
    {
        $tenant = Tenant::findOrFail($id);
        return response()->json($tenant, 200);
    }

    public function update(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->update($request->all());
        return response()->json($tenant, 200);
    }

    public function destroy($id)
    {
        Tenant::findOrFail($id)->delete();
        return response()->json(['message' => 'Tenant deleted successfully'], 200);
    }
}
