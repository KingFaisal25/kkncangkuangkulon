<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RabItem extends Model
{
    protected $fillable = [
        'division_id',
        'nama_item',
        'satuan',
        'volume',
        'harga_satuan',
        'keterangan',
        'user_id',
    ];

    protected $casts = [
        'volume' => 'float',
        'harga_satuan' => 'float',
        'total' => 'float',
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
