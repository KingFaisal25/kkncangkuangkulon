<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('division_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('division_id')->constrained('divisions')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->unsignedTinyInteger('progress')->default(0); // 0-100
            $table->enum('status', ['rencana', 'berjalan', 'selesai'])->default('rencana');
            $table->text('foto_bukti')->nullable(); // base64 or path
            $table->timestamp('tanggal_laporan')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('division_reports');
    }
};
