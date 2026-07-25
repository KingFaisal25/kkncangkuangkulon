<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = ['nama', 'deskripsi', 'tanggal', 'jam_mulai', 'jam_selesai', 'lokasi', 'status'];

    protected function casts(): array
    {
        return ['tanggal' => 'date'];
    }
}