<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reclamation;
use Illuminate\Http\Request;

class ReclamationManagementController extends Controller
{
    /**
     * Liste des réclamations avec filtres
     * GET /api/admin/reclamations
     */
    public function index(Request $request)
    {
        $query = Reclamation::with(['createur', 'demande', 'evaluation', 'reponduPar']);

        // Filtres
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('createur_type')) {
            $query->where('createur_type', $request->createur_type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('sujet', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $reclamations = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $reclamations
        ]);
    }

    /**
     * Statistiques des réclamations
     * GET /api/admin/reclamations/stats
     */
    public function stats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Reclamation::count(),
                'en_attente' => Reclamation::enAttente()->count(),
                'en_cours' => Reclamation::enCours()->count(),
                'resolue' => Reclamation::resolue()->count(),
                'fermee' => Reclamation::fermee()->count(),
                'par_clients' => Reclamation::parType('client')->count(),
                'par_intervenants' => Reclamation::parType('intervenant')->count(),
            ]
        ]);
    }

    /**
     * Détails d'une réclamation
     * GET /api/admin/reclamations/{id}
     */
    public function show($id)
    {
        $reclamation = Reclamation::with([
            'createur',
            'demande.service',
            'demande.client',
            'evaluation',
            'reponduPar'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $reclamation
        ]);
    }

    /**
     * Répondre à une réclamation
     * POST /api/admin/reclamations/{id}/repondre
     */
    public function repondre(Request $request, $id)
    {
        $validated = $request->validate([
            'reponse' => 'required|string|min:10',
            'statut' => 'required|in:en_cours,resolue,fermee'
        ]);

        $reclamation = Reclamation::findOrFail($id);

        $reclamation->update([
            'reponse' => $validated['reponse'],
            'statut' => $validated['statut'],
            'reponse_at' => now(),
            'repondu_par' => $request->user()->id,
        ]);

        $reclamation->load(['reponduPar']);

        return response()->json([
            'success' => true,
            'message' => 'Réponse enregistrée avec succès',
            'data' => $reclamation
        ]);
    }

    /**
     * Changer le statut d'une réclamation
     * PATCH /api/admin/reclamations/{id}/statut
     */
    public function updateStatut(Request $request, $id)
    {
        $validated = $request->validate([
            'statut' => 'required|in:en_attente,en_cours,resolue,fermee'
        ]);

        $reclamation = Reclamation::findOrFail($id);
        $reclamation->update(['statut' => $validated['statut']]);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès',
            'data' => $reclamation
        ]);
    }
}
