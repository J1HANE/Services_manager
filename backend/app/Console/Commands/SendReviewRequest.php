<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SendReviewRequest extends Command
{
    protected $signature = 'app:send-review-request';
    protected $description = 'Envoie le formulaire d\'avis aux clients après fin de mission';

    public function handle()
    {
        // TODO: Chercher les missions statut='termine' depuis 24h
        // TODO: Vérifier qu'il n'y a pas encore d'évaluation
        // TODO: Envoyer lien du formulaire au client
        
        $this->info('Demandes d\'avis envoyées (Simulation)');
    }
}