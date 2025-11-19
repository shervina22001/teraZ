<?php

namespace App\Console\Commands;

use App\Models\Payment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Mail\PaymentDueReminder;

class SendPaymentReminders extends Command
{
    protected $signature = 'payments:send-reminders';
    protected $description = 'Mengirim email pengingat pembayaran yang jatuh tempo';

    public function handle()
    {
        $payments = Payment::with('tenant')
            ->needReminder()
            ->get();

        if ($payments->isEmpty()) {
            $this->info('Tidak ada pembayaran yg perlu diingatkan.');
            return Command::SUCCESS;
        }

        foreach ($payments as $payment) {
            // Skip jika status bukan pending
            if ($payment->status !== 'pending') {
                continue;
            }

            // Kirim notifikasi email
            Mail::to($payment->tenant->email)
                ->send(new PaymentDueReminder($payment));

            // Update last_notified_at agar tidak spam
            $payment->last_notified_at = now();
            $payment->save();

            $this->info("Pengingat dikirim ke tenant: {$payment->tenant->name}");
        }

        return Command::SUCCESS;
    }
}
