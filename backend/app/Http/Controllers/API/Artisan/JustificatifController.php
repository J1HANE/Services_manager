<?php

namespace App\Http\Controllers\API\Artisan;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
// use App\Jobs\VerifyDocumentWithAI; // Décommenter quand tu coderas

class JustificatifController extends Controller
{
    /**
     * Téléverser un document (CNI, Assurance).
     * Route: POST /api/justificatifs
     */
    public function upload(Request $request)
    {
        // TODO: Valider que c'est bien un fichier image ou PDF.
        // TODO: Sauvegarder le fichier dans le stockage (Storage/public).
        // TODO: Créer une entrée dans la table 'justificatifs' statut 'en_attente'.
        // TODO: Dispatcher le Job 'VerifyDocumentWithAI' pour analyse asynchrone.
    }

    /**
     * Vérifier le statut de validation des documents.
     * Route: GET /api/justificatifs/status
     */
    public function status()
    {
        // TODO: Retourner si l'artisan est 'validé', 'en_attente' ou 'rejeté'.
    }
}