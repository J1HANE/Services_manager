<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use Illuminate\Http\Request;

class DemandeController extends Controller
{
    /**
     * Créer une demande de mission (Devis/Réservation).
     * Route: POST /api/demandes
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'type_demande' => 'required|in:libre,categories',
            'description' => 'nullable|string|max:1000',
            'adresse' => 'required|string|max:255',
            'ville' => 'required|string|max:150',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'date_souhaitee' => 'nullable|date|after:today',
            'prix_total' => 'nullable|numeric|min:0',
            'parametres_demande' => 'nullable|json',
        ]);
        
        $clientId = $request->user()->id;
        
        $demande = Demande::create([
            'client_id' => $clientId,
            'service_id' => $validated['service_id'],
            'type_demande' => $validated['type_demande'],
            'description' => $validated['description'] ?? null,
            'adresse' => $validated['adresse'],
            'ville' => $validated['ville'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'date_souhaitee' => $validated['date_souhaitee'] ?? null,
            'prix_total' => $validated['prix_total'] ?? null,
            'parametres_demande' => $request->has('parametres_demande') ? json_decode($validated['parametres_demande'], true) : null,
            'statut' => 'en_attente',
        ]);
        
        return response()->json([
            'message' => 'Demande créée avec succès',
            'demande' => $demande->load(['service', 'service.intervenant']),
        ], 201);
    }

    /**
     * Voir mes demandes (Dashboard Client).
     * Route: GET /api/demandes
     */
    public function index(Request $request)
    {
        $clientId = $request->user()->id;
        
        try {
            $demandes = Demande::where('client_id', $clientId)
                ->whereHas('service', function ($query) {
                    $query->whereHas('intervenant'); // S'assurer que l'intervenant existe
                })
                ->orderByDesc('created_at')
                ->get()
                ->loadMissing([
                    'service:id,titre,type_service,ville,intervenant_id',
                    'evaluations',
                ])
                ->map(function ($demande) {
                    // Charger l'intervenant si le service existe
                    if ($demande->service && $demande->service->intervenant_id) {
                        $demande->service->loadMissing('intervenant:id,nom,prenom,email,telephone');
                    }
                    return $demande;
                })
                ->filter(function ($demande) {
                    // Filtrer les demandes avec des relations valides
                    return $demande->service !== null && $demande->service->intervenant !== null;
                })
                ->values();
            
            return response()->json($demandes);
        } catch (\Exception $e) {
            \Log::error('Error fetching demandes for client: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors du chargement des demandes', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Voir une demande spécifique.
     * Route: GET /api/demandes/{id}
     */
    public function show(Request $request, string $id)
    {
        try {
            $demande = \App\Models\Demande::findOrFail($id);
            
            // Charger les relations de manière sécurisée
            $demande->loadMissing([
                'client:id,nom,prenom,email,telephone',
                'service:id,titre,type_service,ville,intervenant_id',
                'evaluations',
            ]);
            
            // Charger l'intervenant si le service existe
            if ($demande->service && $demande->service->intervenant_id) {
                $demande->service->loadMissing('intervenant:id,nom,prenom,email,telephone');
            }
            
            // Vérifier que l'utilisateur a le droit de voir cette demande
            $user = $request->user();
            if ($demande->client_id !== $user->id && ($demande->service && $demande->service->intervenant_id !== $user->id)) {
                return response()->json([
                    'message' => 'Accès non autorisé à cette demande.',
                ], 403);
            }
            
            // Vérifier que les relations essentielles existent
            if (!$demande->client || !$demande->service) {
                return response()->json([
                    'message' => 'Données de demande incomplètes.',
                ], 404);
            }
            
            return response()->json($demande);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Demande non trouvée.',
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Error fetching demande: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors du chargement de la demande.',
            ], 500);
        }
    }
}