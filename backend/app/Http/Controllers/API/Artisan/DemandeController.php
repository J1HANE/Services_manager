<?php

namespace App\Http\Controllers\API\Artisan;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use Illuminate\Http\Request;

class DemandeController extends Controller
{
    /**
     * Récupérer les demandes reçues par l'intervenant connecté.
     * Route: GET /api/artisan/demandes
     */
    public function index(Request $request)
    {
        $intervenantId = $request->user()->id;
        
        try {
            $demandes = Demande::whereHas('service', function ($query) use ($intervenantId) {
                $query->where('intervenant_id', $intervenantId);
            })
            ->whereHas('client') // S'assurer que le client existe
            ->orderByDesc('created_at')
            ->get()
            ->loadMissing(['client:id,nom,prenom,email,telephone', 'service:id,titre,type_service,ville,intervenant_id'])
            ->filter(function ($demande) {
                // Filtrer les demandes avec des relations valides
                return $demande->client !== null && $demande->service !== null;
            })
            ->values();
            
            return response()->json($demandes);
        } catch (\Exception $e) {
            \Log::error('Error fetching demandes for artisan: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors du chargement des demandes', 'error' => $e->getMessage()], 500);
        }
    }
}

