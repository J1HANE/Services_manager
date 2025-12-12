<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Justificatif extends Model
{
    use HasFactory;

    protected $fillable = [
        'intervenant_id',
        'service_id',
        'type_document',
        'titre',
        'informations',
        'nom_fichier',
        'chemin_fichier',
        'statut',
        'est_verifiee',
        'commentaire_admin',
    ];

    protected $casts = [
        'informations' => 'array',
        'est_verifiee' => 'boolean',
    ];

    public function intervenant()
    {
        return $this->belongsTo(User::class, 'intervenant_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
