<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing Page
Route::get('/', function () {
    return Inertia::render('LandingPage');
})->name('landing');

// Halaman Login
Route::get('/login', function () {
    return Inertia::render('LoginPage');
})->name('login');

// Halaman Profil Pengguna
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
})->name('profile');

// Lapor Kerusakan
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
})->name('maintenance.index');

// Simpan laporan kerusakan
Route::post('/lapor-kerusakan', function () {
    return redirect()->back()->with('success', 'Laporan berhasil dikirim');
})->name('maintenance.store');

// Pembayaran
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

// Konfirmasi Pembayaran
Route::post('/pembayaran/confirm', function () {
    $validated = request()->validate([
        'payment_id' => 'required|integer',
        'payment_method' => 'required|string|in:transfer,cash,ewallet',
        'payment_proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
    ]);

    try {
        if (request()->hasFile('payment_proof')) {
            $file = request()->file('payment_proof');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('payment_proofs', $filename, 'public');


            return redirect()->route('pembayaran.index')
                ->with('success', 'Pembayaran berhasil dikonfirmasi dan sedang diverifikasi');

        }

        return redirect()->back()->with('error', 'Gagal mengupload bukti pembayaran');
    } catch (\Exception $e) {
        return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
    }
})->name('pembayaran.confirm');

Route::get('/admin/dashboard', function () {
    return Inertia::render('admin/DashboardAdminPage', [
        'user' => [
            'id' => 1,
            'name' => 'Admin',
        ],
    ]);
});

Route::get('/admin/kelola-kamar', function () {
    return Inertia::render('admin/KelolaKamarAdminPage', [
        'user' => [
            'id' => 1,
            'name' => 'Admin',
        ],
    ]);
})->name('admin.kelola-kamar');

Route::get('/admin/penghuni', function () {
    return Inertia::render('admin/ManajemenPenghuniAdminPage', [
        'user' => [
            'id' => 1,
            'name' => 'Admin',
        ],
    ]);
})->name('admin.penghuni');

Route::get('/admin/maintenance', function () {
    return Inertia::render('admin/MaintenanceAdminPage', [
        'user' => [
            'id' => 1,
            'name' => 'Admin',
        ],
    ]);
})->name('admin.maintenance');

Route::get('/admin/keuangan', function () {
    return Inertia::render('admin/KeuanganAdminPage', [
        'user' => [
            'id' => 1,
            'name' => 'Admin',
        ],
        'statistics' => [
            'total_pendapatan' => 850000,
            'pembayaran_tertunda' => 1850000,
            'total_pengeluaran' => 500000,
            'keuntungan_bersih' => 350000,
        ],
        'pemasukan' => [
            [
                'id' => 1,
                'kamar' => 'Kamar 01',
                'kategori' => 'Sewa bulan Juli 2025',
                'tanggal' => '12/7/2025',
                'jumlah' => 850000,
            ],
            [
                'id' => 2,
                'kamar' => 'Kamar 04',
                'kategori' => 'Sewa bulan Juli 2025',
                'tanggal' => '12/6/2025',
                'jumlah' => 1000000,
            ],
        ],
        'pengeluaran' => [
            [
                'id' => 1,
                'judul' => 'Perbaikan AC unit 01',
                'kategori' => 'Maintenance',
                'tanggal' => '2/7/2025',
                'jumlah' => 500000,
                'status' => 'Perbaikan',
            ],
            [
                'id' => 2,
                'judul' => 'Tagihan air bulanan',
                'kategori' => 'Utilities',
                'tanggal' => '15/6/2025',
                'jumlah' => 500000,
                'status' => 'Perbaikan',
            ],
        ],
        'pending' => [
            [
                'id' => 1,
                'kamar' => 'Kamar 02',
                'periode' => 'Sewa bulan Agustus 2025',
                'jatuh_tempo' => '15/8/2025',
                'jumlah' => 850000,
            ],
            [
                'id' => 2,
                'kamar' => 'Kamar 04',
                'periode' => 'Sewa bulan Agustus 2025',
                'jatuh_tempo' => '15/8/2025',
                'jumlah' => 1000000,
            ],
        ],
    ]);
})->name('admin.keuangan');