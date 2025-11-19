<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Tenant;
use App\Models\Room;

class PaymentAdminController extends Controller
{
    /**
     * Generate tagihan pembayaran untuk tenant pada bulan tertentu
     * hanya dipanggil oleh admin/owner.
     */
    public function generate(Request $request)
    {
        $data = $request->validate([
            'tenant_id'    => ['required','exists:tenants,id'],
            'room_id'      => ['required','exists:rooms,id'],
            'period_year'  => ['required','integer','min:2000','max:2100'],
            'period_month' => ['required','integer','between:1,12'],
            'due_date'     => ['required','date'],
            'amount'       => ['required','integer','min:0'],
            'notes'         => ['nullable','string'],
        ]);

        // pastikan room_id sesuai dengan room yang memang ditempati tenant
        $tenant = Tenant::findOrFail($data['tenant_id']);
        if ($tenant->room_id !== (int)$data['room_id']) {
            return response()->json([
                'message' => 'Room yang dipilih tidak sesuai dengan kontrak tenant ini'
            ], 422);
        }

        // cek duplikat: tenant_id + period_year + period_month
        $exists = Payment::where('tenant_id', $data['tenant_id'])
            ->where('period_year', $data['period_year'])
            ->where('period_month', $data['period_month'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Tagihan bulan tersebut sudah ada'
            ], 422);
        }

        $payment = Payment::create([
            'tenant_id'    => $data['tenant_id'],
            //'room_id'      => $data['room_id'],
            'period_year'  => $data['period_year'],
            'period_month' => $data['period_month'],
            'due_date'     => $data['due_date'],
            'amount'       => $data['amount'],
            'status'       => 'pending',
            'notes'         => $data['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Tagihan berhasil dibuat',
            'payment' => $payment
        ], 201);
    }

    public function updateStatus(Request $request, Payment $payment)
    {
        $request->validate([
            'status' => 'required|in:pending,paid,confirmed,rejected'
        ]);

        $payment->status = $request->status;

        // Jika admin menandai pembayaran lunas,
        // hentikan semua notifikasi
        if (in_array($request->status, ['paid','confirmed'])) {
            $payment->last_notified_at = now();
        }

        $payment->save();

        return response()->json([
            'message' => 'Status pembayaran berhasil diperbarui.',
            'payment' => $payment
        ]);
    }
}
