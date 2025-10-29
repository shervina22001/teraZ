<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

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
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'payment_date' => 'date',
        'paid_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    // Check if payment is overdue
    public function isOverdue(): bool
    {
        if ($this->status === 'paid' || $this->status === 'confirmed') {
            return false;
        }
        return Carbon::parse($this->due_date)->isPast();
    }

    // Get status label in Indonesian
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending' => 'Belum Bayar',
            'paid' => 'Menunggu Konfirmasi',
            'confirmed' => 'Lunas',
            'rejected' => 'Ditolak',
            'overdue' => 'Terlambat',
            default => 'Belum Bayar',
        };
    }

    // Get status badge color
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'confirmed' => 'green',
            'paid' => 'blue',
            'pending' => 'yellow',
            'rejected' => 'red',
            'overdue' => 'red',
            default => 'gray',
        };
    }


    // Get period name
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
}
