<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PaymentAdminController extends Controller
{
    /**
     * Tampilkan semua pembayaran untuk admin
     */
    public function index(Request $request)
    {
        $statusFilter = $request->input('status');

        $query = Payment::with(['tenant.room'])
            ->orderByDesc('period_year')
            ->orderByDesc('period_month')
            ->orderByDesc('created_at');

        // Filter status (optional)
        if ($statusFilter && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        $payments = $query->get()->map(function ($payment) {
            return [
                'id'                => $payment->id,
                'tenant_name'       => $payment->tenant->nama ?? 'Unknown',
                'tenant_phone'      => $payment->tenant->kontak ?? '-',
                'room_number'       => $payment->tenant->room->nomor_kamar ?? '-',
                'payment_type'      => $payment->payment_type,
                'payment_type_label'=> $this->mapPaymentType($payment->payment_type),
                'amount'            => $payment->amount,
                'due_date'          => $payment->due_date->format('d M Y'),
                'payment_date'      => $payment->payment_date?->format('d M Y'),
                'status'            => $payment->status,
                'status_label'      => $payment->status_label,
                'status_color'      => $payment->status_color,
                'payment_method'    => $payment->payment_method,
                'reference'         => $payment->reference ? asset('storage/' . $payment->reference) : null,
                'has_proof_image'   => (bool) $payment->reference,
                'notes'             => $payment->notes,
                'period'            => $payment->period_name,
                'is_overdue'        => $payment->isOverdue(),
            ];
        });

        // Statistik
        $stats = [
            'total'            => Payment::count(),
            'pending'          => Payment::where('status', 'pending')->count(),
            'waiting_approval' => Payment::where('status', 'paid')->count(),
            'confirmed'        => Payment::where('status', 'confirmed')->count(),
            'rejected'         => Payment::where('status', 'rejected')->count(),
        ];

        // Data tenant untuk form "Buat Tagihan"
        $tenants = Tenant::with('room')->get()->map(function ($tenant) {
            return [
                'id'         => $tenant->id,
                'nama'       => $tenant->nama,
                'room_number'=> $tenant->room->nomor_kamar ?? '-',
                'room_price' => $tenant->room->harga ?? 0,
            ];
        });

        return Inertia::render('admin/KeuanganAdminPage', [
            'user'     => Auth::user(),
            'payments' => $payments,
            'stats'    => $stats,
            'tenants'  => $tenants,
            'filters'  => [
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Admin membuat tagihan baru untuk tenant
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id'    => 'required|exists:tenants,id',
            'payment_type' => 'required|in:rent,deposit,utilities,maintenance',
            'amount'       => 'required|numeric|min:0',
            'due_date'     => 'required|date',
            'period_month' => 'required|integer|min:1|max:12',
            'period_year'  => 'required|integer|min:2020|max:2100',
            'notes'        => 'nullable|string|max:500',
        ]);

        Payment::create([
            'tenant_id'    => $validated['tenant_id'],
            'payment_type' => $validated['payment_type'],
            'amount'       => $validated['amount'],
            'due_date'     => $validated['due_date'],
            'period_month' => $validated['period_month'],
            'period_year'  => $validated['period_year'],
            'notes'        => $validated['notes'] ?? null,
            'status'       => 'pending',
        ]);

        return back()->with('success', 'Tagihan pembayaran berhasil dibuat.');
    }

    /**
     * ✅ Admin menyetujui pembayaran
     */
    public function approvePayment(Payment $payment)
    {
        try {
            // Hanya boleh approve kalau status sekarang "paid" (Menunggu Konfirmasi)
            if ($payment->status !== 'paid') {
                Log::warning('Status tidak valid untuk approve', [
                    'payment_id' => $payment->id,
                    'status'     => $payment->status,
                ]);

                return back()->with(
                    'error',
                    'Hanya pembayaran dengan status "Menunggu Konfirmasi" yang bisa disetujui.'
                );
            }

            // Update via Eloquent
            $payment->status = 'confirmed';
            // Kalau mau set tanggal pembayaran ketika dikonfirmasi:
            // $payment->payment_date = $payment->payment_date ?? now();
            $payment->save();

            Log::info('Payment approved successfully', [
                'payment_id' => $payment->id,
                'status'     => $payment->status,
            ]);

            return back()->with('success', 'Pembayaran berhasil dikonfirmasi.');
        } catch (\Exception $e) {
            Log::error('Error approving payment', [
                'payment_id' => $payment->id ?? null,
                'error'      => $e->getMessage(),
            ]);

            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * ✅ Admin menolak pembayaran
     */
    public function rejectPayment(Request $request, Payment $payment)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'rejection_reason' => 'nullable|string|max:500',
            ]);

            // Hapus file bukti kalau ada
            if ($payment->reference) {
                $path = Str::of($payment->reference)
                    ->after('storage/')
                    ->ltrim('/');

                if ($path->isNotEmpty() && Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }

            // Reset data pembayaran & tandai ditolak
            $payment->status         = 'rejected';
            $payment->notes          = $validated['rejection_reason'] ?? 'Pembayaran ditolak oleh admin.';
            $payment->payment_method = null;
            $payment->reference      = null;
            $payment->payment_date   = null;
            $payment->save();

            DB::commit();

            Log::info('Payment rejected successfully', [
                'payment_id' => $payment->id,
                'reason'     => $validated['rejection_reason'] ?? 'No reason provided',
            ]);

            return back()->with('success', 'Pembayaran ditolak.');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error rejecting payment', [
                'payment_id' => $payment->id ?? null,
                'error'      => $e->getMessage(),
            ]);

            return back()->with('error', 'Terjadi kesalahan saat menolak pembayaran.');
        }
    }

    /**
     * Admin menghapus tagihan
     */
    public function destroy(Payment $payment)
    {
        try {
            DB::beginTransaction();

            if ($payment->reference) {
                $path = Str::of($payment->reference)
                    ->after('storage/')
                    ->ltrim('/');

                if ($path->isNotEmpty() && Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }

            $payment->delete();

            DB::commit();

            Log::info('Payment deleted successfully', ['payment_id' => $payment->id]);

            return back()->with('success', 'Tagihan pembayaran berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error deleting payment', [
                'payment_id' => $payment->id ?? null,
                'error'      => $e->getMessage(),
            ]);

            return back()->with('error', 'Gagal menghapus pembayaran.');
        }
    }

    /**
     * Generate tagihan bulanan untuk semua tenant aktif
     */
    public function generateMonthlyPayments(Request $request)
    {
        try {
            $validated = $request->validate([
                'period_month' => 'required|integer|min:1|max:12',
                'period_year'  => 'required|integer|min:2020|max:2100',
            ]);

            $month = $validated['period_month'];
            $year  = $validated['period_year'];

            $tenants = Tenant::where('status', 'aktif')
                ->with('room')
                ->get();

            if ($tenants->isEmpty()) {
                return back()->with('warning', 'Tidak ada tenant aktif untuk dibuatkan tagihan.');
            }

            $created = 0;
            $skipped = 0;

            DB::beginTransaction();

            foreach ($tenants as $tenant) {
                $exists = Payment::where('tenant_id', $tenant->id)
                    ->where('period_month', $month)
                    ->where('period_year', $year)
                    ->where('payment_type', 'rent')
                    ->exists();

                if ($exists) {
                    $skipped++;
                    continue;
                }

                Payment::create([
                    'tenant_id'    => $tenant->id,
                    'payment_type' => 'rent',
                    'amount'       => $tenant->room->harga ?? 0,
                    'due_date'     => Carbon::create($year, $month, 26),
                    'period_month' => $month,
                    'period_year'  => $year,
                    'status'       => 'pending',
                ]);

                $created++;
            }

            DB::commit();

            return back()->with(
                'success',
                "Berhasil membuat {$created} tagihan. {$skipped} sudah ada sebelumnya."
            );
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error generating monthly payments', [
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Gagal membuat tagihan bulanan.');
        }
    }

    /**
     * Label jenis pembayaran (Indonesia)
     */
    private function mapPaymentType($type): string
    {
        return match ($type) {
            'rent'       => 'Sewa Bulanan',
            'deposit'    => 'Deposit',
            'utilities'  => 'Utilitas',
            'maintenance'=> 'Maintenance',
            default      => 'Lainnya',
        };
    }
}
