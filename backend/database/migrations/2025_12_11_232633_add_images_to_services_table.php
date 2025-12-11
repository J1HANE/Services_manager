<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            // Add main image column (optional)
            $table->string('image_principale')->nullable()->after('description');

            // Add additional images as JSON array (optional)
            $table->json('images_supplementaires')->nullable()->after('image_principale');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['image_principale', 'images_supplementaires']);
        });
    }
};
