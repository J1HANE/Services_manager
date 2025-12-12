<?php

namespace App\Http\Controllers\API\Artisan;

use App\Http\Controllers\Controller;
use App\Models\Justificatif;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class JustificatifController extends Controller
{
    /**
     * Route: POST /api/justificatifs
     */
    public function upload(Request $request)
    {
        $request->validate([
            'type_document' => 'required|string|max:100',
            'titre' => 'nullable|string|max:150',
            'service_id' => 'nullable|integer',
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $user = $request->user();

        $path = $request->file('file')->store('justificatifs', 'public');

        $doc = Justificatif::create([
            'intervenant_id' => $user->id,
            'service_id' => $request->input('service_id'),
            'type_document' => $request->input('type_document'),
            'titre' => $request->input('titre'),
            'informations' => null,
            'nom_fichier' => $request->file('file')->getClientOriginalName(),
            'chemin_fichier' => $path,
            'statut' => 'en_attente',
            'est_verifiee' => false,
            'commentaire_admin' => null,
        ]);

        return response()->json([
            'message' => 'Document envoyé, en attente de validation',
            'document' => $doc,
        ], 201);
    }

    /**
     * Route: GET /api/justificatifs/status
     */
    public function status(Request $request)
    {
        $user = $request->user();

        $latest = Justificatif::where('intervenant_id', $user->id)
            ->orderByDesc('id')
            ->first();

        return response()->json([
            'est_verifie' => (bool) $user->est_verifie,
            'dernier_document' => $latest,
        ]);
    }
}
