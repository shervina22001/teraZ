<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class PaymentAdminController extends Controller
{
    /**
     * Display all payments for admin
     */
    public function index(Request $request)
    {
        $statusFilter = $request->input('status');

        $query = Payment::with(['tenant.room'])
            ->orderByDesc('period_year')
            ->orderByDesc('period_month')
            ->orderByDesc('created_at');

        // Apply status filter
        if ($statusFilter && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        $payments = $query->get()->map(function ($payment) {
            return [
                'id' => $payment->id,
                'tenant_name' => $payment->tenant->nama ?? 'Unknown',
                'tenant_phone' => $payment->tenant->kontak ?? '-',
                'room_number' => $payment->tenant->room->nomor_kamar ?? '-',
                'payment_type' => $payment->payment_type,
                'payment_type_label' => $this->mapPaymentType($payment->payment_type),
                'amount' => $payment->amount,
                'due_date' => $payment->due_date->format('d M Y'),
                'payment_date' => $payment->payment_date?->format('d M Y'),
                'status' => $payment->status,
                'status_label' => $payment->status_label,
                'status_color' => $payment->status_color,
                'payment_method' => $payment->payment_method,
                'reference' => $payment->reference ? asset('storage/' . $payment->reference) : null,
                'has_proof_image' => $payment->reference ? true : false,
                'notes' => $payment->notes,
                'period' => $payment->period_name,
                'is_overdue' => $payment->isOverdue(),
            ];
        });

        // Statistics
        $stats = [
            'total' => Payment::count(),
            'pending' => Payment::where('status', 'pending')->count(),
            'waiting_approval' => Payment::where('status', 'paid')->count(),
            'confirmed' => Payment::where('status', 'confirmed')->count(),
            'rejected' => Payment::where('status', 'rejected')->count(),
        ];

        // Get all tenants for create payment
        $tenants = Tenant::with('room')->get()->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'nama' => $tenant->nama,
                'room_number' => $tenant->room->nomor_kamar ?? '-',
                'room_price' => $tenant->room->harga ?? 0,
            ];
        });

        return Inertia::render('admin/KeuanganAdminPage', [
            'user' => Auth::user(),
            'payments' => $payments,
            'stats' => $stats,
            'tenants' => $tenants,
            'filters' => [
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Admin creates a new payment for tenant
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'payment_type' => 'required|in:rent,deposit,utilities,maintenance',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'period_month' => 'required|integer|min:1|max:12',
            'period_year' => 'required|integer|min:2020|max:2100',
            'notes' => 'nullable|string|max:500',
        ]);

        Payment::create([
            'tenant_id' => $validated['tenant_id'],
            'payment_type' => $validated['payment_type'],
            'amount' => $validated['amount'],
            'due_date' => $validated['due_date'],
            'period_month' => $validated['period_month'],
            'period_year' => $validated['period_year'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Tagihan pembayaran berhasil dibuat.');
    }

    /**
     * ✅ Admin approves payment
     */
    public function approvePayment(Request $request, Payment $payment)
    {
        // Check if payment is in 'paid' status (waiting for approval)
        if ($payment->status !== 'paid') {
            return back()->with('error', 'Hanya pembayaran dengan status "Menunggu Konfirmasi" yang bisa disetujui.');
        }

        // Update status to confirmed
        $payment->update([
            'status' => 'confirmed',
        ]);

        return back()->with('success', 'Pembayaran berhasil dikonfirmasi.');
    }

    /**
     * ✅ Admin rejects payment
     */
    public function rejectPayment(Request $request, Payment $payment)
    {
        // Validate rejection reason
        $validated = $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        // Delete payment proof image if exists
        if ($payment->reference && Storage::disk('public')->exists($payment->reference)) {
            Storage::disk('public')->delete($payment->reference);
        }

        // Reset payment data and mark as rejected
        $payment->update([
            'status' => 'rejected',
            'notes' => $validated['rejection_reason'] ?? 'Pembayaran ditolak oleh admin.',
            'payment_method' => null,
            'reference' => null, // Clear payment proof
            'payment_date' => null,
            'paid_at' => null,
        ]);

        return back()->with('success', 'Pembayaran ditolak.');
    }

    /**
     * Admin deletes payment
     */
    public function destroy(Payment $payment)
    {
        // Only allow deleting pending or rejected payments
        if (!in_array($payment->status, ['pending', 'rejected'])) {
            return back()->with('error', 'Tidak dapat menghapus pembayaran yang sudah dikonfirmasi.');
        }

        // Delete payment proof image if exists
        if ($payment->reference && Storage::disk('public')->exists($payment->reference)) {
            Storage::disk('public')->delete($payment->reference);
        }

        $payment->delete();
        return back()->with('success', 'Tagihan pembayaran berhasil dihapus.');
    }

    /**
     * Generate monthly payments for all active tenants
     */
    public function generateMonthlyPayments(Request $request)
    {
        $validated = $request->validate([
            'period_month' => 'required|integer|min:1|max:12',
            'period_year' => 'required|integer|min:2020|max:2100',
        ]);

        $month = $validated['period_month'];
        $year = $validated['period_year'];

        // Get all active tenants
        $tenants = Tenant::where('status', 'aktif')
            ->with('room')
            ->get();

        $created = 0;
        $skipped = 0;

        foreach ($tenants as $tenant) {
            // Check if payment already exists for this period
            $exists = Payment::where('tenant_id', $tenant->id)
                ->where('period_month', $month)
                ->where('period_year', $year)
                ->where('payment_type', 'rent')
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            // Create payment
            Payment::create([
                'tenant_id' => $tenant->id,
                'payment_type' => 'rent',
                'amount' => $tenant->room->harga ?? 0,
                'due_date' => Carbon::create($year, $month, 10), // Due on 10th of the month
                'period_month' => $month,
                'period_year' => $year,
                'status' => 'pending',
            ]);

            $created++;
        }

        return back()->with('success', "Berhasil membuat {$created} tagihan. {$skipped} sudah ada sebelumnya.");
    }

    /**
     * Map payment type to Indonesian label
     */
    private function mapPaymentType($type): string
    {
        return match($type) {
            'rent' => 'Sewa Bulanan',
            'deposit' => 'Deposit',
            'utilities' => 'Utilitas',
            'maintenance' => 'Maintenance',
            default => 'Lainnya',
        };
    }
}
