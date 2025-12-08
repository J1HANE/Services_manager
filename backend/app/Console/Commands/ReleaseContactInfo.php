<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ReleaseContactInfo extends Command
{
    /**
     * Le nom de la commande à appeler dans le terminal ou le scheduler.
     */
    protected $signature = 'app:release-contact-info';

    /**
     * La description de la commande.
     */
    protected $description = 'Débloque et envoie les contacts pour les missions acceptées';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // TODO: Chercher les missions statut='accepte'
        // TODO: Envoyer SMS/Email avec les numéros
        // TODO: Marquer comme 'contacts_envoyes' pour ne pas renvoyer
        
        $this->info('Contacts envoyés (Simulation)');
    }
}