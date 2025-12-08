<?php

namespace App\Http\Controllers\API\Mission;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MissionWorkflowController extends Controller
{
    /**
     * Accepter une mission (Action Artisan).
     * Route: PATCH /api/missions/{id}/accept
     */
    public function accept(string $id)
    {
        // TODO: Vérifier que l'utilisateur est bien l'artisan concerné.
        // TODO: Passer le statut de la demande à 'accepte'.
        // NOTE: Les contacts seront envoyés par le Cron Job 'ReleaseContactInfo'.
    }

    /**
     * Refuser une mission (Action Artisan).
     * Route: PATCH /api/missions/{id}/refuse
     */
    public function refuse(string $id)
    {
        // TODO: Vérifier que l'utilisateur est bien l'artisan concerné.
        // TODO: Passer le statut de la demande à 'refuse'.
    }

    /**
     * Terminer une mission et confirmer le paiement Cash.
     * Route: PATCH /api/missions/{id}/complete
     */
    public function complete(string $id)
    {
        // TODO: Passer le statut de la demande à 'termine'.
        // NOTE: Le Cron Job 'SendReviewRequest' enverra l'email d'avis plus tard.
    }
}