<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class WorkProgram extends Model { protected $fillable=['nama','deskripsi','penanggung_jawab','target_tanggal','status','progress','catatan']; protected function casts(): array{return ['target_tanggal'=>'date','progress'=>'integer'];} }