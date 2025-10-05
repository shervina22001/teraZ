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

Route::get('/lapor-kerusakan', function () {
    return Inertia::render('user/MaintenancePage', [
        'user' => [
            'id' => 1,
            'name' => 'Shervina',
            'email' => 'shervinaa@gmail.com',
            'phone' => '081223345678',
            'photo' => null,
        ],
        'reports' => [
            [
                'id' => 1,
                'title' => 'AC tidak dingin',
                'description' => 'AC di kamar sudah tidak dingin dan bocor sejak 3 hari yang lalu.',
                'reported_date' => '2025-09-19',
                'resolved_date' => null,
                'priority' => 'Tinggi',
                'status' => 'Sedang Proses',
            ],
            [
                'id' => 2,
                'title' => 'Keran air bocor',
                'description' => 'Keran air di kamar mandi bocor dan menetes terus.',
                'reported_date' => '2025-09-05',
                'resolved_date' => '2025-09-07',
                'priority' => 'Sedang',
                'status' => 'Selesai',
            ],
        ],
    ]);
});

Route::post('/lapor-kerusakan', function () {
    // Handle form submission
    // Validate and store the maintenance report
    
    return redirect()->back()->with('success', 'Laporan berhasil dikirim');    
});

Route::get('/pembayaran', function () {
    return Inertia::render('user/PembayaranPage', [
        'user' => [
            'id' => 1,
            'name' => 'Shervina',
            'email' => 'shervinaa@gmail.com',
            'phone' => '081223345678',
            'photo' => null,
        ],
        'payments' => [
            [
                'id' => 1,
                'title' => 'Sewa Bulan Agustus 2025',
                'amount' => 850000,
                'due_date' => '2025-08-15',
                'paid_date' => null,
                'status' => 'Terlambat',
            ],
            [
                'id' => 2,
                'title' => 'Sewa Bulan Juli 2025',
                'amount' => 850000,
                'due_date' => '2025-07-15',
                'paid_date' => '2025-07-12',
                'status' => 'Lunas',
            ],
            [
                'id' => 3,
                'title' => 'Sewa Bulan Juni 2025',
                'amount' => 850000,
                'due_date' => '2025-06-15',
                'paid_date' => '2025-06-12',
                'status' => 'Lunas',
            ],
        ],
    ]);
})->name('pembayaran.index');

Route::post('/pembayaran/confirm', function () {
    // Validate request
    $validated = request()->validate([
        'payment_id' => 'required|integer',
        'payment_method' => 'required|string|in:transfer,cash,ewallet',
        'payment_proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
    ]);

    try {
        // Handle file upload
        if (request()->hasFile('payment_proof')) {
            $file = request()->file('payment_proof');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('payment_proofs', $filename, 'public');
            
            // TODO: Store payment data to database
            // Example:
            // Payment::where('id', $validated['payment_id'])->update([
            //     'payment_method' => $validated['payment_method'],
            //     'payment_proof' => $path,
            //     'status' => 'Menunggu Verifikasi',
            //     'paid_date' => now(),
            // ]);
            
            return redirect()->route('pembayaran.index')->with('success', 'Pembayaran berhasil dikonfirmasi dan sedang diverifikasi');
        }

        return redirect()->back()->with('error', 'Gagal mengupload bukti pembayaran');
        
    } catch (\Exception $e) {
        return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
    }
})->name('pembayaran.confirm');