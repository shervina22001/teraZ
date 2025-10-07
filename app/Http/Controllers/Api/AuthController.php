<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Login pakai username + password
     */
    public function login(Request $request)
    {
        // validasi input
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // cari user berdasarkan username
        $user = User::where('username', $request->username)->first();

        // cek user ada atau tidak
        if (!$user) {
            return response()->json([
                'message' => 'Username tidak ditemukan',
            ], 404);
        }

        // cek password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Password salah',
            ], 401);
        }

        // (opsional) cek role kalau memang mau dibatasi
        // kalau semua role boleh login, hapus bagian ini
        /*
        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Akun ini tidak diizinkan login',
            ], 403);
        }
        */

        // login manual (tanpa session)
        // Auth::login($user);

        // buat token sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login sukses',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ], 200);
    }

    /**
     * Logout -> hapus semua token user
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => 'Logout berhasil',
        ], 200);
    }

    /**
     * Ambil profil user aktif
     */
    public function profile(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ], 200);
    }
}
