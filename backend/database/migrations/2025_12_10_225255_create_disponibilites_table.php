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
        Schema::create('disponibilites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
            $table->enum('type_disponibilite', ['regular', 'exception']);
            $table->tinyInteger('jour_semaine')->nullable()->comment('1=Lundi, 7=Dimanche');
            $table->date('date_exclusion')->nullable();
            $table->string('raison')->nullable();
            $table->timestamps();
            
            $table->unique(['service_id', 'date_exclusion'], 'uq_exception');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disponibilites');
    }
};
