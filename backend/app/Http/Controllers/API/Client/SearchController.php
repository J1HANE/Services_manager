<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
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

        // Construire la requête pour récupérer les services actifs
        $query = Service::with([
            'intervenant' => function ($query) {
                $query->select('id', 'nom', 'prenom', 'surnom', 'photo_profil', 'telephone');
            },
            'evaluations',   // Load evaluations for rating calculation
            'categories',    // Load categories for pricing
            'disponibilites', // Load availability days
            'demandes'       // Load demandes for statistics
        ])
            ->where('est_actif', true)
            ->where('statut', 'actif')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');

        // Filtrer par ville si spécifié
        if ($ville) {
            $query->where('ville', $ville);
        }

        // Filtrer par type de service si spécifié
        if ($typeService) {
            $query->where('type_service', $typeService);
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
                'type_service' => $service->type_service,

                // Images (with fallbacks)
                'image' => $service->image_principale
                    ?? $service->intervenant->photo_profil
                    ?? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
                'images_supplementaires' => $service->images_supplementaires ?? [],

                // Location
                'ville' => $service->ville,
                'adresse' => $service->adresse,
                'lat' => (float) $service->latitude,
                'lng' => (float) $service->longitude,

                // Intervenant information
                'intervenant' => [
                    'id' => $service->intervenant->id,
                    'nom' => $service->intervenant->nom,
                    'prenom' => $service->intervenant->prenom,
                    'surnom' => $service->intervenant->surnom ?? ($service->intervenant->prenom . ' ' . $service->intervenant->nom),
                    'photo_profil' => $service->intervenant->photo_profil,
                    'telephone' => $service->intervenant->telephone ?? '',
                ],

                // Calculated ratings from evaluations
                'rating' => round($service->note_moyenne, 1),
                'nbAvis' => $service->nb_avis,
                'moyenne_ponctualite' => round($service->moyenne_ponctualite, 1),
                'moyenne_proprete' => round($service->moyenne_proprete, 1),
                'moyenne_qualite' => round($service->moyenne_qualite, 1),

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