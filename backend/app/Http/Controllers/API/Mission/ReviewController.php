<?php

namespace App\Http\Controllers\API\Mission;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Soumettre un avis (Action Client).
     * Route: POST /api/reviews
     */
    public function store(Request $request)
    {
        // TODO: Vérifier que la mission est bien 'termine'.
        // TODO: Valider les notes (1-5) et le commentaire.
        // TODO: Créer l'entrée dans la table 'evaluation'.
        // TODO: Mettre à jour la note moyenne de l'artisan.
    }
}