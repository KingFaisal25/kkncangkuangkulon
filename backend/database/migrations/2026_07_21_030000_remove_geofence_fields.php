<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void { Schema::table('activities', function (Blueprint $table) { $table->dropColumn(['latitude', 'longitude', 'radius_meter']); }); Schema::table('attendance', function (Blueprint $table) { $table->dropColumn(['latitude', 'longitude', 'location_accuracy', 'distance_meter']); }); }
 public function down(): void { Schema::table('activities', function (Blueprint $table) { $table->decimal('latitude', 10, 7)->nullable(); $table->decimal('longitude', 10, 7)->nullable(); $table->unsignedInteger('radius_meter')->default(100); }); Schema::table('attendance', function (Blueprint $table) { $table->decimal('latitude', 10, 7)->nullable(); $table->decimal('longitude', 10, 7)->nullable(); $table->decimal('location_accuracy', 8, 2)->nullable(); $table->unsignedInteger('distance_meter')->nullable(); }); }
};