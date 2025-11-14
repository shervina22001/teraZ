<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengeluarans', function (Blueprint $table) {
            $table->id();
            $table->string('judul'); // contoh: "Pengeluaran air bulan ini"
            $table->string('kategori')->nullable(); // contoh: "air", "sampah", dll
            $table->text('deskripsi')->nullable();
            $table->date('tanggal'); // tanggal pengeluaran
            $table->unsignedBigInteger('nominal'); // dalam rupiah
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengeluarans');
    }
};
