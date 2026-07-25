<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rab_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('division_id')->constrained('divisions')->onDelete('cascade');
            $table->string('nama_item');
            $table->string('satuan')->default('unit'); // pcs, kg, liter, etc.
            $table->decimal('volume', 10, 2)->default(1);
            $table->decimal('harga_satuan', 15, 2);
            $table->decimal('total', 15, 2)->storedAs('volume * harga_satuan');
            $table->text('keterangan')->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rab_items');
    }
};
