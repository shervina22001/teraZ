<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenanceRequest extends Model
{
    protected $table = 'maintenance_requests';

    protected $fillable = [
        
        'room_id',
        'judul',
        'deskripsi',
        'status',   // pending, in_progress, done
        'biaya',
        'dilaporkan_pada',
    ];

    protected $casts = [
        'biaya' => 'integer',
        'dilaporkan_pada' => 'datetime',
    ];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function room()   { return $this->belongsTo(Room::class); }
}
