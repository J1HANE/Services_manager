<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Retourne les informations de l'utilisateur authentifié
     */
    public function show(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * Met à jour le profil de l'utilisateur authentifié
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nom' => 'sometimes|required|string|max:100',
            'prenom' => 'sometimes|required|string|max:100',
            'surnom' => 'sometimes|nullable|string|max:100',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'telephone' => 'sometimes|nullable|string|max:50',
            'mot_de_passe' => 'sometimes|nullable|string|min:8|confirmed',
            'photo_profil' => 'sometimes|file|image|max:5120', // max 5MB
        ]);

        $data = $request->only(['nom', 'prenom', 'surnom', 'email', 'telephone']);

        if ($request->filled('mot_de_passe')) {
            $data['mot_de_passe'] = Hash::make($request->mot_de_passe);
        }

        // Handle profile photo upload (optional)
        if ($request->hasFile('photo_profil')) {
            try {
                $file = $request->file('photo_profil');
                $path = $file->store('profile_photos', 'public');

                // Optionally delete previous photo if exists
                if (!empty($user->photo_profil) && Storage::disk('public')->exists($user->photo_profil)) {
                    Storage::disk('public')->delete($user->photo_profil);
                }

                $data['photo_profil'] = $path; // store path relative to storage/app/public
            } catch (\Throwable $e) {
                Log::warning('Failed to store profile photo', ['error' => $e->getMessage()]);
            }
        }

        try {
            $user->fill($data);
            $user->save();

            // If we stored a path, include a full URL for frontend convenience
            $user->refresh();
            $userData = $user->toArray();
            if (!empty($user->photo_profil)) {
                $userData['photo_profil_url'] = Storage::disk('public')->url($user->photo_profil);
            } else {
                $userData['photo_profil_url'] = null;
            }

            return response()->json([
                'message' => 'Profil mis à jour',
                'user' => $userData,
            ]);
        } catch (\Throwable $e) {
            Log::error('Profile update failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur lors de la mise à jour du profil'], 500);
        }
    }
}
