<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    /**
     * Lister tous les utilisateurs (Clients et Artisans).
     * Route: GET /api/admin/users
     */
    public function index(Request $request)
    {
        // TODO: Filtrer par rôle (client/intervenant) si demandé.
        // TODO: Filtrer par statut (vérifié/non vérifié).
        // TODO: Retourner une liste paginée avec les infos principales.
    }

    /**
     * Voir les détails d'un utilisateur spécifique.
     * Route: GET /api/admin/users/{id}
     */
    public function show(string $id)
    {
        // TODO: Récupérer l'utilisateur.
        // TODO: Inclure ses statistiques (missions, avis) si c'est un artisan.
        // TODO: Inclure l'historique de ses demandes si c'est un client.
    }

    /**
     * Bannir ou Réactiver un utilisateur.
     * Route: PATCH /api/admin/users/{id}/ban
     */
    public function toggleBan(Request $request, string $id)
    {
        // TODO: Changer un champ 'is_banned' ou 'statut' (à ajouter en migration si besoin, ou utiliser est_verifie=false).
        // TODO: Invalider ses tokens de connexion (Déconnexion forcée).
    }
}