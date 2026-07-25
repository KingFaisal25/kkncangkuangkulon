<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void { Schema::create('attendance_requests', function(Blueprint $table) { $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->foreignId('activity_id')->nullable()->constrained('activities')->nullOnDelete(); $table->date('tanggal'); $table->string('jenis'); $table->text('alasan'); $table->string('bukti')->nullable(); $table->string('status')->default('menunggu'); $table->text('catatan_admin')->nullable(); $table->timestamps(); }); }
 public function down(): void { Schema::dropIfExists('attendance_requests'); }
};