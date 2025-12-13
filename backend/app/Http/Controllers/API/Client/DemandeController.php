<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use App\Models\DemandeItem;
use App\Models\ServiceCategorie;
use App\Models\Service;
use App\Models\Disponibilite;
use Illuminate\Http\Request;
use Carbon\Carbon;

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
            // For type_demande=categories we rely on official prices from service_categories
            'prix_total' => 'nullable|numeric|min:0',
            'parametres_demande' => 'nullable|json',

            // New structured payload (preferred)
            'items' => 'required_if:type_demande,categories|array|min:1',
            'items.*.service_categorie_id' => 'required_if:type_demande,categories|integer|exists:service_categories,id',
            'items.*.quantite' => 'required_if:type_demande,categories|numeric|min:0.01',
        ]);
        
        $clientId = $request->user()->id;

        // Validate date_souhaitee against artisan availability (regular disponibilites)
        if (!empty($validated['date_souhaitee'])) {
            $service = Service::findOrFail($validated['service_id']);
            $allowedDays = Disponibilite::where('service_id', $service->id)
                ->where('type_disponibilite', 'regular')
                ->pluck('jour_semaine')
                ->map(fn($d) => (int) $d)
                ->values()
                ->toArray();

            if (!empty($allowedDays)) {
                $dayIso = Carbon::parse($validated['date_souhaitee'])->dayOfWeekIso; // 1=Mon..7=Sun
                if (!in_array($dayIso, $allowedDays, true)) {
                    return response()->json([
                        'message' => 'La date choisie ne correspond pas aux jours de disponibilité de l’intervenant.'
                    ], 422);
                }
            }
        }

        // If categories mode: validate items belong to the service, compute total, and create demande_items
        if ($validated['type_demande'] === 'categories') {
            $items = $request->input('items', []);
            $serviceCategorieIds = collect($items)->pluck('service_categorie_id')->unique()->values();

            $serviceCategories = ServiceCategorie::with('categorie')
                ->whereIn('id', $serviceCategorieIds)
                ->get()
                ->keyBy('id');

            if ($serviceCategories->count() !== $serviceCategorieIds->count()) {
                return response()->json(['message' => 'Un ou plusieurs items sont invalides.'], 422);
            }

            // Ensure items belong to the same service and enforce exactly 1 sub-service (type_categorie=service)
            $subServiceCount = 0;
            foreach ($items as $idx => $item) {
                $scId = (int) ($item['service_categorie_id'] ?? 0);
                $quantite = (float) ($item['quantite'] ?? 0);

                if ($quantite <= 0) {
                    return response()->json(['message' => "Quantité invalide à l'index {$idx}."], 422);
                }

                $sc = $serviceCategories[$scId];
                if ((int) $sc->service_id !== (int) $validated['service_id']) {
                    return response()->json(['message' => 'Tous les items doivent appartenir au service sélectionné.'], 422);
                }

                if ($sc->categorie && $sc->categorie->type_categorie === 'service') {
                    $subServiceCount++;
                }
            }

            if ($subServiceCount !== 1) {
                return response()->json(['message' => 'Vous devez choisir exactement 1 sous-service pour la demande.'], 422);
            }

            // Compute official total
            $total = 0.0;
            foreach ($items as $item) {
                $scId = (int) $item['service_categorie_id'];
                $quantite = (float) $item['quantite'];
                $prixUnit = (float) $serviceCategories[$scId]->prix;
                $total += $prixUnit * $quantite;
            }

            $parametres = $request->has('parametres_demande') ? json_decode($validated['parametres_demande'], true) : null;
            $parametres = is_array($parametres) ? $parametres : [];
            $parametres['items'] = collect($items)->map(function ($item) use ($serviceCategories) {
                $sc = $serviceCategories[(int) $item['service_categorie_id']];
                return [
                    'service_categorie_id' => (int) $item['service_categorie_id'],
                    'category_id' => (int) $sc->category_id,
                    'nom' => $sc->categorie->nom ?? null,
                    'type_categorie' => $sc->categorie->type_categorie ?? null,
                    'quantite' => (float) $item['quantite'],
                    'prix_unitaire' => (float) $sc->prix,
                    'unite_prix' => $sc->unite_prix,
                ];
            })->values()->toArray();

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
                'prix_total' => round($total, 2),
                'parametres_demande' => $parametres,
                'statut' => 'en_attente',
            ]);

            foreach ($items as $item) {
                $scId = (int) $item['service_categorie_id'];
                $quantite = (float) $item['quantite'];
                $prixUnit = (float) $serviceCategories[$scId]->prix;

                DemandeItem::create([
                    'demande_id' => $demande->id,
                    'service_categorie_id' => $scId,
                    'quantite' => $quantite,
                    'prix_total' => round($prixUnit * $quantite, 2),
                ]);
            }
        } else {
            // Libre mode (new schema): compute an estimated total from the service offer and its options_pricing
            $service = Service::findOrFail($validated['service_id']);
            $params = $request->has('parametres_demande') ? json_decode($validated['parametres_demande'], true) : null;
            $params = is_array($params) ? $params : [];

            $total = 0.0;
            $breakdown = [];

            // Base price
            $basePrice = $service->prix !== null ? (float) $service->prix : 0.0;
            $baseUnit = $service->unite_prix; // enum: par_heure/par_m2/par_unite/par_service/forfait

            $baseQty = 1.0;
            if (in_array($baseUnit, ['par_heure', 'par_m2', 'par_unite'], true)) {
                $baseQty = isset($params['base_quantite']) ? (float) $params['base_quantite'] : 0.0;
                if ($basePrice > 0 && $baseQty <= 0) {
                    return response()->json(['message' => 'Veuillez fournir une quantité de base (heures / m² / unités) pour calculer le prix estimé.'], 422);
                }
            }

            if ($basePrice > 0) {
                $total += $basePrice * $baseQty;
                $breakdown['base'] = [
                    'prix_unitaire' => $basePrice,
                    'unite_prix' => $baseUnit,
                    'quantite' => $baseQty,
                    'total' => round($basePrice * $baseQty, 2),
                ];
            }

            // Options pricing (from service parametres_specifiques.options_pricing)
            $pricing = $service->parametres_specifiques['options_pricing'] ?? null;
            $selectedOptions = $params['options'] ?? [];
            $optionsComputed = [];

            if (is_array($pricing) && is_array($selectedOptions)) {
                foreach ($selectedOptions as $idx => $opt) {
                    $group = $opt['group'] ?? null;
                    $nom = $opt['nom'] ?? null;
                    $qty = isset($opt['quantite']) ? (float) $opt['quantite'] : 0.0;

                    if (!$group || !$nom || !isset($pricing[$group]) || !is_array($pricing[$group])) {
                        return response()->json(['message' => "Option invalide à l'index {$idx}."], 422);
                    }

                    $row = collect($pricing[$group])->first(function ($r) use ($nom) {
                        return is_array($r) && ($r['nom'] ?? null) === $nom;
                    });

                    if (!$row || empty($row['enabled'])) {
                        return response()->json(['message' => "Option non disponible: {$nom}."], 422);
                    }

                    $price = isset($row['prix']) ? (float) $row['prix'] : 0.0;
                    $unit = $row['unite'] ?? null; // e.g. MAD/m², MAD/service
                    if ($price <= 0) {
                        return response()->json(['message' => "Option sans prix valide: {$nom}."], 422);
                    }

                    // For MAD/service, quantity is forced to 1
                    if (is_string($unit) && stripos($unit, '/service') !== false) {
                        $qty = 1.0;
                    } elseif ($qty <= 0) {
                        return response()->json(['message' => "Quantité invalide pour l'option {$nom}."], 422);
                    }

                    $lineTotal = $price * $qty;
                    $total += $lineTotal;

                    $optionsComputed[] = [
                        'group' => $group,
                        'nom' => $nom,
                        'prix_unitaire' => $price,
                        'unite' => $unit,
                        'quantite' => $qty,
                        'total' => round($lineTotal, 2),
                    ];
                }
            }

            if (!empty($optionsComputed)) {
                $breakdown['options'] = $optionsComputed;
            }

            $params['computed_total'] = round($total, 2);
            $params['breakdown'] = $breakdown;

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
                // Always store computed estimate when possible
                'prix_total' => round($total, 2) > 0 ? round($total, 2) : ($validated['prix_total'] ?? null),
                'parametres_demande' => $params,
                'statut' => 'en_attente',
            ]);
        }
        
        return response()->json([
            'message' => 'Demande créée avec succès',
            'demande' => $demande->load(['service', 'service.intervenant', 'items']),
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