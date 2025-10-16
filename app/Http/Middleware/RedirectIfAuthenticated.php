<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // ✅ tambahkan ini

class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, ...$guards)
    {
        // gunakan facade Auth biar IDE paham tipenya
        if (Auth::check()) {
            return redirect(RouteServiceProvider::HOME);
        }

        return $next($request);
    }
}
