<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoomController; // Add this for room management page
use App\Http\Controllers\PaymentAdminController;
use App\Http\Controllers\PaymentTenantController;
use App\Http\Controllers\RentalExtensionController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\MaintenanceAdminController;
use App\Http\Controllers\MaintenanceController;

// Landing Page
Route::get('/', fn () => Inertia::render('LandingPage'))->name('landing');

// =============================
// Auth Routes (guest only)
// =============================
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'show'])->name('login'); // Rename to standard 'login' name
    Route::post('/login', [LoginController::class, 'login'])->name('login.submit');
});

// Logout (requires auth)
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth')->name('logout');

// =============================
// User Area (login required, role: tenant)
// =============================
Route::middleware(['auth', 'role:tenant'])->group(function () {
    Route::get('/profile', [UserController::class, 'profile'])->name('profile');

    Route::get('/lapor-kerusakan', [MaintenanceController::class, 'index'])->name('maintenance.index');
    Route::post('/lapor-kerusakan', [MaintenanceController::class, 'store'])->name('maintenance.store');
    
    Route::get('/pembayaran', [PaymentTenantController::class, 'index'])->name('tenant.pembayaran');
    Route::post('/pembayaran/confirm', [PaymentTenantController::class, 'confirm'])->name('tenant.pembayaran.confirm');
});

// =============================
// Admin Area (login required, role: admin)
// =============================
Route::prefix('admin')->middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/dashboard', [UserController::class, 'adminDashboard'])->name('admin.dashboard');
    
    // Room Management Routes
    Route::get('/rooms', [RoomController::class, 'index'])->name('admin.rooms.index');
    Route::post('/rooms', [RoomController::class, 'store'])->name('admin.rooms.store');
    Route::get('/rooms/{room}', [RoomController::class, 'show'])->name('admin.rooms.show');
    Route::patch('/rooms/{room}', [RoomController::class, 'update'])->name('admin.rooms.update');
    Route::delete('/rooms/{room}', [RoomController::class, 'destroy'])->name('admin.rooms.destroy');
    Route::patch('/rooms/{room}/status', [RoomController::class, 'updateStatus'])->name('admin.rooms.updateStatus');

    // Tenant Management Routes
    Route::get('/tenants', [TenantController::class, 'index'])->name('admin.tenants.index');
    Route::post('/tenants', [TenantController::class, 'store'])->name('admin.tenants.store');
    Route::get('/tenants/{tenant}', [TenantController::class, 'show'])->name('admin.tenants.show');
    Route::patch('/tenants/{tenant}', [TenantController::class, 'update'])->name('admin.tenants.update');
    Route::delete('/tenants/{tenant}', [TenantController::class, 'destroy'])->name('admin.tenants.destroy');

    // Payment Management Routes
    Route::get('/keuangan', [PaymentAdminController::class, 'index'])->name('admin.payments.index');
    Route::post('/payments/generate', [PaymentAdminController::class, 'generateMonthlyPayments'])->name('admin.payments.generate');
    Route::post('/payments/{payment}/approve', [PaymentAdminController::class, 'approvePayment'])->name('admin.payments.approve');
    Route::post('/payments/{payment}/reject', [PaymentAdminController::class, 'rejectPayment'])->name('admin.payments.reject');

    // Rental Extension & Termination Routes
    Route::get('/extensions', [RentalExtensionController::class, 'index'])->name('admin.extensions.index');
    Route::post('/extensions', [RentalExtensionController::class, 'store'])->name('admin.extensions.store');
    Route::post('/extensions/{extension}/approve', [RentalExtensionController::class, 'approve'])->name('admin.extensions.approve');
    Route::post('/extensions/{extension}/reject', [RentalExtensionController::class, 'reject'])->name('admin.extensions.reject');
    Route::post('/tenants/{tenant}/terminate', [RentalExtensionController::class, 'terminate'])->name('admin.tenants.terminate');

    // Maintenance Management Routes
    Route::get('/maintenance', [MaintenanceAdminController::class, 'index'])->name('admin.maintenance.index');
    Route::post('/maintenance', [MaintenanceAdminController::class, 'store'])->name('admin.maintenance.store');
    Route::patch('/maintenance/{maintenance}', [MaintenanceAdminController::class, 'update'])->name('admin.maintenance.update');
    Route::delete('/maintenance/{maintenance}', [MaintenanceAdminController::class, 'destroy'])->name('admin.maintenance.destroy');

});
