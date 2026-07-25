<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialTransaction extends Model
{
    protected $fillable = [
        'jenis',
        'judul',
        'jumlah',
        'keterangan',
        'bukti_foto',
        'tanggal',
        'user_id',
    ];

    protected $casts = [
        'jumlah' => 'float',
        'tanggal' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
