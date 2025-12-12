<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    /**
     * Route: GET /api/admin/users
     */
    public function index(Request $request)
    {
        $query = User::query()->select([
            'id',
            'nom',
            'prenom',
            'email',
            'role',
            'telephone',
            'est_verifie',
            'is_banned',
            'created_at',
        ])->orderByDesc('id');

        if ($request->filled('role')) {
            $query->where('role', $request->string('role'));
        }

        if ($request->filled('est_verifie')) {
            $query->where('est_verifie', filter_var($request->string('est_verifie'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('is_banned')) {
            $query->where('is_banned', filter_var($request->string('is_banned'), FILTER_VALIDATE_BOOLEAN));
        }

        // Simple pagination (optional)
        if ($request->filled('per_page')) {
            $perPage = max(1, min(100, (int) $request->input('per_page')));
            return response()->json($query->paginate($perPage));
        }

        return response()->json($query->get());
    }

    /**
     * Route: GET /api/admin/users/{id}
     */
    public function show(string $id)
    {
        $user = User::findOrFail($id);

        $data = [
            'user' => $user,
        ];

        if ($user->role === 'intervenant') {
            $data['services_count'] = Service::where('intervenant_id', $user->id)->count();
            $data['demandes_count'] = Demande::whereHas('service', fn ($q) => $q->where('intervenant_id', $user->id))->count();
        }

        if ($user->role === 'client') {
            $data['demandes_count'] = Demande::where('client_id', $user->id)->count();
        }

        return response()->json($data);
    }

    /**
     * Route: PATCH /api/admin/users/{id}/ban
     */
    public function toggleBan(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        // Prevent banning self-admin by mistake (optional safety)
        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Impossible de bannir un admin.',
            ], 422);
        }

        $user->is_banned = !$user->is_banned;
        $user->save();

        // Force logout: revoke all tokens
        if ($user->is_banned) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => $user->is_banned ? 'Utilisateur banni' : 'Utilisateur réactivé',
            'user' => $user,
        ]);
    }

    /**
     * Route: PATCH /api/admin/users/{id}/verify
     */
    public function toggleVerify(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        $user->est_verifie = !$user->est_verifie;
        $user->save();

        return response()->json([
            'message' => $user->est_verifie ? 'Utilisateur vérifié' : 'Vérification retirée',
            'user' => $user,
        ]);
    }
}
