<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration { public function up(): void { Schema::create('work_programs', function(Blueprint $table){$table->id();$table->string('nama');$table->text('deskripsi')->nullable();$table->string('penanggung_jawab')->nullable();$table->date('target_tanggal')->nullable();$table->string('status')->default('rencana');$table->unsignedTinyInteger('progress')->default(0);$table->text('catatan')->nullable();$table->timestamps();}); } public function down(): void {Schema::dropIfExists('work_programs');} };