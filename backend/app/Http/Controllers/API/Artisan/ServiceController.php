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
        // TODO: Vérifier que l'artisan n'a pas déjà 2 services (Limite).
        // TODO: Valider les inputs (titre, ville, rayon_km, parametres_specifiques JSON).
        // TODO: Créer le service en BDD et retourner le service créé.
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