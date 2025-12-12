<?php

namespace App\Http\Controllers\API\Mission;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use App\Models\Evaluation;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Soumettre un avis (Action Client ou Intervenant).
     * Route: POST /api/reviews
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'demande_id' => 'required|exists:demandes,id',
            'cible' => 'required|in:client,intervenant',
            'note_ponctualite' => 'required|integer|min:1|max:5',
            'note_proprete' => 'required|integer|min:1|max:5',
            'note_qualite' => 'required|integer|min:1|max:5',
            'commentaire' => 'nullable|string|max:1000',
        ]);
        
        $demande = \App\Models\Demande::findOrFail($validated['demande_id']);
        $user = $request->user();
        
        // Vérifier que la mission est terminée
        if ($demande->statut !== 'termine') {
            return response()->json([
                'message' => 'La mission doit être terminée avant de pouvoir être évaluée.',
            ], 422);
        }
        
        // Vérifier les permissions
        if ($validated['cible'] === 'intervenant' && $demande->client_id !== $user->id) {
            return response()->json([
                'message' => 'Seul le client peut évaluer l\'intervenant.',
            ], 403);
        }
        
        if ($validated['cible'] === 'client' && $demande->service->intervenant_id !== $user->id) {
            return response()->json([
                'message' => 'Seul l\'intervenant peut évaluer le client.',
            ], 403);
        }
        
        // Vérifier si une évaluation existe déjà pour cette demande et cette cible
        $existingEvaluation = \App\Models\Evaluation::where('demande_id', $demande->id)
            ->where('cible', $validated['cible'])
            ->first();
        
        if ($existingEvaluation) {
            return response()->json([
                'message' => 'Une évaluation existe déjà pour cette mission.',
            ], 422);
        }
        
        // Calculer la note moyenne
        $noteMoyenne = (
            $validated['note_ponctualite'] + 
            $validated['note_proprete'] + 
            $validated['note_qualite']
        ) / 3;
        
        // Créer l'évaluation
        $evaluation = \App\Models\Evaluation::create([
            'demande_id' => $demande->id,
            'cible' => $validated['cible'],
            'note_moyenne' => round($noteMoyenne, 2),
            'note_ponctualite' => $validated['note_ponctualite'],
            'note_proprete' => $validated['note_proprete'],
            'note_qualite' => $validated['note_qualite'],
            'commentaire' => $validated['commentaire'] ?? null,
        ]);
        
        return response()->json([
            'message' => 'Évaluation soumise avec succès',
            'evaluation' => $evaluation->load('demande'),
        ], 201);
    }
}