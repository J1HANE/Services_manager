<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class PublishDelayedReviews extends Command
{
    protected $signature = 'app:publish-delayed-reviews';
    protected $description = 'Rend les avis visibles 7 jours après leur création';

    public function handle()
    {
        // TODO: Chercher avis cachés créés il y a > 7 jours
        // TODO: Passer le booléen est_visible à TRUE
        
        $this->info('Avis publiés (Simulation)');
    }
}