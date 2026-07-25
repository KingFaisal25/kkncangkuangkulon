<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Because there's no data yet, it's safer to drop and re-add than to use DB::statement for casting
            $table->dropColumn('face_embedding');
        });
        
        Schema::table('users', function (Blueprint $table) {
            $table->longText('face_embedding')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('face_embedding');
        });
        
        Schema::table('users', function (Blueprint $table) {
            $table->binary('face_embedding')->nullable();
        });
    }
};
