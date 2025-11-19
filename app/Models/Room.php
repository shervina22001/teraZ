<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $table = 'rooms';

    protected $fillable = [
        'nomor_kamar',
        'tipe',
        'harga',
        'status',
        'fasilitas',
    ];

    // ❌ REMOVE THIS - causes N+1 queries and performance issues
    // protected $with = ['tenants', 'maintenanceRequests'];

    protected $casts = [
        'harga' => 'decimal:2',
    ];

    public function tenants()
    {

        return $this->hasMany(Tenant::class, 'room_id', 'id');
    }

    public function maintenanceRequests()
    {
        
        return $this->hasMany(MaintenanceRequest::class, 'room_id', 'id');
    }
}
