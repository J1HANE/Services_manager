<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur (Client ou Artisan).
     * Route: POST /api/register
     */
    public function register(Request $request)
    {
        // TODO: Valider les données (email unique, mot de passe min 8 chars).
        // TODO: Créer l'utilisateur dans la table 'users' avec le rôle choisi.
        // TODO: Créer un Token (Sanctum) et le retourner en JSON.
    }

    /**
     * Connexion d'un utilisateur existant.
     * Route: POST /api/login
     */
    public function login(Request $request)
    {
        // TODO: Valider l'email et le mot de passe.
        // TODO: Vérifier le Hash du mot de passe.
        // TODO: Retourner le Token et le Rôle de l'utilisateur.
    }

    /**
     * Déconnexion (Révoquer le token).
     * Route: POST /api/logout
     */
    public function logout(Request $request)
    {
        // TODO: Récupérer l'utilisateur courant et supprimer son Token actuel.
        // TODO: Retourner un message de succès.
    }

    /**
     * Récupérer les infos de l'utilisateur connecté.
     * Route: GET /api/me
     */
    public function me(Request $request)
    {
        // TODO: Retourner l'objet User complet (sans le mot de passe).
    }
}