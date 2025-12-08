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
        // 1. SERVICES
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('intervenant_id')->constrained('users')->onDelete('cascade');
            $table->enum('type_service', ['electricite', 'peinture', 'menuiserie']);
            $table->string('titre', 150);
            $table->text('description')->nullable();
            $table->boolean('est_actif')->default(true);
            $table->enum('statut', ['actif', 'archive'])->default('actif');
            $table->string('ville', 100)->nullable();
            $table->string('adresse')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('rayon_km')->default(20);
            $table->json('parametres_specifiques')->nullable();
            $table->integer('nb_avis')->default(0);
            $table->integer('moyenne_note')->default(0);
            $table->integer('moyenne_ponctualite')->default(0);
            $table->integer('moyenne_proprete')->default(0);
            $table->integer('moyenne_qualite')->default(0);
            $table->timestamps();
        });

        // 2. CATEGORIES
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->enum('type_service', ['electricite', 'peinture', 'menuiserie']);
            $table->enum('type_categorie', ['materiel', 'service', 'autre'])->default('service');
            $table->string('nom', 150);
            $table->text('description')->nullable();
            $table->string('photo')->nullable();
            $table->timestamps();
        });

        // 3. SERVICE_CATEGORIES (Pivot)
        Schema::create('service_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->decimal('prix', 10, 2);
            $table->enum('unite_prix', ['par_heure', 'par_m2', 'par_unite', 'par_service', 'forfait']);
            $table->timestamps();
        });

        // 4. DEMANDES
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

        // 5. DEMANDE_ITEMS
        Schema::create('demande_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained('demandes')->onDelete('cascade');
            $table->foreignId('service_categorie_id')->constrained('service_categories');
            $table->decimal('quantite', 10, 2);
            $table->decimal('prix_total', 10, 2);
            $table->timestamps();
        });

        // 6. EVALUATION
        Schema::create('evaluation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained('demandes')->onDelete('cascade');
            $table->enum('cible', ['client', 'intervenant']);
            $table->decimal('note_moyenne', 3, 2)->default(0);
            $table->integer('note_ponctualite')->default(0);
            $table->integer('note_proprete')->default(0);
            $table->integer('note_qualite')->default(0);
            $table->text('commentaire')->nullable();
            $table->timestamps();
        });

        // 7. RECLAMATION
        Schema::create('reclamation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_id')->constrained('evaluation')->onDelete('cascade');
            $table->string('sujet');
            $table->text('description')->nullable();
            $table->text('justificatifs')->nullable();
            $table->timestamps();
        });

        // 8. DISPONIBILITES (Table Unifiée)
        Schema::create('disponibilites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
            $table->enum('type', ['semaine', 'date'])->default('semaine');
            $table->tinyInteger('jour_semaine')->nullable(); 
            $table->date('date_specifique')->nullable();
            $table->boolean('est_disponible')->default(true);
            $table->string('raison')->nullable();
            $table->time('heure_debut')->nullable();
            $table->time('heure_fin')->nullable();
            $table->timestamps();
        });

        // 9. JUSTIFICATIFS
        Schema::create('justificatifs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('intervenant_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('service_id')->nullable()->constrained('services')->onDelete('cascade');
            $table->enum('type_document', ['personnel', 'service', 'cni', 'certificat_qualification', 'assurance_rc', 'autre'])->default('personnel');
            $table->string('titre')->nullable();
            $table->text('informations')->nullable();
            $table->string('nom_fichier')->nullable();
            $table->string('chemin_fichier')->nullable();
            $table->enum('est_verifiee', ['en_attente', 'accepte', 'refuse'])->default('en_attente');
            $table->text('commentaire_admin')->nullable();
            $table->timestamps();
        });

        // 10. EVALUATION REMINDERS
        Schema::create('evaluation_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained('demandes')->onDelete('cascade');
            $table->enum('destinataire', ['client', 'intervenant']);
            $table->string('email', 150);
            $table->enum('statut', ['en_attente', 'envoye', 'evalue', 'expire'])->default('en_attente');
            $table->dateTime('date_envoi')->nullable();
            $table->dateTime('date_rappel')->nullable();
            $table->integer('nombre_tentatives')->default(0);
            $table->timestamps();

            // Index définis dans le SQL
            $table->index('statut');
            $table->index('date_rappel');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Suppression dans l'ordre inverse pour respecter les contraintes
        Schema::dropIfExists('evaluation_reminders');
        Schema::dropIfExists('justificatifs');
        Schema::dropIfExists('disponibilites');
        Schema::dropIfExists('reclamation');
        Schema::dropIfExists('evaluation');
        Schema::dropIfExists('demande_items');
        Schema::dropIfExists('demandes');
        Schema::dropIfExists('service_categories');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('services');
    }
};