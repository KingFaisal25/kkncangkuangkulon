<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DivisionReport extends Model
{
    protected $fillable = [
        'division_id',
        'user_id',
        'judul',
        'deskripsi',
        'progress',
        'status',
        'foto_bukti',
        'tanggal_laporan',
    ];

    protected $casts = [
        'tanggal_laporan' => 'datetime',
        'progress' => 'integer',
    ];

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
