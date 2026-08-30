<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('activity_reports', function (Blueprint $table) {
            $table->string('status')->default('draft')->after('dokumentasi');
            $table->timestamp('published_at')->nullable()->after('status');
            $table->foreignId('published_by')->nullable()->after('published_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('activity_reports', function (Blueprint $table) {
            $table->dropForeign(['published_by']);
            $table->dropColumn(['status', 'published_at', 'published_by']);
        });
    }
};
