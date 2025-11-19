<?php

use Illuminate\Support\Facades\Route;
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
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('LandingPage'))->name('landing');

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'show'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])->name('login.submit');
});

Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth')->name('logout');

Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);
    if (!file_exists($fullPath)) {
        abort(404);
    }
    return response()->file($fullPath, [
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma' => 'no-cache',
        'Expires' => '0'
    ]);
})->where('path', '.*')->name('storage');

Route::middleware(['auth', 'role:tenant'])->group(function () {
    Route::get('/profile', [UserController::class, 'profile'])->name('profile');
    Route::post('/profile/update-photo', [UserController::class, 'updateProfilePhoto'])->name('profile.updatePhoto');
    Route::get('/lapor-kerusakan', [MaintenanceController::class, 'index'])->name('maintenance.index');
    Route::post('/lapor-kerusakan', [MaintenanceController::class, 'store'])->name('maintenance.store');
    Route::get('/pembayaran', [PaymentController::class, 'index'])->name('tenant.pembayaran');
    Route::post('/pembayaran/confirm', [PaymentController::class, 'confirm'])->name('tenant.pembayaran.confirm');
});

Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/dashboard', [DashboardAdminController::class, 'index'])->name('dashboard');
    
    Route::get('/rooms', [RoomController::class, 'index'])->name('rooms.index');
    Route::post('/rooms', [RoomController::class, 'store'])->name('rooms.store');
    Route::get('/rooms/{room}', [RoomController::class, 'show'])->name('rooms.show');
    Route::patch('/rooms/{room}', [RoomController::class, 'update'])->name('rooms.update');
    Route::delete('/rooms/{room}', [RoomController::class, 'destroy'])->name('rooms.destroy');
    Route::patch('/rooms/{room}/status', [RoomController::class, 'updateStatus'])->name('rooms.updateStatus');

    Route::get('/tenants', [TenantController::class, 'index'])->name('tenants.index');
    Route::post('/tenants', [TenantController::class, 'store'])->name('tenants.store');
    Route::get('/tenants/{tenant}', [TenantController::class, 'show'])->name('tenants.show');
    Route::patch('/tenants/{tenant}', [TenantController::class, 'update'])->name('tenants.update');
    Route::delete('/tenants/{tenant}', [TenantController::class, 'destroy'])->name('tenants.destroy');

    Route::get('/keuangan', [PaymentAdminController::class, 'index'])->name('payments.index');
    Route::post('/payments', [PaymentAdminController::class, 'store'])->name('payments.store');
    Route::post('/payments/generate', [PaymentAdminController::class, 'generateMonthlyPayments'])->name('payments.generate');
    Route::post('/payments/{payment}/approve', [PaymentAdminController::class, 'approvePayment'])->name('payments.approve');
    Route::post('/payments/{payment}/reject', [PaymentAdminController::class, 'rejectPayment'])->name('payments.reject');
    Route::delete('/payments/{payment}', [PaymentAdminController::class, 'destroy'])->name('payments.destroy');

    Route::get('/extensions', [RentalExtensionController::class, 'index'])->name('extensions.index');
    Route::post('/extensions', [RentalExtensionController::class, 'store'])->name('extensions.store');
    Route::post('/extensions/{extension}/approve', [RentalExtensionController::class, 'approve'])->name('extensions.approve');
    Route::post('/extensions/{extension}/reject', [RentalExtensionController::class, 'reject'])->name('extensions.reject');
    Route::post('/tenants/{tenant}/terminate', [RentalExtensionController::class, 'terminate'])->name('tenants.terminate');

    Route::get('/maintenance', [MaintenanceAdminController::class, 'index'])->name('maintenance.index');
    Route::post('/maintenance', [MaintenanceAdminController::class, 'store'])->name('maintenance.store');
    Route::patch('/maintenance/{maintenance}', [MaintenanceAdminController::class, 'update'])->name('maintenance.update');
    Route::delete('/maintenance/{maintenance}', [MaintenanceAdminController::class, 'destroy'])->name('maintenance.destroy');

    // TEST ROUTE - DIRECT CLOSURE
Route::post('/admin/payments/{payment}/test-approve', function(\App\Models\Payment $payment) {
    \Log::info('TEST APPROVE CALLED', ['payment_id' => $payment->id, 'status' => $payment->status]);
    
    if ($payment->status !== 'paid') {
        \Log::warning('Status bukan paid', ['status' => $payment->status]);
        return redirect('/admin/keuangan')->with('error', 'Status harus Menunggu Konfirmasi');
    }
    
    $before = \DB::table('payments')->where('id', $payment->id)->first();
    \Log::info('BEFORE UPDATE', ['status' => $before->status]);
    
    \DB::table('payments')->where('id', $payment->id)->update(['status' => 'confirmed', 'updated_at' => now()]);
    
    $after = \DB::table('payments')->where('id', $payment->id)->first();
    \Log::info('AFTER UPDATE', ['status' => $after->status]);
    
    return redirect('/admin/keuangan')->with('success', 'Test approve berhasil!');
})->middleware(['auth', 'role:admin']);
});