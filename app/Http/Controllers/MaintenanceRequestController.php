<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceRequest;
use Illuminate\Http\Request;

class MaintenanceRequestController extends Controller
{
    public function index()
    {
        return response()->json(MaintenanceRequest::all(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'room_id' => 'required|exists:rooms,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'in:low,medium,high,urgent',
            'status' => 'in:pending,in_progress,completed,cancelled',
            'notes' => 'nullable|string'
        ]);

        $req = MaintenanceRequest::create($validated);
        return response()->json($req, 201);
    }

    public function show($id)
    {
        return response()->json(MaintenanceRequest::findOrFail($id), 200);
    }

    public function update(Request $request, $id)
    {
        $req = MaintenanceRequest::findOrFail($id);
        $req->update($request->all());
        return response()->json($req, 200);
    }

    public function destroy($id)
    {
        MaintenanceRequest::findOrFail($id)->delete();
        return response()->json(['message' => 'Maintenance request deleted successfully'], 200);
    }
}
