<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Tenant;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
{
    $user   = $request->user();
    $tenant = \App\Models\Tenant::where('user_id', $user->id)->firstOrFail();

    // order: terbaru dulu
    return \App\Models\Payment::where('tenant_id', $tenant->id)
        ->orderByDesc('period_year')
        ->orderByDesc('period_month')
        ->paginate((int)$request->get('per_page', 15));
}

    public function pay(Request $request, \App\Models\Payment $payment)
    {
        $user   = $request->user();
        $tenant = \App\Models\Tenant::where('user_id', $user->id)->firstOrFail();

        // pastikan ini tagihan milik tenant yang login
        if ($payment->tenant_id !== $tenant->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($payment->status === 'paid') {
            return response()->json(['message' => 'Sudah lunas'], 422);
        }

        $data = $request->validate([
            'method'    => ['required','string','max:50'], // transfer/qris/cash
            'reference' => ['nullable','string','max:100'],
            'note'      => ['nullable','string'],
        ]);

        $payment->update([
            'status'   => 'paid',
            'method'   => $data['method'],
            'reference'=> $data['reference'] ?? null,
            'note'     => $data['note'] ?? null,
            'paid_at'  => now(),
        ]);

        return response()->json($payment->fresh());
    }

}
