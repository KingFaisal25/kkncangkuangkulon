<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration { public function up(): void { Schema::create('activity_reports', function(Blueprint $table){$table->id();$table->foreignId('activity_id')->constrained('activities')->cascadeOnDelete();$table->foreignId('user_id')->constrained()->cascadeOnDelete();$table->text('hasil')->nullable();$table->text('kendala')->nullable();$table->text('catatan')->nullable();$table->string('dokumentasi')->nullable();$table->timestamps();}); } public function down(): void {Schema::dropIfExists('activity_reports');} };