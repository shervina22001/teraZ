<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use App\Models\Tenant;
use App\Models\Payment;
use Illuminate\Support\Carbon;

class AppServiceProvider extends ServiceProvider
{
    public function register() {}

    public function boot()
    {
        /*
        |--------------------------------------------------------------------------
        | Pending Payments (Belum Dibayar)
        |--------------------------------------------------------------------------
        */

        Inertia::share('unpaidCount', function () {
            if (!auth()->check()) return 0;

            $tenant = Tenant::where('user_id', auth()->id())->first();
            if (!$tenant) return 0;

            return Payment::where('tenant_id', $tenant->id)
                ->where('status', 'pending')
                ->count();
        });

        Inertia::share('unpaidMonths', function () {
            if (!auth()->check()) return [];

            $tenant = Tenant::where('user_id', auth()->id())->first();
            if (!$tenant) return [];

            return Payment::where('tenant_id', $tenant->id)
                ->where('status', 'pending')
                ->get()
                ->groupBy(fn($p) => sprintf('%04d-%02d', $p->period_year, $p->period_month))
                ->map(function ($items, $month) {
                    return [
                        'month'     => $month,
                        'monthName' => Carbon::parse($month . '-01')->translatedFormat('F Y'),
                        'total'     => $items->sum('amount'),
                    ];
                })
                ->values();
        });

        /*
        |--------------------------------------------------------------------------
        | Rejected Payments (Pembayaran Ditolak)
        |--------------------------------------------------------------------------
        */
        Inertia::share('rejectedPayments', function () {
            if (!auth()->check()) return [];

            $tenant = Tenant::where('user_id', auth()->id())->first();
            if (!$tenant) return [];

            return Payment::where('tenant_id', $tenant->id)
                ->where('status', 'rejected')
                ->orderBy('period_year')
                ->orderBy('period_month')
                ->get()
                ->map(function ($p) {
                    $month = sprintf('%04d-%02d', $p->period_year, $p->period_month);
                    return [
                        'month'     => $month,
                        'monthName' => Carbon::parse($month . '-01')->translatedFormat('F Y'),
                        'reason'    => $p->notes ?? 'Tidak ada alasan.'
                    ];
                });
        });
    }
}
