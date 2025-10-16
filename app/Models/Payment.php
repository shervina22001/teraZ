<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'payment_type',
        'amount',
        'due_date',
        'payment_date',
        'status',
        'payment_method',
        'reference',
        'notes',
        'period_month',
        'period_year',
        'paid_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'payment_date' => 'date',
        'paid_at' => 'datetime',
    ];

    // Relasi
    public function tenant() 
    { 
        return $this->belongsTo(Tenant::class); 
    }
}