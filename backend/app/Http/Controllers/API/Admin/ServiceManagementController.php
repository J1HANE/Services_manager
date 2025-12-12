<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceManagementController extends Controller
{
    /**
     * Route: GET /api/admin/services
     */
    public function index(Request $request)
    {
        $query = Service::with(['intervenant:id,nom,prenom,email'])
            ->select([
                'id',
                'intervenant_id',
                'type_service',
                'titre',
                'description',
                'est_actif',
                'statut',
                'ville',
                'nb_avis',
                'moyenne_note',
                'created_at',
            ])
            ->orderByDesc('id');

        // Filtres
        if ($request->filled('statut')) {
            $query->where('statut', $request->string('statut'));
        }

        if ($request->filled('type_service')) {
            $query->where('type_service', $request->string('type_service'));
        }

        if ($request->filled('est_actif')) {
            $query->where('est_actif', filter_var($request->string('est_actif'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('titre', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('ville', 'like', "%{$search}%");
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
     * Route: GET /api/admin/services/{id}
     */
    public function show(string $id)
    {
        $service = Service::with(['intervenant:id,nom,prenom,email,telephone', 'categories'])
            ->findOrFail($id);

        $service->loadCount('demandes');

        return response()->json($service);
    }

    /**
     * Route: PATCH /api/admin/services/{id}/archive
     */
    public function archive(string $id)
    {
        $service = Service::findOrFail($id);
        $service->statut = 'archive';
        $service->est_actif = false;
        $service->save();

        return response()->json([
            'message' => 'Service archivé avec succès',
            'service' => $service,
        ]);
    }

    /**
     * Route: PATCH /api/admin/services/{id}/activate
     */
    public function activate(string $id)
    {
        $service = Service::findOrFail($id);
        $service->statut = 'actif';
        $service->est_actif = true;
        $service->save();

        return response()->json([
            'message' => 'Service activé avec succès',
            'service' => $service,
        ]);
    }

    /**
     * Route: PATCH /api/admin/services/{id}/toggle-status
     */
    public function toggleStatus(string $id)
    {
        $service = Service::findOrFail($id);
        
        if ($service->statut === 'archive') {
            $service->statut = 'actif';
            $service->est_actif = true;
        } else {
            $service->statut = 'archive';
            $service->est_actif = false;
        }
        
        $service->save();

        return response()->json([
            'message' => $service->statut === 'actif' ? 'Service activé' : 'Service archivé',
            'service' => $service,
        ]);
    }
}

