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
        Schema::create('return_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('cn_no')->nullable();
            $table->foreignId('manifest_id')->constrained('manifests')->cascadeOnDelete();
            $table->foreignId('consignor')->constrained('parties', 'id')->nullable();
            $table->foreignId('consignee')->constrained('parties', 'id')->nullable();
            $table->string('party_location')->nullable();
            $table->decimal('amount',10,2)->default(0.00);
            $table->string('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_bookings');
    }
};
