<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoomController; // Add this for room management page

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
});

// =============================
// Admin Area (login required, role: admin)
// =============================
Route::prefix('admin')->middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/dashboard', [UserController::class, 'adminDashboard'])->name('admin.dashboard');
    
    // Add room management page route here
    Route::get('/rooms', [RoomController::class, 'index'])->name('admin.rooms.index');
    Route::patch('rooms/{room}/status', [RoomController::class, 'updateStatus']); 
    Route::get('/rooms/{room}', [RoomController::class, 'show']);
});
