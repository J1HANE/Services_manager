<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class VerifyDocumentWithAI implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $documentId;

    /**
     * Create a new job instance.
     */
    public function __construct($documentId)
    {
        $this->documentId = $documentId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // TODO: Appeler l'API IA Open Source
        // TODO: Analyser le résultat
        // TODO: Mettre à jour le statut du Justificatif (Validé/Rejeté)
    }
}