<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Payment;

class PaymentController extends Controller
{
    /**
     * GET /api/payments
     * Tenant melihat semua tagihan/pembayaran miliknya
     */
    public function index()
    {
        $tenantId = Auth::user()->id;

        // Ambil hanya payment milik tenant login
        $payments = Payment::where('tenant_id', $tenantId)
            ->orderBy('due_date', 'desc')
            ->get();

        return response()->json($payments);
    }

    /**
     * POST /api/payments
     * Tenant membuat pembayaran / unggah bukti
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id'     => 'required|integer|exists:rooms,id',
            'amount'      => 'required|numeric|min:0',
            'method'      => 'required|string',
            'proof_path'  => 'nullable|string', // bisa diubah ke file upload
            'note'        => 'nullable|string',
        ]);

        $tenantId = Auth::user()->id;

        $payment = Payment::create([
            'tenant_id'   => $tenantId,
            'room_id'     => $validated['room_id'],
            'period_year' => date('Y'),
            'period_month'=> date('m'),
            'due_date'    => now()->endOfMonth(),
            'amount'      => $validated['amount'],
            'method'      => $validated['method'],
            'proof_path'  => $validated['proof_path'] ?? null,
            'note'        => $validated['note'] ?? null,
            'status'      => 'pending',
        ]);

        return response()->json([
            'message' => 'Pembayaran berhasil dibuat, menunggu konfirmasi admin',
            'payment' => $payment
        ], 201);
    }
}
