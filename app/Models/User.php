<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'phone',
        'role',
        'password',
        'profile'
    ];

    protected $appends = ['profile_url'];

    public function getProfileUrlAttribute()
    {
        if ($this->profile && Storage::disk('public')->exists($this->profile)) {
            return asset('storage/' . $this->profile);
        }
        return asset('images/default-user.png');
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // Relasi
    public function tenants()
    {
        return $this->hasMany(Tenant::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}


