<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Login pakai username + password
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt(['username' => $request->username, 'password' => $request->password])) {
            return response()->json([
                'message' => 'Login gagal, periksa username/password'
            ], 401);
        }   


        $user = User::where('username', $request->username)->first();

        // hanya admin yang boleh login
        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Akun ini tidak diizinkan login'
            ], 403);
        }

        // buat token sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login sukses',
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Logout -> hapus semua token user
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }

    /**
     * Ambil profile user
     */
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }
}
