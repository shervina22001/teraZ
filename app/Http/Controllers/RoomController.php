<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomController extends Controller
{
    // READ: Show all rooms page with Inertia
    public function index()
    {
        $rooms = Room::all();
        return Inertia::render('admin/KelolaKamarAdminPage', [
            'rooms' => $rooms,
        ]);
    }


    // CREATE: Show create room form
    public function create()
    {
        return Inertia::render('Rooms/Create');
    }

    // STORE: Handle room creation form submit
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_number' => 'required|string|max:10|unique:rooms',
            'room_type' => 'required|string|max:50',
            'price' => 'required|numeric',
            'facilities' => 'nullable|string',
            'status' => 'required|in:available,occupied,maintenance',
            'description' => 'nullable|string',
        ]);

        Room::create($validated);

        return redirect()->route('rooms.index')->with('success', 'Room created successfully.');
    }

    // READ: Show single room page
    public function show($id)
    {
        $room = Room::findOrFail($id);
        return Inertia::render('Rooms/Show', [
            'room' => $room,
        ]);
    }

    // EDIT: Show edit room form
    public function edit($id)
    {
        $room = Room::findOrFail($id);
        return Inertia::render('Rooms/Edit', [
            'room' => $room,
        ]);
    }

    // UPDATE: Handle room update form submit
    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'room_number' => 'required|string|max:10|unique:rooms,room_number,' . $room->id,
            'room_type' => 'required|string|max:50',
            'price' => 'required|numeric',
            'facilities' => 'nullable|string',
            'status' => 'required|in:available,occupied,maintenance',
            'description' => 'nullable|string',
        ]);

        $room->update($validated);

        return redirect()->route('rooms.index')->with('success', 'Room updated successfully.');
    }

    // DELETE
    public function destroy($id)
    {
        $room = Room::findOrFail($id);
        $room->delete();
        return redirect()->route('rooms.index')->with('success', 'Room deleted successfully.');
    }
}
