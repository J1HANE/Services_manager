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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('intervenant_id')->constrained('users')->onDelete('cascade');
            $table->enum('type_service', ['electricite', 'peinture', 'menuiserie']);
            $table->string('titre', 150);
            $table->text('description')->nullable();
            $table->string('image_principale')->nullable();
            $table->json('images_supplementaires')->nullable();
            $table->boolean('est_actif')->default(true);
            $table->enum('statut', ['actif', 'archive'])->default('actif')->comment('Statut du service: actif ou archivé');
            $table->string('ville', 100)->nullable();
            $table->string('adresse')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('rayon_km')->default(20);
            $table->json('parametres_specifiques')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
