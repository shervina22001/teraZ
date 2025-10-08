<?php

namespace App\Http\Controllers;

use App\Models\RentalExtension;
use Illuminate\Http\Request;

class RentalExtensionController extends Controller
{
    public function index()
    {
        return response()->json(RentalExtension::all(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'old_end_date' => 'required|date',
            'new_end_date' => 'required|date|after:old_end_date',
            'extension_fee' => 'nullable|numeric|min:0',
            'status' => 'in:pending,approved,rejected',
            'notes' => 'nullable|string'
        ]);

        $extension = RentalExtension::create($validated);
        return response()->json($extension, 201);
    }

    public function show($id)
    {
        return response()->json(RentalExtension::findOrFail($id), 200);
    }

    public function update(Request $request, $id)
    {
        $extension = RentalExtension::findOrFail($id);
        $extension->update($request->all());
        return response()->json($extension, 200);
    }

    public function destroy($id)
    {
        RentalExtension::findOrFail($id)->delete();
        return response()->json(['message' => 'Rental extension deleted successfully'], 200);
    }
}
