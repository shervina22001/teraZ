<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Payment;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentTenantController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // ambil tenant
        $tenant = Tenant::where('user_id', $user->id)->first();

        if (!$tenant) {
            return redirect()->route('dashboard')->with('error', 'Data tenant tidak ditemukan.');
        }

        // ambil daftar pembayaran milik tenant
        $payments = Payment::where('tenant_id', $tenant->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'title' => $payment->judul ?? 'Pembayaran Bulanan',
                    'amount' => $payment->amount ?? 0,
                    'due_date' => $payment->due_date?->format('Y-m-d'),
                    'paid_date' => $payment->paid_at?->format('Y-m-d'),
                    'status' => match ($payment->status) {
                        'paid' => 'Lunas',
                        'overdue' => 'Terlambat',
                        default => 'Belum Dibayar',
                    },
                ];
            });

        return Inertia::render('user/PembayaranPage', [
            'user' => $user,
            'payments' => $payments,
        ]);
    }

    public function confirm(Request $request)
    {
        $request->validate([
            'payment_id' => 'required|integer',
            'payment_method' => 'required|string|max:50',
        ]);

        $payment = Payment::findOrFail($request->payment_id);
        $payment->update([
            'status' => 'paid',
            'method' => $request->payment_method,
            'paid_at' => now(),
        ]);

        return back()->with('success', 'Pembayaran berhasil dikonfirmasi.');
    }
}
