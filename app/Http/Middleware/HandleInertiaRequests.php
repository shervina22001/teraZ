<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $quoteParts = Str::of(Inspiring::quotes()->random())->explode('-');
        $message = trim($quoteParts[0] ?? '');
        $author = trim($quoteParts[1] ?? 'Unknown');

        $user = Auth::user();

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'quote' => [
                'message' => $message,
                'author' => $author,
            ],
            'auth' => [
                'user' => Auth::user() ? [
                    'id' => Auth::user()->id,
                    'name' => Auth::user()->name,
                    'email' => Auth::user()->email,
                    'username' => Auth::user()->username,
                    'role' => Auth::user()->role ?? 'user',
                    ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ]);
    }
}
