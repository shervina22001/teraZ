<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia; // ← wajib
use Illuminate\Support\Facades\Auth; // ← wajib

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Bagikan user ke semua halaman Inertia
        Inertia::share([
            'auth.user' => fn () => Auth::user() ? [
                'id' => Auth::user()->id,
                'name' => Auth::user()->name,
                'role' => strtolower(Auth::user()->role ?? ''),
            ] : null,
        ]);
    }
}
