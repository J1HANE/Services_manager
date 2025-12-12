<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // D'abord rendre evaluation_id nullable
        DB::statement('ALTER TABLE reclamation MODIFY evaluation_id BIGINT UNSIGNED NULL');
        
        Schema::table('reclamation', function (Blueprint $table) {
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
            if (Schema::hasColumn('reclamation', 'repondu_par')) {
                $table->dropForeign(['repondu_par']);
            }
            if (Schema::hasColumn('reclamation', 'createur_id')) {
                $table->dropForeign(['createur_id']);
            }
            if (Schema::hasColumn('reclamation', 'demande_id')) {
                $table->dropForeign(['demande_id']);
            }
            $table->dropColumn([
                'demande_id',
                'createur_id',
                'createur_type',
                'statut',
                'reponse',
                'reponse_at',
                'repondu_par'
            ]);
        });
        
        DB::statement('ALTER TABLE reclamation MODIFY evaluation_id BIGINT UNSIGNED NOT NULL');
    }
};
