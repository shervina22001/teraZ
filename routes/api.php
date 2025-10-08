<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\MaintenanceRequestController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RentalExtensionController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
});

Route::apiResources([
    'users' => UserController::class,
    'rooms' => RoomController::class,
    'tenants' => TenantController::class,
    'payments' => PaymentController::class,
    'maintenance-requests' => MaintenanceRequestController::class,
    'notifications' => NotificationController::class,
    'rental-extensions' => RentalExtensionController::class,
]);
