<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\MaintenanceRequestController;

use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\RoomAdminController;
use App\Http\Controllers\Api\Admin\TenantAdminController;
use App\Http\Controllers\Api\Admin\PaymentAdminController;
use App\Http\Controllers\LoginController;

use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes (Sanctum)
|--------------------------------------------------------------------------
| Catatan:
| - Public:      /login
| - Protected:   semua di dalam group auth:sanctum
| - Role Tenant: group anyrole:tenant
| - Role Admin:  prefix /admin + anyrole:admin,owner
*/

// ---------- Public (tanpa auth)
Route::post('/login', [AuthController::class, 'LoginPage']);

// ---------- Protected (butuh token Sanctum)
Route::middleware('auth:sanctum')->group(function () {

    // Profil (JSON) & logout
    // Pilih salah satu endpoint profil. Di sini kita pakai UserController@me
    // Route::get('/profile', [UserController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);



    // ---------- Tenant (role: tenant)
    Route::middleware('anyrole:tenant')->group(function () {
        // Payments milik tenant sendiri
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::post('/payments', [PaymentController::class, 'store']);

        // Maintenance milik tenant sendiri
        Route::get('/maintenances', [MaintenanceRequestController::class, 'index']);
        Route::post('/maintenances', [MaintenanceRequestController::class, 'store']);
    });

    // ---------- Admin/Owner (role: admin atau owner) di prefix /admin
    Route::prefix('admin')->middleware('anyrole:admin,owner')->group(function () {

        // Dashboard & generate payments
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::post('/payments/generate', [PaymentAdminController::class, 'generate']);

        // Kelola rooms (admin-only)
        Route::apiResource('rooms', RoomAdminController::class);
        Route::apiResource('rooms', AdminRoomPageController::class);

        // Kelola tenants
        Route::apiResource('tenants', TenantAdminController::class)->except(['create', 'edit']);
        Route::post('/tenants/{tenant}/checkout', [TenantAdminController::class, 'checkout']);

        // Lihat semua payments & maintenance (versi admin)
        Route::get('/payments', [PaymentController::class, 'adminIndex']);
        Route::get('/maintenances', [MaintenanceRequestController::class, 'adminIndex']);

        // Health check sederhana
        Route::get('/ping', fn () => response()->json(['ok' => true, 'ts' => now()]));
    });

});
