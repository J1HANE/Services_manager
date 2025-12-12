<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use App\Models\Justificatif;
use App\Models\Reclamation;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\DB;

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
            
            // Réclamations
            'reclamations' => Reclamation::count(),
            'reclamations_en_attente' => Reclamation::where('statut', 'en_attente')->count(),
            'reclamations_en_cours' => Reclamation::where('statut', 'en_cours')->count(),
            'reclamations_resolue' => Reclamation::where('statut', 'resolue')->count(),
            
            // Commissions (20% de chaque demande terminée)
            'commissions_total' => Demande::where('statut', 'termine')
                ->sum(DB::raw('prix_total * 0.20')),
            'commissions_ce_mois' => Demande::where('statut', 'termine')
                ->whereMonth('updated_at', now()->month)
                ->whereYear('updated_at', now()->year)
                ->sum(DB::raw('prix_total * 0.20')),
            'commissions_mois_dernier' => Demande::where('statut', 'termine')
                ->whereMonth('updated_at', now()->subMonth()->month)
                ->whereYear('updated_at', now()->subMonth()->year)
                ->sum(DB::raw('prix_total * 0.20')),
            'affaires_terminees' => Demande::where('statut', 'termine')->count(),
            'affaires_ce_mois' => Demande::where('statut', 'termine')
                ->whereMonth('updated_at', now()->month)
                ->whereYear('updated_at', now()->year)
                ->count(),
            
            // Graphiques - Commissions par mois (6 derniers mois)
            'commissions_par_mois' => $this->getCommissionsParMois(),
            
            // Graphiques - Demandes par statut
            'demandes_par_statut' => [
                'en_attente' => Demande::where('statut', 'en_attente')->count(),
                'accepte' => Demande::where('statut', 'accepte')->count(),
                'termine' => Demande::where('statut', 'termine')->count(),
                'refuse' => Demande::where('statut', 'refuse')->count(),
            ],
            
            // Graphiques - Services par type
            'services_par_type' => Service::select('type_service', DB::raw('count(*) as total'))
                ->groupBy('type_service')
                ->get()
                ->pluck('total', 'type_service'),
        ]);
    }
    
    /**
     * Récupère les commissions par mois (6 derniers mois)
     */
    private function getCommissionsParMois()
    {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthName = $date->format('M Y');
            $commission = Demande::where('statut', 'termine')
                ->whereMonth('updated_at', $date->month)
                ->whereYear('updated_at', $date->year)
                ->sum(DB::raw('prix_total * 0.20'));
            
            $months[] = [
                'mois' => $monthName,
                'commission' => round($commission, 2),
            ];
        }
        return $months;
    }
}
