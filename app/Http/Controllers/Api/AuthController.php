<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * 🔹 Login pakai username & password
     */
    public function login(Request $request)
    {
        // Validasi input
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        // Cari user berdasarkan username
        $user = User::where('username', $credentials['username'])->first();

        // Cek user
        if (!$user) {
            return response()->json([
                'message' => 'Username tidak ditemukan',
            ], 404);
        }

        // Cek password
        if (!Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Password salah',
            ], 401);
        }

        // Hapus token lama (opsional agar 1 user hanya punya 1 sesi login)
        $user->tokens()->delete();

        // Buat token baru untuk Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ]
        ], 200);
    }

    /**
     * 🔹 Logout user (hapus token aktif)
     */
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logout berhasil',
        ], 200);
    }

    /**
     * 🔹 Ambil profil user yang sedang login
     */
    public function profile(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Token tidak valid atau pengguna tidak ditemukan',
            ], 401);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ]
        ], 200);
    }
}
