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
        Schema::table('reclamation', function (Blueprint $table) {
            // Rendre evaluation_id nullable car peut être lié à une demande
            $table->foreignId('evaluation_id')->nullable()->change();
            
            // Ajouter relation avec demande (intervention)
            $table->foreignId('demande_id')->nullable()->after('evaluation_id')
                ->constrained('demandes')->onDelete('cascade');
            
            // Créateur de la réclamation (client ou intervenant)
            $table->foreignId('createur_id')->after('demande_id')
                ->constrained('users')->onDelete('cascade');
            $table->enum('createur_type', ['client', 'intervenant'])->after('createur_id');
            
            // Statut de la réclamation
            $table->enum('statut', ['en_attente', 'en_cours', 'resolue', 'fermee'])
                ->default('en_attente')->after('justificatifs');
            
            // Réponse de l'admin
            $table->text('reponse')->nullable()->after('statut');
            $table->timestamp('reponse_at')->nullable()->after('reponse');
            $table->foreignId('repondu_par')->nullable()->after('reponse_at')
                ->constrained('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reclamation', function (Blueprint $table) {
            $table->dropForeign(['demande_id']);
            $table->dropForeign(['createur_id']);
            $table->dropForeign(['repondu_par']);
            $table->dropColumn([
                'demande_id',
                'createur_id',
                'createur_type',
                'statut',
                'reponse',
                'reponse_at',
                'repondu_par'
            ]);
            $table->foreignId('evaluation_id')->nullable(false)->change();
        });
    }
};
