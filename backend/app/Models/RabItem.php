<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class RabItem extends Model
{
    protected $fillable = [
        'division_id',
        'nama_item',
        'deskripsi_kegiatan',
        'satuan',
        'volume',
        'harga_satuan',
        'keterangan',
        'lampiran_path',
        'status',
        'rejection_note',
        'reviewed_by',
        'reviewed_at',
        'user_id',
    ];

    protected $appends = ['attachment_url'];

    protected $casts = [
        'volume' => 'float',
        'harga_satuan' => 'float',
        'total' => 'float',
        'reviewed_at' => 'datetime',
    ];

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function getAttachmentUrlAttribute(): ?string
    {
        return $this->lampiran_path ? Storage::disk('public')->url($this->lampiran_path) : null;
    }
}
