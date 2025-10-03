<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('LandingPage');
});

Route::get('/login', function () {
    return Inertia::render('LoginPage');
});

Route::get('/profile', function () {
    return Inertia::render('user/ProfilePage', [
        'user' => [
            'id' => 1,
            'name' => 'Shervina Ananda',
            'email' => 'shervinaa@gmail.com',
            'phone' => '081223345678',
            'photo' => null,
        ],
        'room' => [
            'number' => '01',
            'type' => 'Single Room',
            'monthly_rent' => 850000,
        ],
        'contract' => [
            'start_date' => '2025-09-01',
            'end_date' => '2025-12-01',
            'duration_months' => 3,
        ],
    ]);
});