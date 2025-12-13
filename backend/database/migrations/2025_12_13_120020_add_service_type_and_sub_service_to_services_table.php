<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            // New normalized structure (kept nullable for backward compatibility)
            $table->foreignId('service_type_id')->nullable()->after('intervenant_id')->constrained('service_types');
            $table->foreignId('sub_service_id')->nullable()->after('service_type_id')->constrained('sub_services');

            // Price of the published sub-service (single offer)
            $table->decimal('prix', 10, 2)->nullable()->after('sub_service_id');
            $table->enum('unite_prix', ['par_heure', 'par_m2', 'par_unite', 'par_service', 'forfait'])->nullable()->after('prix');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sub_service_id');
            $table->dropConstrainedForeignId('service_type_id');
            $table->dropColumn(['prix', 'unite_prix']);
        });
    }
};


