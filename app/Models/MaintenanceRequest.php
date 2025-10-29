<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenanceRequest extends Model
{
    protected $table = 'maintenance_requests';

    protected $fillable = [
        'tenant_id',      // Add this (from your migration)
        'room_id',
        'judul',
        'deskripsi',
        'status',         // pending, in_progress, done
        'priority',       // low, medium, high, urgent - NEW FIELD
        'biaya',
        'dilaporkan_pada',
    ];

    protected $casts = [
        'biaya' => 'integer',
        'dilaporkan_pada' => 'datetime',
    ];

    // Relationships
    public function tenant() 
    { 
        return $this->belongsTo(Tenant::class); 
    }
    
    public function room()   
    { 
        return $this->belongsTo(Room::class); 
    }

    // Optional: Helper methods for priority
    public function isUrgent(): bool
    {
        return $this->priority === 'urgent';
    }

    public function isHighPriority(): bool
    {
        return in_array($this->priority, ['high', 'urgent']);
    }

    // Optional: Get priority badge color for frontend
    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'low' => 'gray',
            'medium' => 'blue',
            'high' => 'orange',
            'urgent' => 'red',
            default => 'gray',
        };
    }

    // Optional: Get priority label in Indonesian
    public function getPriorityLabelAttribute(): string
    {
        return match($this->priority) {
            'low' => 'Rendah',
            'medium' => 'Sedang',
            'high' => 'Tinggi',
            'urgent' => 'Mendesak',
            default => 'Sedang',
        };
    }

    // Optional: Scope for filtering by priority
    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeUrgentOnly($query)
    {
        return $query->whereIn('priority', ['urgent', 'high']);
    }
}
