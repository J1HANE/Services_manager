<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Récupérer les statistiques globales.
     * Route: GET /api/admin/stats
     */
    public function stats()
    {
        // TODO: Compter le nombre total d'utilisateurs.
        // TODO: Compter le nombre de missions terminées.
        // TODO: Calculer le volume d'affaires global (si disponible).
    }
}