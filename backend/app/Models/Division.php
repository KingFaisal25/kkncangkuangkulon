<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    protected $fillable = ['nama', 'deskripsi', 'warna'];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function reports()
    {
        return $this->hasMany(DivisionReport::class);
    }

    public function rabItems()
    {
        return $this->hasMany(RabItem::class);
    }

    /**
     * Average progress from all reports
     */
    public function getProgressAttribute(): int
    {
        $reports = $this->reports;
        if ($reports->isEmpty())
            return 0;
        return (int) round($reports->avg('progress'));
    }
}
