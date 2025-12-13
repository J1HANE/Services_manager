<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sub_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_type_id')->constrained('service_types')->cascadeOnDelete();
            $table->string('nom', 150);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['service_type_id', 'nom']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sub_services');
    }
};


