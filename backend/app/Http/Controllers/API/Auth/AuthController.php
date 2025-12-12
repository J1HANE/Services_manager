<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use App\Models\Metier;

class AuthController extends Controller
{
   public function register(Request $request)
{
    // Validation - METIERS au pluriel, pas METIER
    $validated = $request->validate([
        'nom' => 'required|string|max:100',
        'prenom' => 'required|string|max:100',
        'email' => 'required|email|unique:users',
        'telephone' => 'nullable|string|max:50',
        'password' => 'required|min:8|confirmed',
        'role' => 'required|in:client,intervenant,admin',
        'metiers' => 'nullable|json', // ← CHANGÉ: 'metiers' pas 'metier'
        'principal_metier' => 'nullable|in:electricien,peintre,menuisier',
        'photo_profil' => 'nullable|image|max:5120',
    ]);

    // Validation pour les intervenants - utiliser $validated['metiers']
    if ($validated['role'] === 'intervenant') {
        $metiers = json_decode($validated['metiers'] ?? '[]', true);
        
        if (empty($metiers)) {
            return response()->json([
                'error' => 'Au moins un métier est requis pour les intervenants'
            ], 422);
        }
        
        if (count($metiers) > 2) {
            return response()->json([
                'error' => 'Maximum 2 métiers autorisés'
            ], 422);
        }
        
        // Valider que le métier principal fait partie des métiers sélectionnés
        if (!empty($validated['principal_metier']) && 
            !in_array($validated['principal_metier'], $metiers)) {
            return response()->json([
                'error' => 'Le métier principal doit faire partie des métiers sélectionnés'
            ], 422);
        }
        
        // Valider que les métiers existent dans la base
        foreach ($metiers as $metierCode) {
            if (!Metier::where('code', $metierCode)->exists()) {
                return response()->json([
                    'error' => "Le métier '$metierCode' n'existe pas"
                ], 422);
            }
        }
    }

    // Les clients ne peuvent pas avoir de métiers
    if ($validated['role'] === 'client' && !empty($validated['metiers'])) {
        return response()->json([
            'error' => 'Les clients ne peuvent pas avoir de métiers'
        ], 422);
    }

    // Gestion de la photo
    $photoPath = null;
    if ($request->hasFile('photo_profil')) {
        $photoPath = $request->file('photo_profil')->store('profile_photos', 'public');
    }

    // Création de l'utilisateur - PAS DE CHAMP 'metier'
    $user = User::create([
        'nom' => $validated['nom'],
        'prenom' => $validated['prenom'],
        'email' => $validated['email'],
        'telephone' => $validated['telephone'] ?? null,
        'mot_de_passe' => Hash::make($validated['password']),
        'role' => $validated['role'],
        'photo_profil' => $photoPath,
        'est_verifie' => false,
        'is_banned' => false,
        'note_moyenne' => 0.00,
        'nb_avis' => 0,
    ]);

    // Ajouter les métiers pour les intervenants
    if ($validated['role'] === 'intervenant' && !empty($metiers)) {
        $principalMetier = $validated['principal_metier'] ?? $metiers[0];
        
        foreach ($metiers as $index => $metierCode) {
            $metier = Metier::where('code', $metierCode)->first();
            
            if ($metier) {
                $user->metiers()->attach($metier->id, [
                    'principal' => ($metierCode === $principalMetier) ? 1 : 0,
                    'ordre' => $index + 1
                ]);
            }
        }
    }

    // Charger l'utilisateur avec ses métiers pour la réponse
    $user->load('metiers');

    return response()->json([
        'message' => 'Inscription réussie',
        'user' => [
            'id' => $user->id,
            'nom' => $user->nom,
            'prenom' => $user->prenom,
            'email' => $user->email,
            'role' => $user->role,
            'metiers' => $user->metiers->map(function ($metier) {
                return [
                    'code' => $metier->code,
                    'nom' => $metier->nom,
                    'principal' => $metier->pivot->principal
                ];
            }),
            'principal_metier' => $user->metiers->where('pivot.principal', 1)->first()?->code,
            'photo_profil' => $photoPath ? asset('storage/' . $photoPath) : null,
            'telephone' => $user->telephone,
        ]
    ], 201);
}

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        // ✅ CORRECTION ICI : Vérifie le mot de passe correctement
        if (!$user || !Hash::check($request->password, $user->mot_de_passe)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect',
            ], 401);
        }

        if ($user->is_banned) {
            return response()->json([
                'message' => 'Compte banni. Contactez le support.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => [
                'id' => $user->id,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'role' => $user->role,
                'metier' => $user->metier,
                'photo_profil' => $user->photo_profil ? Storage::url($user->photo_profil) : null,
            ],
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'role' => $user->role,
                'metier' => $user->metier,
                'telephone' => $user->telephone,
                'photo_profil' => $user->photo_profil ? Storage::url($user->photo_profil) : null,
                'est_verifie' => $user->est_verifie,
                'note_moyenne' => $user->note_moyenne,
                'nb_avis' => $user->nb_avis,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->currentAccessToken()?->delete();
        }

        return response()->json([
            'message' => 'Déconnecté',
        ]);
    }
}