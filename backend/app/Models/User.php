<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $with = ['division'];
    protected $appends = ['foto_url'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nama',
        'nim',
        'jurusan',
        'password',
        'foto_registrasi',
        'face_embedding',
        'role',
        'division_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'face_embedding',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'face_embedding' => 'array',
        ];
    }

    /**
     * Get the attendance records for the user.
     */
    public function attendance()
    {
        return $this->hasMany(Attendance::class);
    }

    public function division()
    {
        return $this->belongsTo(\App\Models\Division::class);
    }

    public function isBendahara(): bool
    {
        if ($this->role === 'admin')
            return true;
        if (!$this->division_id)
            return false;
        $divName = strtolower($this->division?->nama ?? '');
        return str_contains($divName, 'bendahara');
    }

    // Removed binary pack/unpack methods because face_embedding is now cast to JSON array directly

    /**
     * Get the full URL for the user's registration photo.
     */
    public function getFotoUrlAttribute()
    {
        if ($this->foto_registrasi) {
            // Check if it's already a data URI (starts with data:image)
            if (str_starts_with($this->foto_registrasi, 'data:image')) {
                return $this->foto_registrasi;
            }
            // For backward compatibility if it's still a file path
            $disk = config('filesystems.default');
            if ($disk === 's3') {
                return \Illuminate\Support\Facades\Storage::disk('s3')->url($this->foto_registrasi);
            } else {
                $filename = basename($this->foto_registrasi);
                return rtrim(config('app.url'), '/') . '/api/images/' . $filename;
            }
        }
        return null;
    }
}

