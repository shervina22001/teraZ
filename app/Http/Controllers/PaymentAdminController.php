<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Tenant;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PaymentAdminController extends Controller
{
    // Show finance page
    public function index()
    {
        // Calculate statistics
        $totalPendapatan = Payment::where('status', 'paid')->sum('amount');
        $pembayaranTertunda = Payment::whereIn('status', ['pending', 'overdue'])->sum('amount');
        
        // For now, pengeluaran is 0 (can be added later with expenses table)
        $totalPengeluaran = 0;
        $keuntunganBersih = $totalPendapatan - $totalPengeluaran;

        // Get pemasukan (paid payments)
        $pemasukan = Payment::with(['tenant.room'])
            ->where('status', 'paid')
            ->orderBy('paid_at', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'kamar' => 'Kamar ' . ($payment->tenant->room->nomor_kamar ?? '-'),
                    'kategori' => ucfirst($payment->payment_type),
                    'tanggal' => $payment->paid_at ? Carbon::parse($payment->paid_at)->format('d M Y') : '-',
                    'jumlah' => $payment->amount,
                ];
            });

        // Pengeluaran (empty for now)
        $pengeluaran = [];

        // Get pending payments
        $pending = Payment::with(['tenant.room'])
            ->where('status', 'pending')
            ->orWhere('status', 'overdue')
            ->orderBy('due_date', 'asc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'kamar' => 'Kamar ' . ($payment->tenant->room->nomor_kamar ?? '-'),
                    'periode' => $payment->period_month && $payment->period_year 
                        ? Carbon::create($payment->period_year, $payment->period_month)->format('F Y')
                        : ucfirst($payment->payment_type),
                    'jatuh_tempo' => Carbon::parse($payment->due_date)->format('d M Y'),
                    'jumlah' => $payment->amount,
                    'bukti_pembayaran' => $payment->reference,
                ];
            });

        return Inertia::render('admin/KeuanganAdminPage', [
            'statistics' => [
                'total_pendapatan' => $totalPendapatan,
                'pembayaran_tertunda' => $pembayaranTertunda,
                'total_pengeluaran' => $totalPengeluaran,
                'keuntungan_bersih' => $keuntunganBersih,
            ],
            'pemasukan' => $pemasukan,
            'pengeluaran' => $pengeluaran,
            'pending' => $pending,
        ]);
    }

    // Approve payment
    public function approvePayment(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        
        $payment->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Payment approved successfully.');
    }

    // Reject payment
    public function rejectPayment(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        
        $payment->update([
            'status' => 'pending',
            'reference' => null,
        ]);

        return redirect()->back()->with('success', 'Payment rejected.');
    }

    // Generate monthly payments for all active tenants
    public function generateMonthlyPayments()
    {
        $activeTenants = Tenant::with('room')
            ->where('status', 'aktif')
            ->whereNotNull('room_id')
            ->get();

        $currentMonth = now()->month;
        $currentYear = now()->year;
        $generatedCount = 0;

        foreach ($activeTenants as $tenant) {
            // Check if payment already exists for this month
            $existingPayment = Payment::where('tenant_id', $tenant->id)
                ->where('period_month', $currentMonth)
                ->where('period_year', $currentYear)
                ->where('payment_type', 'rent')
                ->first();

            if (!$existingPayment && $tenant->room) {
                Payment::create([
                    'tenant_id' => $tenant->id,
                    'payment_type' => 'rent',
                    'amount' => $tenant->room->harga,
                    'due_date' => now()->startOfMonth()->addDays(9), // Due on 10th of month
                    'status' => 'pending',
                    'period_month' => $currentMonth,
                    'period_year' => $currentYear,
                ]);
                $generatedCount++;
            }
        }

        return redirect()->back()->with('success', "Generated {$generatedCount} payment(s) for this month.");
    }

    // Check and mark overdue payments
    public function checkOverduePayments()
    {
        $overdueCount = Payment::where('status', 'pending')
            ->where('due_date', '<', now())
            ->update(['status' => 'overdue']);

        return response()->json([
            'success' => true,
            'message' => "Marked {$overdueCount} payment(s) as overdue.",
        ]);
    }
}