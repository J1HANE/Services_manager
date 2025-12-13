<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\ServiceType;
use App\Models\SubService;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Recherche publique des artisans avec filtres.
     * Route: GET /api/search
     */
    public function search(Request $request)
    {
        // Récupérer les paramètres de recherche
        $ville = $request->input('ville');
        $typeService = $request->input('type_service');
        $searchTerm = $request->input('search');
        $serviceId = $request->input('service_id');
        $categoryId = $request->input('category_id'); // sous-service/category filter
        $subServiceId = $request->input('sub_service_id'); // new normalized filter

        // Construire la requête pour récupérer les services actifs
        $query = Service::with([
            'intervenant' => function ($query) {
                $query->select('id', 'nom', 'prenom', 'surnom', 'photo_profil', 'telephone');
            },
            'evaluations',   // Load evaluations for rating calculation
            'categories',    // Legacy categories for pricing/extras
            'serviceType',
            'subService',
            'disponibilites', // Load availability days
            'demandes'       // Load demandes for statistics
        ])
            ->where('est_actif', true)
            ->where('statut', 'actif');

        // For map/list search we only return geolocated services to avoid Leaflet crashes.
        // But when requesting a specific service by id (service_id=...), we allow missing coords.
        if (!$serviceId) {
            $query->whereNotNull('latitude')->whereNotNull('longitude');
        }

        // Filtrer par ville si spécifié
        if ($ville) {
            $query->where('ville', $ville);
        }

        // Filtrer par type de service si spécifié
        if ($typeService) {
            // Prefer new schema when available, but keep legacy enum column too
            $query->where(function ($q) use ($typeService) {
                $q->where('type_service', $typeService)
                  ->orWhereHas('serviceType', function ($qq) use ($typeService) {
                      $qq->where('code', $typeService);
                  });
            });
        }

        // Filtrer par sous-service (new schema)
        if ($subServiceId) {
            $query->where('sub_service_id', $subServiceId);
        }

        // Filtrer par sous-service (category_id) si spécifié
        // Note: category_id refers to categories.id (typically type_categorie=service)
        if ($categoryId) {
            $query->whereHas('categories', function ($q) use ($categoryId) {
                $q->where('categories.id', $categoryId);
            });
        }

        // Filtrer par ID de service si spécifié
        if ($serviceId) {
            $query->where('id', $serviceId);
        }

        // Filtrer par terme de recherche (titre ou description)
        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('titre', 'like', '%' . $searchTerm . '%')
                    ->orWhere('description', 'like', '%' . $searchTerm . '%');
            });
        }

        // Récupérer les services
        $services = $query->get();

        // Formater les données pour le frontend
        $formattedServices = $services->map(function ($service) {
            // Vérifier que l'intervenant existe
            if (!$service->intervenant) {
                return null;
            }

            return [
                'id' => $service->id,
                // Service information
                'titre' => $service->titre ?? 'Service sans titre',
                'description' => $service->description ?? '',
                'type_service' => $service->serviceType?->code ?? $service->type_service,
                // Needed for demande options pricing UI
                'parametres_specifiques' => $service->parametres_specifiques,
                'service_type' => $service->serviceType ? [
                    'id' => $service->serviceType->id,
                    'code' => $service->serviceType->code,
                    'nom' => $service->serviceType->nom,
                ] : null,
                'sub_service' => $service->subService ? [
                    'id' => $service->subService->id,
                    'nom' => $service->subService->nom,
                    'description' => $service->subService->description,
                ] : null,
                'prix' => $service->prix,
                'unite_prix' => $service->unite_prix,

                // Images (with fallbacks)
                'image' => $service->image_principale
                    ?? $service->intervenant->photo_profil
                    ?? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
                'images_supplementaires' => $service->images_supplementaires ?? [],

                // Location
                'ville' => $service->ville,
                'adresse' => $service->adresse,
                'lat' => $service->latitude !== null ? (float) $service->latitude : null,
                'lng' => $service->longitude !== null ? (float) $service->longitude : null,

                // Intervenant information
                'intervenant' => [
                    'id' => $service->intervenant->id,
                    'nom' => $service->intervenant->nom,
                    'prenom' => $service->intervenant->prenom,
                    'surnom' => $service->intervenant->surnom ?? ($service->intervenant->prenom . ' ' . $service->intervenant->nom),
                    'photo_profil' => $service->intervenant->photo_profil,
                    'telephone' => $service->intervenant->telephone ?? '',
                ],

                // Calculated ratings from evaluations (using accessors from Service model)
                'rating' => round($service->note_moyenne ?? 0, 1),
                'nbAvis' => $service->nb_avis ?? 0,
                'moyenne_ponctualite' => round($service->moyenne_ponctualite ?? 0, 1),
                'moyenne_proprete' => round($service->moyenne_proprete ?? 0, 1),
                'moyenne_qualite' => round($service->moyenne_qualite ?? 0, 1),

                // Statistics
                'missions_completees' => $service->demandes()->where('statut', 'termine')->count(),
                'total_categories' => $service->categories->count(),
                'disponible_depuis' => $service->created_at->format('Y-m-d'),

                // Availability days
                'disponibilites' => $service->disponibilites->where('type_disponibilite', 'regular')->pluck('jour_semaine')->toArray(),

                // Service categories with pricing
                'categories' => $service->categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        // Needed for demande_items: references service_categories.id (pivot primary key)
                        'service_categorie_id' => $category->pivot->id ?? null,
                        'nom' => $category->nom,
                        'type_categorie' => $category->type_categorie,
                        'prix' => $category->pivot->prix ?? null,
                        'unite_prix' => $category->pivot->unite_prix ?? null,
                    ];
                })->toArray(),

                // Legacy fields for backward compatibility
                'service' => $service->type_service,
                'surnom' => $service->intervenant->surnom ?? ($service->intervenant->prenom . ' ' . $service->intervenant->nom),
            ];
        })->filter(); // Remove null values

        return response()->json([
            'success' => true,
            'data' => $formattedServices->values(), // Re-index array after filtering
            'count' => $formattedServices->count(),
        ]);
    }

    /**
     * Voir le profil complet d'un artisan.
     * Route: GET /api/artisan/{id}
     */
    public function showProfile(string $id)
    {
        // Récupérer l'utilisateur (Artisan) avec ses services
        $artisan = User::with([
            'servicesIntervenant' => function ($query) {
                $query->where('est_actif', true)->where('statut', 'actif');
            }
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $artisan,
        ]);
    }

    /**
     * Formater le tarif du service
     */
    private function formatTarif($service)
    {
        try {
            // Si le service a des catégories avec prix, utiliser le premier
            if ($service->categories && $service->categories->count() > 0) {
                $firstCategory = $service->categories->first();
                if ($firstCategory && isset($firstCategory->pivot) && $firstCategory->pivot->prix) {
                    return $firstCategory->pivot->prix . '€/' . $firstCategory->pivot->unite_prix;
                }
            }
        } catch (\Exception $e) {
            // En cas d'erreur, retourner le tarif par défaut
        }

        // Sinon, retourner un tarif par défaut
        return 'Sur devis';
    }

    /**
     * Calculer l'expérience de l'intervenant
     */
    private function calculateExperience($intervenant)
    {
        // Vérifier que l'intervenant existe
        if (!$intervenant) {
            return 'Non spécifié';
        }

        // Si l'intervenant a une date de création, calculer depuis cette date
        if (isset($intervenant->created_at) && $intervenant->created_at) {
            $years = now()->diffInYears($intervenant->created_at);
            return $years > 0 ? $years . ' ans' : 'Nouveau';
        }

        return 'Non spécifié';
    }
}