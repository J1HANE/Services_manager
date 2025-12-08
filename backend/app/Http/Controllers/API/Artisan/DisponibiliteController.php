<?php

namespace App\Http\Controllers\API\Artisan;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DisponibiliteController extends Controller
{
    /**
     * Récupérer les disponibilités d'un service.
     * Route: GET /api/services/{serviceId}/disponibilites
     */
    public function index(string $serviceId)
    {
        // TODO: Vérifier que le service appartient à l'artisan connecté.
        // TODO: Retourner la liste des jours travaillés (type='semaine').
        // TODO: Retourner la liste des congés/exceptions (type='date').
    }

    /**
     * Mettre à jour la semaine type (Lundi au Vendredi).
     * Route: PUT /api/services/{serviceId}/disponibilites/semaine
     */
    public function updateWeek(Request $request, string $serviceId)
    {
        // TODO: Recevoir un tableau des jours ouverts (ex: [1, 2, 3, 4, 5]).
        // TODO: Supprimer les anciennes entrées 'semaine' pour ce service.
        // TODO: Créer les nouvelles entrées dans la table 'disponibilites' avec type='semaine'.
    }

    /**
     * Ajouter une date d'indisponibilité (Congés, Maladie).
     * Route: POST /api/services/{serviceId}/disponibilites/date
     */
    public function addException(Request $request, string $serviceId)
    {
        // TODO: Valider la date spécifique.
        // TODO: Créer une entrée avec type='date' et est_disponible=false.
    }

    /**
     * Supprimer une exception (Annuler un congé).
     * Route: DELETE /api/disponibilites/{id}
     */
    public function destroyException(string $id)
    {
        // TODO: Vérifier que l'exception appartient à un service de l'artisan.
        // TODO: Supprimer la ligne.
    }
}