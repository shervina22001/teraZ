<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    // READ: Get all rooms
    public function index()
    {
        return response()->json(Room::all(), 200);
    }

    // CREATE
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_number' => 'required|string|max:10|unique:rooms',
            'room_type' => 'required|string|max:50',
            'price' => 'required|numeric',
            'facilities' => 'nullable|string',
            'status' => 'in:available,occupied,maintenance',
            'description' => 'nullable|string'
        ]);

        $room = Room::create($validated);
        return response()->json($room, 201);
    }

    // READ: by ID
    public function show($id)
    {
        $room = Room::findOrFail($id);
        return response()->json($room, 200);
    }

    // UPDATE
    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);
        $room->update($request->all());
        return response()->json($room, 200);
    }

    // DELETE
    public function destroy($id)
    {
        $room = Room::findOrFail($id);
        $room->delete();
        return response()->json(['message' => 'Room deleted successfully'], 200);
    }
}
