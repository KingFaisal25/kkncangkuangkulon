<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ActivityReport extends Model {
 protected $appends=['dokumentasi_url'];
 protected $fillable=['activity_id','user_id','hasil','kendala','catatan','dokumentasi'];
 public function getDokumentasiUrlAttribute(){return $this->dokumentasi ? \Illuminate\Support\Facades\Storage::url($this->dokumentasi) : null;}
 public function activity(){return $this->belongsTo(Activity::class);}
 public function user(){return $this->belongsTo(User::class);}
}