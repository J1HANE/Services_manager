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

        // Validate incoming data (intervenant_id no longer needed in request)
        $validated = $request->validate([
            'type_service' => 'required|in:electricite,peinture,menuiserie',
            'titre' => 'required|string|max:150',
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
            'categories' => 'required|json',
            'categories.*.category_id' => 'required|exists:categories,id',
            'categories.*.prix' => 'required|numeric|min:0',
            'categories.*.unite_prix' => 'required|in:par_heure,par_m2,par_unite,par_service,forfait',
        ]);

        // Check if artisan already has 2 services (business rule limit)
        $existingServicesCount = \App\Models\Service::where('intervenant_id', $intervenantId)->count();
        if ($existingServicesCount >= 2) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez atteint la limite de 2 services par intervenant.',
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
        $categoriesData = json_decode($request->categories, true);
        $disponibilitesData = $request->has('disponibilites') ? json_decode($request->disponibilites, true) : [];

        // Create the service
        $service = \App\Models\Service::create([
            'intervenant_id' => $intervenantId,
            'type_service' => $validated['type_service'],
            'titre' => $validated['titre'],
            'description' => $validated['description'] ?? null,
            'ville' => $validated['ville'] ?? null,
            'adresse' => $validated['adresse'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'rayon_km' => $validated['rayon_km'] ?? 20,
            'image_principale' => $imagePrincipale,
            'images_supplementaires' => json_encode($imagesSupplementaires),
            'parametres_specifiques' => $parametresSpecifiques,
            'disponibilites' => json_encode($disponibilitesData), // Add disponibilites
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