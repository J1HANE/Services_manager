<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Recherche publique des artisans avec filtres.
     * Route: GET /api/search
     */
    public function search(Request $request)
    {
        // TODO: Récupérer les paramètres (ville, type_service, date).
        // TODO: Filtrer les services actifs dont l'artisan est vérifié.
        // TODO: Appliquer la géolocalisation (Ville + Rayon).
        // TODO: Retourner la liste paginée.
    }

    /**
     * Voir le profil complet d'un artisan.
     * Route: GET /api/artisan/{id}
     */
    public function showProfile(string $id)
    {
        // TODO: Récupérer l'utilisateur (Artisan) et ses services.
        // TODO: Inclure les avis (Evaluation) et le portfolio.
        // TODO: Retourner toutes les infos publiques.
    }
}