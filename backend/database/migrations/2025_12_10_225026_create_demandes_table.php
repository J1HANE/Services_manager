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
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('service_id')->constrained('services');
            $table->enum('type_demande', ['libre', 'categories']);
            $table->text('description')->nullable();
            $table->decimal('prix_total', 10, 2)->nullable();
            $table->string('adresse');
            $table->string('ville', 150);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->enum('statut', ['en_attente', 'en_discussion', 'accepte', 'refuse', 'termine'])->default('en_attente');
            $table->json('parametres_demande')->nullable();
            $table->date('date_souhaitee')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};
