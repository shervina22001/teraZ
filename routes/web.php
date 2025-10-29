<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\PaymentAdminController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RentalExtensionController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\MaintenanceAdminController;
use App\Http\Controllers\DashboardAdminController;
use App\Http\Controllers\MaintenanceController;

// Landing Page
Route::get('/', fn () => Inertia::render('LandingPage'))->name('landing');

// =============================
// Auth Routes (guest only)
// =============================
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'show'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])->name('login.submit');
});

// Logout (requires auth)
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth')->name('logout');

// =============================
// User Area (login required, role: tenant)
// =============================
Route::middleware(['auth', 'role:tenant'])->group(function () {
    // Profile
    Route::get('/profile', [UserController::class, 'profile'])->name('profile');
    Route::post('/profile/update-photo', [UserController::class, 'updateProfilePhoto'])->name('profile.updatePhoto'); // Add this

    // Maintenance Reports (Tenant POV)
    Route::get('/lapor-kerusakan', [MaintenanceController::class, 'index'])->name('maintenance.index');
    Route::post('/lapor-kerusakan', [MaintenanceController::class, 'store'])->name('maintenance.store');
    
    // Payment (Tenant POV)
    Route::get('/pembayaran', [PaymentController::class, 'index'])->name('tenant.pembayaran');
    Route::post('/pembayaran/confirm', [PaymentController::class, 'confirm'])->name('tenant.pembayaran.confirm');
});

// =============================
// Admin Area (login required, role: admin)
// =============================
Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardAdminController::class, 'index'])->name('dashboard');
    
    // Room Management
    Route::get('/rooms', [RoomController::class, 'index'])->name('rooms.index');
    Route::post('/rooms', [RoomController::class, 'store'])->name('rooms.store');
    Route::get('/rooms/{room}', [RoomController::class, 'show'])->name('rooms.show');
    Route::patch('/rooms/{room}', [RoomController::class, 'update'])->name('rooms.update');
    Route::delete('/rooms/{room}', [RoomController::class, 'destroy'])->name('rooms.destroy');
    Route::patch('/rooms/{room}/status', [RoomController::class, 'updateStatus'])->name('rooms.updateStatus');

    // Tenant Management
    Route::get('/tenants', [TenantController::class, 'index'])->name('tenants.index');
    Route::post('/tenants', [TenantController::class, 'store'])->name('tenants.store');
    Route::get('/tenants/{tenant}', [TenantController::class, 'show'])->name('tenants.show');
    Route::patch('/tenants/{tenant}', [TenantController::class, 'update'])->name('tenants.update');
    Route::delete('/tenants/{tenant}', [TenantController::class, 'destroy'])->name('tenants.destroy');

    // Payment Management (Admin POV)
    Route::get('/keuangan', [PaymentAdminController::class, 'index'])->name('payments.index');
    Route::post('/payments', [PaymentAdminController::class, 'store'])->name('payments.store');
    Route::post('/payments/generate', [PaymentAdminController::class, 'generateMonthlyPayments'])->name('payments.generate');
    Route::post('/payments/{payment}/approve', [PaymentAdminController::class, 'approvePayment'])->name('payments.approve');
    Route::post('/payments/{payment}/reject', [PaymentAdminController::class, 'rejectPayment'])->name('payments.reject');
    Route::delete('/payments/{payment}', [PaymentAdminController::class, 'destroy'])->name('payments.destroy');

    // Rental Extension & Termination
    Route::get('/extensions', [RentalExtensionController::class, 'index'])->name('extensions.index');
    Route::post('/extensions', [RentalExtensionController::class, 'store'])->name('extensions.store');
    Route::post('/extensions/{extension}/approve', [RentalExtensionController::class, 'approve'])->name('extensions.approve');
    Route::post('/extensions/{extension}/reject', [RentalExtensionController::class, 'reject'])->name('extensions.reject');
    Route::post('/tenants/{tenant}/terminate', [RentalExtensionController::class, 'terminate'])->name('tenants.terminate');

    // Maintenance Management (Admin POV)
    Route::get('/maintenance', [MaintenanceAdminController::class, 'index'])->name('maintenance.index');
    Route::post('/maintenance', [MaintenanceAdminController::class, 'store'])->name('maintenance.store');
    Route::patch('/maintenance/{maintenance}', [MaintenanceAdminController::class, 'update'])->name('maintenance.update');
    Route::delete('/maintenance/{maintenance}', [MaintenanceAdminController::class, 'destroy'])->name('maintenance.destroy');
});
