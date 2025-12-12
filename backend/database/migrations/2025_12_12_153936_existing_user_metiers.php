<?php
// database/migrations/[timestamp]_change_metier_to_multiple.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 2. Créer la table des métiers
        Schema::create('metiers', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 50);
            $table->string('code', 20)->unique();
            $table->timestamps();
        });

        // 3. Créer la table de liaison utilisateur-métiers
        Schema::create('user_metiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('metier_id')->constrained()->onDelete('cascade');
            $table->boolean('principal')->default(true);
            $table->integer('ordre')->default(1);
            $table->timestamps();

            // Un utilisateur ne peut avoir le même métier qu'une fois
            $table->unique(['user_id', 'metier_id']);

            // Index pour les performances
            $table->index('user_id');
            $table->index('metier_id');
        });

        // 4. Insérer les métiers par défaut
        DB::table('metiers')->insert([
            ['nom' => 'Menuisier', 'code' => 'menuisier', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'Peintre', 'code' => 'peintre', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'Électricien', 'code' => 'electricien', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down()
    {
        // 1. Supprimer la table de liaison d'abord (à cause des contraintes)
        Schema::dropIfExists('user_metiers');

        // 2. Supprimer la table des métiers
        Schema::dropIfExists('metiers');

        // 3. Restaurer l'ancienne colonne 'metier' (optionnel)
        Schema::table('users', function (Blueprint $table) {
            $table->enum('metier', ['electricien', 'peintre', 'menuisier'])->nullable()->after('role');
        });
    }
};
