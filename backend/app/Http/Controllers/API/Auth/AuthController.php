<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    /**
     * Register a new user via API
     */
    public function register(Request $request)
    {
        $request->headers->set('Accept', 'application/json');

        $request->validate([
            'role' => 'required|in:client,intervenant',
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'telephone' => 'nullable|string|max:50',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $userData = [
            'role' => $request->role,
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'mot_de_passe' => Hash::make($request->password),
        ];

        try {
            $user = User::create($userData);

            return response()->json([
                'message' => 'Utilisateur créé avec succès',
                'user' => $user,
            ], 201);
        } catch (QueryException $qe) {
            Log::error('DB QueryException on user create', [
                'error' => $qe->getMessage(),
            ]);

            return response()->json([
                'message' => 'Erreur base de données lors de la création de l\'utilisateur',
            ], 500);
        } catch (\Throwable $e) {
            Log::error('Unexpected error on register', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Erreur serveur inattendue',
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

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
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $userData = $user->toArray();
        if (!empty($user->photo_profil)) {
            // provide full url if stored on public disk
            $userData['photo_profil_url'] = Storage::disk('public')->url($user->photo_profil);
        } else {
            $userData['photo_profil_url'] = null;
        }

        return response()->json([
            'user' => $userData,
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
