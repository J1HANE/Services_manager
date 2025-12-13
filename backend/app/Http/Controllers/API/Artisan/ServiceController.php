<?php

namespace App\Http\Controllers\API\Artisan;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Lister les services de l'artisan connecté.
     * Route: GET /api/my-services
     */
    public function index()
    {
        // TODO: Récupérer l'ID de l'artisan connecté via Auth.
        // TODO: Retourner la liste de ses services depuis la BDD.
    }

    /**
     * Créer un nouveau service (Peinture, Elec...).
     * Route: POST /api/services
     */
    public function store(Request $request)
    {
        // Get authenticated user ID
        $intervenantId = $request->user()->id;

        // New schema prefers (type_service + sub_service_id + prix + unite_prix).
        // We keep backward compatibility with the old "categories" payload temporarily.
        $validated = $request->validate([
            'type_service' => 'required|in:electricite,peinture,menuiserie',
            'sub_service_id' => 'nullable|integer|exists:sub_services,id',
            'prix' => 'nullable|numeric|min:0.01',
            'unite_prix' => 'nullable|in:par_heure,par_m2,par_unite,par_service,forfait',

            'titre' => 'nullable|string|max:150',
            'description' => 'nullable|string',
            'ville' => 'nullable|string|max:100',
            'adresse' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'rayon_km' => 'nullable|integer|min:1|max:200',
            'image_principale' => 'nullable|image|max:2048',
            'images_supplementaires.*' => 'nullable|image|max:2048',
            'disponibilites' => 'nullable|json',
            'parametres_specifiques' => 'nullable|json',

            // Legacy
            'categories' => 'nullable|json',
        ]);

        // Check if artisan already has too many services (configurable limit)
        // Set MAX_SERVICES_PER_INTERVENANT in .env (default: 2). Use 0 to disable the limit.
        $maxServices = (int) env('MAX_SERVICES_PER_INTERVENANT', 2);
        $existingServicesCount = \App\Models\Service::where('intervenant_id', $intervenantId)->count();
        if ($maxServices > 0 && $existingServicesCount >= $maxServices) {
            return response()->json([
                'success' => false,
                'message' => "Vous avez atteint la limite de {$maxServices} service(s) par intervenant.",
            ], 422);
        }

        // Handle main image upload
        $imagePrincipale = null;
        if ($request->hasFile('image_principale')) {
            $path = $request->file('image_principale')->store('services', 'public');
            $imagePrincipale = '/storage/' . $path;
        }

        // Handle additional images
        $imagesSupplementaires = [];
        if ($request->hasFile('images_supplementaires')) {
            foreach ($request->file('images_supplementaires') as $image) {
                $path = $image->store('services', 'public');
                $imagesSupplementaires[] = '/storage/' . $path;
            }
        }

        // Parse JSON fields
        $parametresSpecifiques = $request->has('parametres_specifiques') ? json_decode($request->parametres_specifiques, true) : null;
        $categoriesData = $request->has('categories') ? json_decode($request->categories, true) : null;
        $disponibilitesData = $request->has('disponibilites') ? json_decode($request->disponibilites, true) : [];

        // Load normalized type
        $serviceType = $validated['type_service'];
        $serviceTypeRow = \App\Models\ServiceType::where('code', $serviceType)->first();

        // New preferred flow: sub_service_id + prix + unite_prix
        $usingNewSchema = !empty($validated['sub_service_id']);

        if ($usingNewSchema) {
            if (!$serviceTypeRow) {
                return response()->json(['success' => false, 'message' => 'Type de service invalide.'], 422);
            }

            $sub = \App\Models\SubService::with('serviceType')
                ->where('id', $validated['sub_service_id'])
                ->first();

            if (!$sub || !$sub->serviceType || $sub->serviceType->code !== $serviceType) {
                return response()->json([
                    'success' => false,
                    'message' => 'Le sous-service choisi ne correspond pas au type de service.',
                ], 422);
            }

            if (empty($validated['prix']) || empty($validated['unite_prix'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Prix et unité sont requis pour publier un sous-service.',
                ], 422);
            }

            $titreAuto = $sub->nom;
            $descAuto = $sub->description ?: ("Sous-service: " . $sub->nom);

            $service = \App\Models\Service::create([
                'intervenant_id' => $intervenantId,
                // Keep legacy column for now
                'type_service' => $serviceType,
                'service_type_id' => $serviceTypeRow->id,
                'sub_service_id' => $sub->id,
                'prix' => $validated['prix'],
                'unite_prix' => $validated['unite_prix'],

                'titre' => $validated['titre'] ?? $titreAuto,
                'description' => $validated['description'] ?? $descAuto,
                'ville' => $validated['ville'] ?? null,
                'adresse' => $validated['adresse'] ?? null,
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'rayon_km' => $validated['rayon_km'] ?? 20,
                'image_principale' => $imagePrincipale,
                'images_supplementaires' => $imagesSupplementaires,
                'parametres_specifiques' => $parametresSpecifiques,
                'est_actif' => true,
                'statut' => 'actif',
            ]);

            // Legacy extras: if categories contains materiel/autre, keep saving them
            if (is_array($categoriesData) && count($categoriesData) > 0) {
                foreach ($categoriesData as $categoryData) {
                    if (!is_array($categoryData)) continue;
                    $catId = $categoryData['category_id'] ?? null;
                    if (!$catId) continue;
                    $cat = \App\Models\Categorie::find($catId);
                    if (!$cat) continue;
                    if (in_array($cat->type_categorie, ['materiel', 'autre'], true)) {
                        \App\Models\ServiceCategorie::create([
                            'service_id' => $service->id,
                            'category_id' => $catId,
                            'prix' => $categoryData['prix'] ?? 0,
                            'unite_prix' => $categoryData['unite_prix'] ?? 'par_service',
                        ]);
                    }
                }
            }

            // Create disponibilites (availability days)
            if (!empty($disponibilitesData)) {
                foreach ($disponibilitesData as $day) {
                    \App\Models\Disponibilite::create([
                        'service_id' => $service->id,
                        'type_disponibilite' => 'regular',
                        'jour_semaine' => $day,
                    ]);
                }
            }

            $service->load(['intervenant', 'subService', 'serviceType', 'serviceCategories.categorie', 'disponibilites']);

            return response()->json([
                'success' => true,
                'message' => 'Service créé avec succès',
                'data' => $service,
            ], 201);
        }

        // Legacy flow: categories payload required
        if (!is_array($categoriesData) || count($categoriesData) === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Le champ categories est requis (ou utilisez sub_service_id + prix + unite_prix).',
            ], 422);
        }

        $allowedUnits = ['par_heure', 'par_m2', 'par_unite', 'par_service', 'forfait'];
        $categoryIds = collect($categoriesData)->pluck('category_id')->filter()->unique()->values();

        $dbCategories = \App\Models\Categorie::whereIn('id', $categoryIds)->get()->keyBy('id');
        if ($dbCategories->count() !== $categoryIds->count()) {
            return response()->json([
                'success' => false,
                'message' => 'Une ou plusieurs catégories sont invalides.',
            ], 422);
        }

        $serviceSubServiceCount = 0;
        $legacySubServiceName = null;
        $legacySubServiceDesc = null;
        $legacySubServicePrice = null;
        $legacySubServiceUnit = null;

        foreach ($categoriesData as $idx => $catData) {
            if (!is_array($catData)) {
                return response()->json([
                    'success' => false,
                    'message' => "Catégorie invalide à l'index {$idx}.",
                ], 422);
            }

            $catId = $catData['category_id'] ?? null;
            $prix = $catData['prix'] ?? null;
            $unite = $catData['unite_prix'] ?? null;

            if (!$catId || !isset($dbCategories[$catId])) {
                return response()->json([
                    'success' => false,
                    'message' => "category_id manquant ou invalide à l'index {$idx}.",
                ], 422);
            }

            if (!is_numeric($prix) || (float) $prix <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => "prix invalide à l'index {$idx} (doit être > 0).",
                ], 422);
            }

            if (!in_array($unite, $allowedUnits, true)) {
                return response()->json([
                    'success' => false,
                    'message' => "unite_prix invalide à l'index {$idx}.",
                ], 422);
            }

            $dbCat = $dbCategories[$catId];

            // Ensure category belongs to the same main service type
            if ($dbCat->type_service !== $serviceType) {
                return response()->json([
                    'success' => false,
                    'message' => "La catégorie '{$dbCat->nom}' ne correspond pas au type de service '{$serviceType}'.",
                ], 422);
            }

            // Enforce exactly one sub-service (type_categorie=service) chosen by the artisan
            if ($dbCat->type_categorie === 'service') {
                $serviceSubServiceCount++;
                $legacySubServiceName = $dbCat->nom;
                $legacySubServiceDesc = $dbCat->description ?? null;
                $legacySubServicePrice = $prix;
                $legacySubServiceUnit = $unite;
            }
        }

        if ($serviceSubServiceCount !== 1) {
            return response()->json([
                'success' => false,
                'message' => "Vous devez choisir exactement 1 sous-service (type_categorie=service).",
            ], 422);
        }

        // Ensure service_type exists (new schema) and create a matching sub_service automatically for legacy payload
        if ($serviceTypeRow && $legacySubServiceName) {
            $sub = \App\Models\SubService::updateOrCreate(
                ['service_type_id' => $serviceTypeRow->id, 'nom' => $legacySubServiceName],
                ['description' => $legacySubServiceDesc]
            );
        } else {
            $sub = null;
        }

        // Create the service
        $service = \App\Models\Service::create([
            'intervenant_id' => $intervenantId,
            'type_service' => $validated['type_service'],
            'service_type_id' => $serviceTypeRow?->id,
            'sub_service_id' => $sub?->id,
            'prix' => $legacySubServicePrice,
            'unite_prix' => $legacySubServiceUnit,
            'titre' => $validated['titre'],
            'description' => $validated['description'] ?? null,
            'ville' => $validated['ville'] ?? null,
            'adresse' => $validated['adresse'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'rayon_km' => $validated['rayon_km'] ?? 20,
            'image_principale' => $imagePrincipale,
            'images_supplementaires' => $imagesSupplementaires,
            'parametres_specifiques' => $parametresSpecifiques,
            'est_actif' => true,
            'statut' => 'actif',
        ]);

        // Create service_categories pivot entries
        foreach ($categoriesData as $categoryData) { // Use $categoriesData
            \App\Models\ServiceCategorie::create([
                'service_id' => $service->id,
                'category_id' => $categoryData['category_id'],
                'prix' => $categoryData['prix'],
                'unite_prix' => $categoryData['unite_prix'],
            ]);
        }

        // Create disponibilites (availability days)
        if (!empty($disponibilitesData)) {
            foreach ($disponibilitesData as $day) {
                \App\Models\Disponibilite::create([
                    'service_id' => $service->id,
                    'type_disponibilite' => 'regular',
                    'jour_semaine' => $day,
                ]);
            }
        }

        // Load relationships for response
        $service->load(['intervenant', 'serviceCategories.categorie', 'disponibilites']);

        return response()->json([
            'success' => true,
            'message' => 'Service créé avec succès',
            'data' => $service,
        ], 201);
    }

    /**
     * Mettre à jour un service existant.
     * Route: PUT /api/services/{id}
     */
    public function update(Request $request, string $id)
    {
        // TODO: Vérifier que le service appartient bien à l'artisan connecté.
        // TODO: Mettre à jour les champs modifiables.
    }

    /**
     * Activer ou Désactiver un service (Switch ON/OFF).
     * Route: PATCH /api/services/{id}/toggle
     */
    public function toggleStatus(string $id)
    {
        // TODO: Récupérer le service.
        // TODO: Inverser le booléen 'est_actif'.
        // TODO: Sauvegarder.
    }
}
