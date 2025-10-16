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

    // Eager-load relasi ini setiap kali ambil Room
    protected $with = ['tenants', 'maintenanceRequests'];

    public function tenants()
    {
        // FK: tenants.room_id → rooms.id
        return $this->hasMany(Tenant::class, 'room_id', 'id');
    }

    public function maintenanceRequests()
    {
        // FK: maintenance_requests.room_id → rooms.id
        return $this->hasMany(MaintenanceRequest::class, 'room_id', 'id');
    }
}
