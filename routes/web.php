<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {

    return response()->json(['message' => 'Laravel API running 🚀']);

    return Inertia::render('LandingPage');
});

Route::get('/login', function () {
    return Inertia::render('LoginPage');
})->name('login');

