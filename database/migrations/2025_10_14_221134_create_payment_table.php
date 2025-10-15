<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('payment_type')->default('rent'); // rent, deposit, utilities, etc.
            $table->decimal('amount', 10, 2);
            $table->date('due_date');
            $table->date('payment_date')->nullable();
            $table->string('status')->default('pending'); // pending, paid, overdue
            $table->string('payment_method')->nullable(); // cash, transfer, qris
            $table->string('reference')->nullable(); // payment reference/proof
            $table->text('notes')->nullable();
            $table->integer('period_month')->nullable(); // bulan pembayaran (1-12)
            $table->integer('period_year')->nullable(); // tahun pembayaran
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};