<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentDueReminder extends Mailable
{
    use Queueable, SerializesModels;

    public Payment $payment;

    /**
     * Create a new message instance.
     */
    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    /**
     * Build the message.
     *
     * Email ini akan memakai view:
     * resources/views/emails/payment_due_reminder.blade.php
     */
    public function build()
    {
        return $this->subject('Pengingat Pembayaran Jatuh Tempo')
            ->view('emails.payment_due_reminder');
    }
}
