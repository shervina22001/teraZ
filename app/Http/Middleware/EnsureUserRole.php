<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role  Role yang diizinkan (admin, user, dll)
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Cek apakah user sudah login
        if (!$request->user()) {
            return redirect()->route('login')->with('error', 'Anda harus login terlebih dahulu');
        }

        // Cek role user (case-insensitive)
        if (strtolower($request->user()->role) !== strtolower($role)) {
            // Jika bukan role yang sesuai, redirect atau abort
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Unauthorized. Anda tidak memiliki akses ke halaman ini.'
                ], 403);
            }
            
            abort(403, 'Unauthorized action. Anda tidak memiliki akses ke halaman ini.');
        }

        return $next($request);
    }
}