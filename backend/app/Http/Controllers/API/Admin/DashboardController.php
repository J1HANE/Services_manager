<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use App\Models\Justificatif;
use App\Models\Service;
use App\Models\User;

class DashboardController extends Controller
{
    /**
     * Route: GET /api/admin/stats
     */
    public function stats()
    {
        return response()->json([
            'users' => User::count(),
            'intervenants' => User::where('role', 'intervenant')->count(),
            'clients' => User::where('role', 'client')->count(),
            'admins' => User::where('role', 'admin')->count(),
            'users_verifies' => User::where('est_verifie', true)->count(),
            'users_bannis' => User::where('is_banned', true)->count(),
            'services' => Service::count(),
            'services_actifs' => Service::where('statut', 'actif')->where('est_actif', true)->count(),
            'services_archives' => Service::where('statut', 'archive')->count(),
            'demandes' => Demande::count(),
            'demandes_en_attente' => Demande::where('statut', 'en_attente')->count(),
            'demandes_acceptees' => Demande::where('statut', 'accepte')->count(),
            'demandes_terminees' => Demande::where('statut', 'termine')->count(),
            'documents_en_attente' => Justificatif::where('statut', 'en_attente')->count(),
            'documents_valides' => Justificatif::where('statut', 'valide')->count(),
            'documents_refuses' => Justificatif::where('statut', 'refuse')->count(),
        ]);
    }
}
