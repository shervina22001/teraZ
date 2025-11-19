<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

class Payment extends Model
{
    protected $fillable = [
        'tenant_id',
        'payment_type',
        'amount',
        'due_date',
        'payment_date',
        'status',
        'payment_method',
        'payment_proof',
        'reference',
        'notes',
        'period_month',
        'period_year',
        'paid_at',
        'last_notified_at',
    ];

    /**
     * Semua accessor yang harus dikirim ke frontend
     */
    protected $appends = [
        'payment_proof_url',
        'status_label',
        'status_color',
        'period_name'
    ];

    /**
     * Casts
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'payment_date' => 'date',
        'paid_at' => 'datetime',
        'last_notified_at' => 'datetime',
    ];

    /**
     * Relasi tenant
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * URL bukti pembayaran
     */
    public function getPaymentProofUrlAttribute()
    {
        if (!$this->payment_proof) {
            return null;
        }

        $path = 'payment_proofs/' . $this->payment_proof;

        if (Storage::disk('public')->exists($path)) {
            return asset('storage/' . $path);
        }

        return null;
    }

    /**
     * Status label
     */
    public function getStatusLabelAttribute()
    {
        return match ($this->status) {
            'pending' => 'Belum Bayar',
            'paid' => 'Menunggu Konfirmasi',
            'confirmed' => 'Lunas',
            'rejected' => 'Ditolak',
            'overdue' => 'Terlambat',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Status color
     */
    public function getStatusColorAttribute()
    {
        return match ($this->status) {
            'confirmed' => 'green',
            'paid' => 'blue',
            'pending' => 'yellow',
            'rejected' => 'red',
            'overdue' => 'red',
            default => 'gray',
        };
    }

    /**
     * Nama periode (Januari 2025 dst)
     */
    public function getPeriodNameAttribute(): string
    {
        if (!$this->period_month || !$this->period_year) {
            return '-';
        }

        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        return $months[$this->period_month] . ' ' . $this->period_year;
    }

    /**
     * Scope pembayaran yang perlu diingatkan
     */
    public function scopeNeedReminder($query)
    {
        $today = Carbon::today();

        return $query->where('status', 'pending')
            ->whereDate('due_date', '<=', $today)
            ->where(function ($q) use ($today) {
                $q->whereNull('last_notified_at')
                    ->orWhereDate('last_notified_at', '<', $today);
            });
    }

    /**
     * Overdue checker
     */
    public function isOverdue(): bool
    {
        if (in_array($this->status, ['paid', 'confirmed'])) {
            return false;
        }

        return Carbon::parse($this->due_date)->isPast();
    }
}
