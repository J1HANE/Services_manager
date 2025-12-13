<?php
use Illuminate\Support\Facades\Schedule;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('app:purge-legacy-data', function () {
    // Purge old demo data while keeping users + service_types + sub_services
    $tables = ['demande_items', 'demandes', 'disponibilites', 'service_categories', 'services'];

    DB::statement('SET FOREIGN_KEY_CHECKS=0');
    foreach ($tables as $t) {
        if (Schema::hasTable($t)) {
            DB::table($t)->truncate();
            $this->info("Truncated {$t}");
        }
    }
    DB::statement('SET FOREIGN_KEY_CHECKS=1');

    $this->info('✅ Purge completed.');
})->purpose('Purge legacy/demo records (services, pivots, demandes) without dropping tables');

// Exécuter l'envoi des contacts toutes les 5 minutes (Réactivité)
Schedule::command('app:release-contact-info')->everyFiveMinutes();

// Envoyer les demandes d'avis tous les soirs à 19h00
Schedule::command('app:send-review-request')->dailyAt('19:00');

// Publier les avis différés chaque nuit à minuit
Schedule::command('app:publish-delayed-reviews')->daily();