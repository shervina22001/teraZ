<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        return response()->json(Notification::all(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|string|max:50',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'is_read' => 'boolean',
            'data' => 'nullable|json'
        ]);

        $notif = Notification::create($validated);
        return response()->json($notif, 201);
    }

    public function show($id)
    {
        return response()->json(Notification::findOrFail($id), 200);
    }

    public function update(Request $request, $id)
    {
        $notif = Notification::findOrFail($id);
        $notif->update($request->all());
        return response()->json($notif, 200);
    }

    public function destroy($id)
    {
        Notification::findOrFail($id)->delete();
        return response()->json(['message' => 'Notification deleted successfully'], 200);
    }
}
