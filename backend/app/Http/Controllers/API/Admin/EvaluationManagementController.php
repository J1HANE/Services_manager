<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use Illuminate\Http\Request;

class EvaluationManagementController extends Controller
{
    /**
     * Route: GET /api/admin/evaluations
     */
    public function index(Request $request)
    {
        $query = Evaluation::with([
            'demande:id,client_id,service_id,statut,prix_total',
            'demande.client:id,nom,prenom,email',
            'demande.service:id,titre,intervenant_id',
            'demande.service.intervenant:id,nom,prenom,email',
        ])
            ->orderByDesc('created_at');

        // Filtres
        if ($request->filled('cible')) {
            $query->where('cible', $request->string('cible'));
        }

        if ($request->filled('min_note')) {
            $query->where('note_moyenne', '>=', $request->input('min_note'));
        }

        if ($request->filled('max_note')) {
            $query->where('note_moyenne', '<=', $request->input('max_note'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->whereHas('demande.client', function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })->orWhereHas('demande.service.intervenant', function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Pagination
        if ($request->filled('per_page')) {
            $perPage = max(1, min(100, (int) $request->input('per_page')));
            return response()->json($query->paginate($perPage));
        }

        return response()->json($query->get());
    }

    /**
     * Route: GET /api/admin/evaluations/{id}
     */
    public function show(string $id)
    {
        $evaluation = Evaluation::with([
            'demande:id,client_id,service_id,statut,prix_total,description,adresse,ville,date_souhaitee',
            'demande.client:id,nom,prenom,email,telephone',
            'demande.service:id,titre,intervenant_id,type_service',
            'demande.service.intervenant:id,nom,prenom,email,telephone',
            'reclamation',
        ])->findOrFail($id);

        return response()->json($evaluation);
    }

    /**
     * Route: GET /api/admin/evaluations/stats
     */
    public function stats()
    {
        $total = Evaluation::count();
        $pourClients = Evaluation::where('cible', 'client')->count();
        $pourIntervenants = Evaluation::where('cible', 'intervenant')->count();
        $moyenneGenerale = Evaluation::avg('note_moyenne') ?? 0;
        $moyennePonctualite = Evaluation::avg('note_ponctualite') ?? 0;
        $moyenneProprete = Evaluation::avg('note_proprete') ?? 0;
        $moyenneQualite = Evaluation::avg('note_qualite') ?? 0;

        return response()->json([
            'total' => $total,
            'pour_clients' => $pourClients,
            'pour_intervenants' => $pourIntervenants,
            'moyenne_generale' => round($moyenneGenerale, 2),
            'moyenne_ponctualite' => round($moyennePonctualite, 1),
            'moyenne_proprete' => round($moyenneProprete, 1),
            'moyenne_qualite' => round($moyenneQualite, 1),
        ]);
    }
}

