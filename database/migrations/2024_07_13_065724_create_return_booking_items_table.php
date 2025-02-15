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
        Schema::create('return_booking_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_booking_id')->constrained('return_bookings')->cascadeOnDelete();
            $table->string('invoice_no')->nullable();
            $table->decimal('amount', 10, 2)->default(0);
            $table->decimal('weight', 10, 2)->default(0); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_booking_items');
    }
};
