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

            // Relasi ke users
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Nominal pembayaran
            $table->decimal('amount', 15, 2);

            // Tanggal jatuh tempo
            $table->date('due_date');

            // pending = belum bayar, paid = sudah bayar
            $table->enum('status', ['pending', 'paid'])->default('pending');

            // Terakhir kali user dikirimi pengingat
            $table->timestamp('last_notified_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
