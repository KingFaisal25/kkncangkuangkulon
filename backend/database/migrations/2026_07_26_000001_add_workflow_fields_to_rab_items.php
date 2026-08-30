<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('rab_items', function (Blueprint $table) {
            $table->text('deskripsi_kegiatan');
            $table->string('lampiran_path')->nullable();
            $table->string('status')->default('pending');
            $table->text('rejection_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('rab_items', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn([
                'deskripsi_kegiatan',
                'lampiran_path',
                'status',
                'rejection_note',
                'reviewed_by',
                'reviewed_at',
            ]);
        });
    }
};
