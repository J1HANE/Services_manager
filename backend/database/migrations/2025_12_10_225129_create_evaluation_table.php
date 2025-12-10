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
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation');
    }
};
