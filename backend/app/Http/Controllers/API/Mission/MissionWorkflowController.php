<?php

namespace App\Http\Controllers\API\Mission;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use Illuminate\Http\Request;

class MissionWorkflowController extends Controller
{
    /**
     * Accepter une mission (Action Artisan).
     * Route: PATCH /api/missions/{id}/accept
     */
    public function accept(Request $request, string $id)
    {
        $demande = Demande::with('service')->findOrFail($id);
        $intervenantId = $request->user()->id;
        
        // Vérifier que l'utilisateur est bien l'artisan concerné
        if ($demande->service->intervenant_id !== $intervenantId) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à accepter cette demande.',
            ], 403);
        }
        
        // Vérifier que la demande est en attente
        if ($demande->statut !== 'en_attente') {
            return response()->json([
                'message' => 'Cette demande ne peut plus être acceptée.',
            ], 422);
        }
        
        $demande->statut = 'accepte';
        $demande->save();
        
        return response()->json([
            'message' => 'Demande acceptée avec succès',
            'demande' => $demande->load(['client', 'service']),
        ]);
    }

    /**
     * Refuser une mission (Action Artisan).
     * Route: PATCH /api/missions/{id}/refuse
     */
    public function refuse(Request $request, string $id)
    {
        $demande = Demande::with('service')->findOrFail($id);
        $intervenantId = $request->user()->id;
        
        // Vérifier que l'utilisateur est bien l'artisan concerné
        if ($demande->service->intervenant_id !== $intervenantId) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à refuser cette demande.',
            ], 403);
        }
        
        // Vérifier que la demande est en attente
        if ($demande->statut !== 'en_attente') {
            return response()->json([
                'message' => 'Cette demande ne peut plus être refusée.',
            ], 422);
        }
        
        $demande->statut = 'refuse';
        $demande->save();
        
        return response()->json([
            'message' => 'Demande refusée',
            'demande' => $demande->load(['client', 'service']),
        ]);
    }

    /**
     * Terminer une mission et confirmer le paiement Cash.
     * Route: PATCH /api/missions/{id}/complete
     */
    public function complete(Request $request, string $id)
    {
        $demande = Demande::with('service')->findOrFail($id);
        $intervenantId = $request->user()->id;
        
        // Vérifier que l'utilisateur est bien l'artisan concerné
        if ($demande->service->intervenant_id !== $intervenantId) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à terminer cette demande.',
            ], 403);
        }
        
        // Vérifier que la demande est acceptée
        if ($demande->statut !== 'accepte') {
            return response()->json([
                'message' => 'Cette demande doit être acceptée avant d\'être terminée.',
            ], 422);
        }
        
        $demande->statut = 'termine';
        $demande->save();
        
        return response()->json([
            'message' => 'Mission terminée avec succès',
            'demande' => $demande->load(['client', 'service']),
        ]);
    }
}