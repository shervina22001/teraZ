<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    protected $table = 'tenants';

    protected $fillable = 
    [
        'room_id',
        'nama',
        'kontak',
        'tanggal_mulai',
        'tanggal_selesai',
        'status',     // aktif, selesai, dibatalkan
        'catatan',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function room() { return $this->belongsTo(Room::class, 'room_id'); }
}
