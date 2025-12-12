<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Justificatif;
use App\Models\User;
use Illuminate\Http\Request;

class DocumentValidationController extends Controller
{
    /**
     * Route: GET /api/admin/documents
     */
    public function index()
    {
        $docs = Justificatif::with(['intervenant:id,email,nom,prenom,est_verifie,is_banned'])
            ->orderByDesc('id')
            ->get();

        return response()->json($docs);
    }

    /**
     * Route: POST /api/admin/documents/{id}/validate
     */
    public function validateDoc(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:validated,rejected',
            'commentaire_admin' => 'nullable|string',
        ]);

        $doc = Justificatif::with('intervenant')->findOrFail($id);

        if ($request->status === 'validated') {
            $doc->statut = 'valide';
            $doc->est_verifiee = true;
            $doc->commentaire_admin = $request->commentaire_admin;
            $doc->save();

            // If all docs for intervenant are validated, mark user verified.
            $hasPending = Justificatif::where('intervenant_id', $doc->intervenant_id)
                ->where('statut', 'en_attente')
                ->exists();

            if (!$hasPending) {
                User::where('id', $doc->intervenant_id)->update(['est_verifie' => true]);
            }
        } else {
            $doc->statut = 'refuse';
            $doc->est_verifiee = false;
            $doc->commentaire_admin = $request->commentaire_admin;
            $doc->save();

            User::where('id', $doc->intervenant_id)->update(['est_verifie' => false]);
        }

        return response()->json([
            'message' => 'Document mis à jour',
            'document' => $doc,
        ]);
    }
}
