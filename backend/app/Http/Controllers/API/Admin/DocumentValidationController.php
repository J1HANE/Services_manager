<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DocumentValidationController extends Controller
{
    /**
     * Lister les documents en attente de validation.
     * Route: GET /api/admin/documents
     */
    public function index()
    {
        // TODO: Récupérer les justificatifs avec statut 'en_attente'.
    }

    /**
     * Valider ou Rejeter manuellement un document.
     * Route: POST /api/admin/documents/{id}/validate
     */
    public function validateDoc(Request $request, string $id)
    {
        // TODO: Mettre à jour le statut (accepte/refuse).
        // TODO: Si refusé, ajouter un commentaire explicatif pour l'artisan.
        // TODO: Mettre à jour 'est_verifie' sur le User si tous ses docs sont OK.
    }
}