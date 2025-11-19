<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display tenant's payment list
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $tenant = Tenant::where('user_id', $user->id)
            ->orWhere('nama', $user->name)
            ->orWhere('kontak', $user->phone)
            ->first();

        if (!$tenant) {
            return redirect()->route('dashboard')->with('error', 'Data tenant tidak ditemukan.');
        }

        $payments = Payment::where('tenant_id', $tenant->id)
            ->orderByDesc('period_year')
            ->orderByDesc('period_month')
            ->get()
            ->map(function ($payment) {
                // Check if reference is a path (not full URL)
                $referenceUrl = null;
                if ($payment->reference) {
                    // If it starts with 'http', it's already a full URL (old data)
                    if (str_starts_with($payment->reference, 'http')) {
                        $referenceUrl = $payment->reference;
                    } else {
                        // Convert path to URL
                        $referenceUrl = asset('storage/' . $payment->reference);
                    }
                }

                return [
                    'id' => $payment->id,
                    'payment_type' => $payment->payment_type,
                    'payment_type_label' => $this->mapPaymentType($payment->payment_type),
                    'amount' => $payment->amount,
                    'due_date' => $payment->due_date->format('d M Y'),
                    'payment_date' => $payment->payment_date?->format('d M Y'),
                    'status' => $payment->status,
                    'status_label' => $payment->status_label,
                    'status_color' => $payment->status_color,
                    'payment_method' => $payment->payment_method,
                    'reference' => $referenceUrl, // ✅ Full URL for frontend
                    'has_proof_image' => $payment->reference ? true : false,
                    'notes' => $payment->notes,
                    'period' => $payment->period_name,
                    'is_overdue' => $payment->isOverdue(),
                ];
            });

        $stats = [
            'total' => $payments->count(),
            'pending' => $payments->where('status', 'pending')->count(),
            'waiting_approval' => $payments->where('status', 'paid')->count(),
            'confirmed' => $payments->where('status', 'confirmed')->count(),
            'overdue' => $payments->where('is_overdue', true)->count(),
        ];

        return Inertia::render('user/PembayaranPage', [
            'user' => [
                'id'       => $user->id,
                'name'     => $tenant->nama ?? $user->name,   
                'username' => $user->username,
                'phone'    => $user->phone,
                'role'     => $user->role,
                'room'     => $tenant->room->nomor_kamar ?? null,
            ],
            'payments' => $payments,
            'stats'    => $stats,
        ]);
    }



    /**
     * Tenant fills/updates payment details (NOT create)
     */
    public function confirm(Request $request)
    {
        $user = $request->user();
        
        $tenant = Tenant::where('user_id', $user->id)
            ->orWhere('nama', $user->name)
            ->orWhere('kontak', $user->phone)
            ->first();

        if (!$tenant) {
            return back()->with('error', 'Data tenant tidak ditemukan.');
        }

        $validated = $request->validate([
            'payment_id' => 'required|exists:payments,id',
            'payment_method' => 'required|in:cash,transfer,qris',
            'reference' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
            'notes' => 'nullable|string|max:500',
        ]);

        $payment = Payment::findOrFail($validated['payment_id']);

        if ($payment->tenant_id !== $tenant->id) {
            return back()->with('error', 'Akses ditolak.');
        }

        if (!in_array($payment->status, ['pending', 'rejected'])) {
            return back()->with('error', 'Pembayaran ini sudah dikonfirmasi atau sedang diproses.');
        }

        // Handle file upload
        $referencePath = null;
        if ($request->hasFile('reference')) {
            // Delete old file if exists
            if ($payment->reference && \Storage::disk('public')->exists($payment->reference)) {
                \Storage::disk('public')->delete($payment->reference);
            }

            $file = $request->file('reference');
            $filename = time() . '_' . $tenant->id . '_' . $file->getClientOriginalName();
            
            // This returns ONLY the path: 'payment_proofs/filename.jpg'
            $referencePath = $file->storeAs('payment_proofs', $filename, 'public');
        }

        // Update payment - save ONLY the path, not the full URL
        $payment->update([
            'status' => 'paid',
            'payment_method' => $validated['payment_method'],
            'reference' => $referencePath, // ✅ Just the path
            'notes' => $validated['notes'] ?? null,
            'payment_date' => now(),
            'paid_at' => now(),
        ]);

        return back()->with('success', 'Pembayaran berhasil dikonfirmasi. Menunggu verifikasi admin.');
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