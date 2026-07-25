<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance';

    protected $appends = ['foto_absen_url'];

    protected $fillable = [
        'user_id',
        'activity_id',
        'tanggal',
        'waktu_absen',
        'status',
        'foto_absen',
        'similarity',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'similarity' => 'float',
        ];
    }

    public function activity()
    {
        return $this->belongsTo(\App\Models\Activity::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the full URL for the attendance photo.
     */
    public function getFotoAbsenUrlAttribute()
    {
        if ($this->foto_absen) {
            // If it's already a base64 string, return it directly
            if (str_starts_with($this->foto_absen, 'data:image')) {
                return $this->foto_absen;
            }
            
            // Backward compatibility for local file paths
            return \Illuminate\Support\Facades\Storage::url($this->foto_absen);
        }
        return null;
    }
}
