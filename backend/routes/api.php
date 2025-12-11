<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ==============================================================================
// 1. IMPORTATION DES CONTRÔLEURS
// (On charge ici tous les fichiers que nous avons créés dans les étapes précédentes)
// ==============================================================================

// Module Auth
use App\Http\Controllers\API\Auth\AuthController;

// Module Artisan
use App\Http\Controllers\API\Artisan\ServiceController;
use App\Http\Controllers\API\Artisan\JustificatifController;
use App\Http\Controllers\API\Artisan\DisponibiliteController;

// Module Client
use App\Http\Controllers\API\Client\SearchController;
use App\Http\Controllers\API\Client\DemandeController;

// Module Mission (Workflow)
use App\Http\Controllers\API\Mission\MissionWorkflowController;
use App\Http\Controllers\API\Mission\ReviewController;

// Module Admin
use App\Http\Controllers\API\Admin\DashboardController;
use App\Http\Controllers\API\Admin\DocumentValidationController;
use App\Http\Controllers\API\Admin\UserManagementController;
use App\Http\Controllers\API\Artisan\CategoryController;

/*
|--------------------------------------------------------------------------
| API ROUTES - MEDINA BRUSH
|--------------------------------------------------------------------------
|
| Ce fichier est le "Menu" du Backend.
| L'équipe React doit utiliser ces URLs (Endpoints) pour communiquer avec Laravel.
|
*/

// ====================================================
// SECTION 1 : ROUTES PUBLIQUES (ACCESSIBLES SANS CONNEXION)
// ====================================================

// --- AUTHENTIFICATION ---
// React envoie {nom, email, password, role...} pour inscrire un nouvel utilisateur
Route::post('/register', [AuthController::class, 'register']);

// React envoie {email, password} pour connecter l'utilisateur et récupérer le Token
Route::post('/login', [AuthController::class, 'login']);

// --- RECHERCHE & CONSULTATION (Visiteurs & Clients) ---
// Liste des artisans avec filtres (ex: /api/search?ville=Tanger&service=peinture)
Route::get('/search', [SearchController::class, 'search']);

// Voir le profil public d'un artisan (Bio, Portfolio, Avis)
Route::get('/artisan/{id}', [SearchController::class, 'showProfile']);

// --- HELPERS (Listes déroulantes pour le Frontend) ---
// Récupérer la liste des catégories (ex: pour remplir le select "Type de travaux")
Route::get('/categories', [CategoryController::class, 'index']); // Ou une closure simple si pas de controller

// --- TEMPORARY: Service creation without auth (for testing until login is implemented) ---
// TODO: Move this back inside auth:sanctum middleware once authentication is working
Route::post('/services', [ServiceController::class, 'store']);


// ====================================================
// SECTION 2 : ROUTES PROTÉGÉES (TOKEN REQUIS)
// ====================================================
// Tout ce qui est ici nécessite que React envoie le "Bearer Token" dans le Header.
Route::middleware('auth:sanctum')->group(function () {

    // --------------------------------------------------
    // A. GESTION DU COMPTE (Commun à tous)
    // --------------------------------------------------

    // Déconnexion (Supprime le token actif)
    Route::post('/logout', [AuthController::class, 'logout']);

    // "Qui suis-je ?" - React appelle ça au chargement pour savoir si l'user est connecté
    Route::get('/me', [AuthController::class, 'me']);


    // --------------------------------------------------
    // B. ESPACE ARTISAN (Gestion de l'offre)
    // --------------------------------------------------

    // 1. Gestion des Services
    Route::get('/my-services', [ServiceController::class, 'index']);        // Dashboard: Voir mes services
    // Route::post('/services', [ServiceController::class, 'store']);       // MOVED TO PUBLIC ROUTES (temporarily)
    Route::put('/services/{id}', [ServiceController::class, 'update']);     // Modifier prix/description
    Route::patch('/services/{id}/toggle', [ServiceController::class, 'toggleStatus']); // Activer/Désactiver (Switch)

    // 2. Disponibilités (Agenda)
    Route::get('/services/{serviceId}/disponibilites', [DisponibiliteController::class, 'index']); // Voir agenda
    Route::put('/services/{serviceId}/disponibilites/semaine', [DisponibiliteController::class, 'updateWeek']); // Définir semaine type
    Route::post('/services/{serviceId}/disponibilites/date', [DisponibiliteController::class, 'addException']); // Ajouter congé
    Route::delete('/disponibilites/{id}', [DisponibiliteController::class, 'destroyException']); // Annuler congé

    // 3. Justificatifs (Documents)
    Route::post('/justificatifs', [JustificatifController::class, 'upload']); // Upload photo -> Déclenche Job IA
    Route::get('/justificatifs/status', [JustificatifController::class, 'status']); // Vérifier si je suis validé


    // --------------------------------------------------
    // C. ESPACE CLIENT (Demandes)
    // --------------------------------------------------

    // Envoyer une demande de mission à un artisan
    Route::post('/demandes', [DemandeController::class, 'store']);

    // Voir l'historique de mes demandes (Dashboard Client)
    Route::get('/demandes', [DemandeController::class, 'index']);


    // --------------------------------------------------
    // D. WORKFLOW MISSION (Interactions)
    // --------------------------------------------------

    // Actions de l'ARTISAN sur une demande reçue
    Route::patch('/missions/{id}/accept', [MissionWorkflowController::class, 'accept']);   // Accepter la mission
    Route::patch('/missions/{id}/refuse', [MissionWorkflowController::class, 'refuse']);   // Refuser la mission
    Route::patch('/missions/{id}/complete', [MissionWorkflowController::class, 'complete']); // Terminer (Cash reçu)

    // Actions du CLIENT après la mission
    Route::post('/reviews', [ReviewController::class, 'store']); // Laisser une note et un avis


    // --------------------------------------------------
    // E. ESPACE ADMIN (Back-Office)
    // --------------------------------------------------
    // (Idéalement, ajouter un Middleware 'admin' ici plus tard pour sécuriser)

    // Statistiques globales du dashboard
    Route::get('/admin/stats', [DashboardController::class, 'stats']);

    // Gestion des Utilisateurs (Bannissement)
    Route::get('/admin/users', [UserManagementController::class, 'index']);      // Liste tous les inscrits
    Route::get('/admin/users/{id}', [UserManagementController::class, 'show']);  // Détail d'un user
    Route::patch('/admin/users/{id}/ban', [UserManagementController::class, 'toggleBan']); // Bannir/Débannir

    // Validation des Documents
    Route::get('/admin/documents', [DocumentValidationController::class, 'index']); // Liste docs en attente
    Route::post('/admin/documents/{id}/validate', [DocumentValidationController::class, 'validateDoc']); // Valider manuel
});