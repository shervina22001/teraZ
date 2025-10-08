<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalExtension extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'old_end_date',
        'new_end_date',
        'extension_fee',
        'status',
        'requested_at',
        'approved_at',
        'notes',
    ];

    // Relasi
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
