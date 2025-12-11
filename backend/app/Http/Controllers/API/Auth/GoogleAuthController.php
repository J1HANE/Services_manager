<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Hash;

class GoogleAuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::firstOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'nom' => $googleUser->getName(),
                    'prenom' => $googleUser->getName(),
                    'mot_de_passe' => Hash::make(uniqid()), // mot de passe aléatoire
                    'role' => 'client', // par défaut
                    'est_verifie' => true,
                ]
            );

            // Générer token sanctum
            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur Google OAuth', 'message' => $e->getMessage()], 500);
        }
    }
}
