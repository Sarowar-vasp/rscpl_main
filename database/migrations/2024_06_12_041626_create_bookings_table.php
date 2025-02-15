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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('cn_no')->nullable();
            $table->foreignId('manifest_id')->constrained('manifests')->cascadeOnDelete();
            $table->string('cewb')->nullable();
            $table->date('cewb_expires')->nullable();
            $table->foreignId('consignor')->constrained('parties', 'id')->nullable();
            $table->foreignId('consignee')->constrained('parties', 'id')->nullable();
            $table->decimal('amount',10,2)->default(0.00);

            $table->boolean('ship_to_party')->default(0);
            $table->string('party_location')->nullable();

            $table->string('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
