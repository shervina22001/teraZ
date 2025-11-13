<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'room_id',
        'nama',
        'kontak',
        'profile_photo', // Add this
        'tanggal_mulai',
        'tanggal_selesai',
        'status',
        'catatan',
        'profile_photo',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];

    protected $appends = ['profile_photo_full'];

    public function getProfilePhotoFullAttribute()
    {
        if ($this->profile_photo && Storage::disk('public')->exists($this->profile_photo)) {
            // URL publik: http://APP_URL/storage/profile_photos/abc123.jpg
            return asset('storage/' . $this->profile_photo);
        }

        // fallback kalau belum ada foto
        return asset('teraZ/default-user.png'); // atau path default kamu
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function maintenanceRequests()
    {
        return $this->hasMany(MaintenanceRequest::class);
    }

    // Get profile photo URL
    public function getProfilePhotoUrlAttribute()
    {
        if ($this->profile_photo) {
            return asset('storage/' . $this->profile_photo);
        }
        return asset('teraZ/testi1.png'); // Default image
    }
}
