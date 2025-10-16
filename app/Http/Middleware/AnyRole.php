<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AnyRole
{
    /**
     * roles dipisah koma: anyrole:admin,owner
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (! $user) {
            abort(401); // belum login
        }

        // normalisasi, hilangkan spasi dll
        $roles = collect($roles)
            ->flatMap(fn ($r) => explode(',', $r))
            ->map(fn ($r) => trim($r))
            ->filter();

        if ($roles->contains($user->role)) {
            return $next($request);
        }

        abort(403, 'Anda tidak punya akses untuk role ini.');
    }
}
