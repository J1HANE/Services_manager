<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Database\QueryException;

class AuthController extends Controller
{
    /**
     * Register a new user via API
     */
    public function register(Request $request)
    {
        // Force JSON responses for safety
        $request->headers->set('Accept', 'application/json');

        Log::info('API Register endpoint hit', $request->all());

        // Validation
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
            // Hash explicitement et écrire dans la colonne existante mot_de_passe
            'mot_de_passe' => Hash::make($request->password),
        ];

        try {
            Log::info('Attempting to create user (email masked)', ['email' => $request->email]);

            $user = User::create($userData);

            Log::info('User created successfully', ['id' => $user->id, 'email' => $user->email]);

            // Retour JSON propre (masque mot_de_passe dans hidden du model)
            return response()->json([
                'message' => 'Utilisateur créé avec succès',
                'user' => $user
            ], 201);
        } catch (QueryException $qe) {
            Log::error('DB QueryException on user create', [
                'error' => $qe->getMessage(),
                'bindings' => $qe->getBindings() ?? null
            ]);

            return response()->json([
                'message' => 'Erreur base de données lors de la création de l\'utilisateur',
                'error' => $qe->getMessage()
            ], 500);
        } catch (\Throwable $e) {
            Log::error('Unexpected error on register', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return response()->json([
                'message' => 'Erreur serveur inattendue',
                'error' => $e->getMessage()
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
            'message' => 'Email ou mot de passe incorrect'
        ], 401);
    }

    // si tu utilises Sanctum, créer un token
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Connexion réussie',
        'user' => $user,
        'token' => $token
    ]);
}

}
