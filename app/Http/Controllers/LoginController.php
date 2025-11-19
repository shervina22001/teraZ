<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function show()
    {
        return Inertia::render('LoginPage');
    }   

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'name' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Username atau password salah'
                ], 401);
            }
            return back()->withErrors([
                'username' => 'Username atau password salah'
            ])->onlyInput('username');
        }

        $request->session()->regenerate();

        $user = Auth::user();
        $role = strtolower($user->role);
        
        // Tentukan redirect berdasarkan role
        $next = match($role) {
            'admin' => route('admin.dashboard'),
            'user' => route('profile'),
            default => route('profile'),
        };

        // Untuk request JSON (dari frontend React/Inertia)
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Login berhasil',
                'next' => $next,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'phone' => $user->phone,
                    'role' => $user->role,
                ],
            ], 200);
        }

        // Untuk form submit biasa
        return redirect($next);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/');
    }
    
    public function username()
    {
        return 'name'; // Force Laravel to use the name column for login
    }

}