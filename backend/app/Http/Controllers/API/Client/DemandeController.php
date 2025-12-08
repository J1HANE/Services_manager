<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DemandeController extends Controller
{
    /**
     * Créer une demande de mission (Devis/Réservation).
     * Route: POST /api/demandes
     */
    public function store(Request $request)
    {
        // TODO: Valider les inputs (service_id, date_souhaitee, description, adresse).
        // TODO: Créer la demande avec le statut 'en_attente'.
        // TODO: Si JSON 'parametres_demande', le sauvegarder.
    }

    /**
     * Voir mes demandes (Dashboard Client).
     * Route: GET /api/demandes
     */
    public function index()
    {
        // TODO: Récupérer les demandes où client_id = Auth user.
        // TODO: Inclure les infos du service et de l'artisan associé.
    }
}