<?php

namespace App\Http\Controllers\API\Artisan;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Récupérer la liste de toutes les catégories.
     * Utile pour les "Select" et "Dropdowns" dans React (Création service, Filtres).
     * Route: GET /api/categories
     */
    public function index(Request $request)
    {
        // TODO: Si un paramètre '?type_service=peinture' est présent, filtrer.
        // TODO: Sinon, retourner toutes les catégories groupées par type.
        // TODO: Retourner le JSON (id, nom, description, type_categorie).
    }
}