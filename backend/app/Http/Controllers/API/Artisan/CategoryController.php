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
        $query = \App\Models\Categorie::query();

        // Filter by type_service if provided (e.g., ?type_service=peinture)
        if ($request->has('type_service')) {
            $query->where('type_service', $request->type_service);
        }

        // Filter by type_categorie if provided (e.g., ?type_categorie=service)
        if ($request->has('type_categorie')) {
            $query->where('type_categorie', $request->type_categorie);
        }

        $categories = $query->orderBy('type_service')->orderBy('nom')->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}