<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('justificatifs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('intervenant_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->string('type_document', 100);
            $table->string('titre', 150)->nullable();
            $table->json('informations')->nullable();
            $table->string('nom_fichier')->nullable();
            $table->string('chemin_fichier')->nullable();

            // Statut validation
            $table->enum('statut', ['en_attente', 'valide', 'refuse'])->default('en_attente');
            $table->boolean('est_verifiee')->default(false);
            $table->text('commentaire_admin')->nullable();

            $table->timestamps();

            $table->index(['intervenant_id', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('justificatifs');
    }
};
