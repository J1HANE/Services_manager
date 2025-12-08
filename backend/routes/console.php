<?php
use Illuminate\Support\Facades\Schedule;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Exécuter l'envoi des contacts toutes les 5 minutes (Réactivité)
Schedule::command('app:release-contact-info')->everyFiveMinutes();

// Envoyer les demandes d'avis tous les soirs à 19h00
Schedule::command('app:send-review-request')->dailyAt('19:00');

// Publier les avis différés chaque nuit à minuit
Schedule::command('app:publish-delayed-reviews')->daily();