<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use Illuminate\Http\Request;

class DemandeManagementController extends Controller
{
    /**
     * Liste toutes les demandes avec filtres.
     * Route: GET /api/admin/demandes
     */
    public function index(Request $request)
    {
        try {
            $query = Demande::with([
                'client:id,nom,prenom,email,telephone',
                'service:id,titre,type_service,ville,intervenant_id',
                'service.intervenant:id,nom,prenom,email',
                'evaluations'
            ]);

            // Filtre par statut
            if ($request->has('statut') && $request->statut !== '') {
                $query->where('statut', $request->statut);
            }

            // Filtre par type de demande
            if ($request->has('type_demande') && $request->type_demande !== '') {
                $query->where('type_demande', $request->type_demande);
            }

            // Filtre par type de service
            if ($request->has('type_service') && $request->type_service !== '') {
                $query->whereHas('service', function ($q) use ($request) {
                    $q->where('type_service', $request->type_service);
                });
            }

            // Filtre par ville
            if ($request->has('ville') && $request->ville !== '') {
                $query->where('ville', 'like', '%' . $request->ville . '%');
            }

            // Filtre par date de création
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Trier par date de création (plus récentes en premier)
            $query->orderByDesc('created_at');

            $demandes = $query->get();

            // Formater les données
            $formattedDemandes = $demandes->map(function ($demande) {
                return [
                    'id' => $demande->id,
                    'client' => $demande->client ? [
                        'id' => $demande->client->id,
                        'nom' => $demande->client->nom,
                        'prenom' => $demande->client->prenom,
                        'email' => $demande->client->email,
                        'telephone' => $demande->client->telephone,
                    ] : null,
                    'service' => $demande->service ? [
                        'id' => $demande->service->id,
                        'titre' => $demande->service->titre,
                        'type_service' => $demande->service->type_service,
                        'ville' => $demande->service->ville,
                        'intervenant' => $demande->service->intervenant ? [
                            'id' => $demande->service->intervenant->id,
                            'nom' => $demande->service->intervenant->nom,
                            'prenom' => $demande->service->intervenant->prenom,
                            'email' => $demande->service->intervenant->email,
                        ] : null,
                    ] : null,
                    'type_demande' => $demande->type_demande,
                    'description' => $demande->description,
                    'prix_total' => $demande->prix_total,
                    'adresse' => $demande->adresse,
                    'ville' => $demande->ville,
                    'latitude' => $demande->latitude,
                    'longitude' => $demande->longitude,
                    'statut' => $demande->statut,
                    'date_souhaitee' => $demande->date_souhaitee,
                    'parametres_demande' => $demande->parametres_demande,
                    'created_at' => $demande->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $demande->updated_at->format('Y-m-d H:i:s'),
                    'evaluations_count' => $demande->evaluations->count(),
                ];
            })->filter(function ($demande) {
                // Filtrer les demandes avec des relations valides
                return $demande['client'] !== null && $demande['service'] !== null;
            })->values();

            return response()->json([
                'success' => true,
                'data' => $formattedDemandes,
                'count' => $formattedDemandes->count(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching demandes: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des demandes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Statistiques des demandes.
     * Route: GET /api/admin/demandes/stats
     */
    public function stats()
    {
        try {
            $total = Demande::count();
            
            $parStatut = Demande::selectRaw('statut, COUNT(*) as count')
                ->groupBy('statut')
                ->get()
                ->pluck('count', 'statut')
                ->toArray();

            $parTypeDemande = Demande::selectRaw('type_demande, COUNT(*) as count')
                ->groupBy('type_demande')
                ->get()
                ->pluck('count', 'type_demande')
                ->toArray();

            $parTypeService = Demande::join('services', 'demandes.service_id', '=', 'services.id')
                ->selectRaw('services.type_service, COUNT(*) as count')
                ->groupBy('services.type_service')
                ->get()
                ->pluck('count', 'type_service')
                ->toArray();

            $montantTotal = Demande::whereNotNull('prix_total')
                ->whereIn('statut', ['accepte', 'termine'])
                ->sum('prix_total');

            $montantEnAttente = Demande::whereNotNull('prix_total')
                ->where('statut', 'en_attente')
                ->sum('prix_total');

            // Demandes des 30 derniers jours
            $demandes30Jours = Demande::where('created_at', '>=', now()->subDays(30))->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'par_statut' => [
                        'en_attente' => $parStatut['en_attente'] ?? 0,
                        'en_discussion' => $parStatut['en_discussion'] ?? 0,
                        'accepte' => $parStatut['accepte'] ?? 0,
                        'refuse' => $parStatut['refuse'] ?? 0,
                        'termine' => $parStatut['termine'] ?? 0,
                    ],
                    'par_type_demande' => [
                        'libre' => $parTypeDemande['libre'] ?? 0,
                        'categories' => $parTypeDemande['categories'] ?? 0,
                    ],
                    'par_type_service' => [
                        'electricite' => $parTypeService['electricite'] ?? 0,
                        'peinture' => $parTypeService['peinture'] ?? 0,
                        'menuiserie' => $parTypeService['menuiserie'] ?? 0,
                    ],
                    'montant_total' => round($montantTotal, 2),
                    'montant_en_attente' => round($montantEnAttente, 2),
                    'demandes_30_jours' => $demandes30Jours,
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching demande stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Détails d'une demande spécifique.
     * Route: GET /api/admin/demandes/{id}
     */
    public function show(string $id)
    {
        try {
            $demande = Demande::with([
                'client:id,nom,prenom,email,telephone,photo_profil',
                'service:id,titre,type_service,ville,intervenant_id,description',
                'service.intervenant:id,nom,prenom,email,telephone,photo_profil',
                'evaluations'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $demande->id,
                    'client' => $demande->client ? [
                        'id' => $demande->client->id,
                        'nom' => $demande->client->nom,
                        'prenom' => $demande->client->prenom,
                        'email' => $demande->client->email,
                        'telephone' => $demande->client->telephone,
                        'photo_profil' => $demande->client->photo_profil,
                    ] : null,
                    'service' => $demande->service ? [
                        'id' => $demande->service->id,
                        'titre' => $demande->service->titre,
                        'type_service' => $demande->service->type_service,
                        'ville' => $demande->service->ville,
                        'description' => $demande->service->description,
                        'intervenant' => $demande->service->intervenant ? [
                            'id' => $demande->service->intervenant->id,
                            'nom' => $demande->service->intervenant->nom,
                            'prenom' => $demande->service->intervenant->prenom,
                            'email' => $demande->service->intervenant->email,
                            'telephone' => $demande->service->intervenant->telephone,
                            'photo_profil' => $demande->service->intervenant->photo_profil,
                        ] : null,
                    ] : null,
                    'type_demande' => $demande->type_demande,
                    'description' => $demande->description,
                    'prix_total' => $demande->prix_total,
                    'adresse' => $demande->adresse,
                    'ville' => $demande->ville,
                    'latitude' => $demande->latitude,
                    'longitude' => $demande->longitude,
                    'statut' => $demande->statut,
                    'date_souhaitee' => $demande->date_souhaitee,
                    'parametres_demande' => $demande->parametres_demande,
                    'evaluations' => $demande->evaluations->map(function ($eval) {
                        return [
                            'id' => $eval->id,
                            'cible' => $eval->cible,
                            'note_moyenne' => $eval->note_moyenne,
                            'note_ponctualite' => $eval->note_ponctualite,
                            'note_proprete' => $eval->note_proprete,
                            'note_qualite' => $eval->note_qualite,
                            'commentaire' => $eval->commentaire,
                            'created_at' => $eval->created_at->format('Y-m-d H:i:s'),
                        ];
                    }),
                    'created_at' => $demande->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $demande->updated_at->format('Y-m-d H:i:s'),
                ]
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Demande non trouvée'
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Error fetching demande: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement de la demande',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

