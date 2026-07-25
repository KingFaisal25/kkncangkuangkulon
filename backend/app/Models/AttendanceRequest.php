<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class AttendanceRequest extends Model
{
 protected $fillable=['user_id','activity_id','tanggal','jenis','alasan','bukti','status','catatan_admin'];
 protected function casts(): array { return ['tanggal'=>'date']; }
 public function user(){return $this->belongsTo(User::class);}
 public function activity(){return $this->belongsTo(Activity::class);}
}