<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'intervenant_id', 
        'type_service', 
        'titre', 
        'description',
        'est_actif', 
        'statut', 
        'ville', 
        'adresse',
        'latitude', 
        'longitude', 
        'rayon_km', 
        'parametres_specifiques', // Champ JSON
        'nb_avis', 
        'moyenne_note', 
        'moyenne_ponctualite', 
        'moyenne_proprete', 
        'moyenne_qualite'
    ];

    protected $casts = [
        'est_actif' => 'boolean',
        'parametres_specifiques' => 'array', // Conversion automatique JSON <-> Array
        'latitude' => 'float',
        'longitude' => 'float',
        'rayon_km' => 'integer',
        'nb_avis' => 'integer'
    ];

    // --- RELATIONS ---
    public function intervenant() {
        return $this->belongsTo(User::class, 'intervenant_id');
    }

    public function disponibilites() {
        return $this->hasMany(Disponibilite::class);
    }

    public function categories() {
        return $this->belongsToMany(Category::class, 'service_categories')
                    ->withPivot('id', 'prix', 'unite_prix')
                    ->withTimestamps();
    }
    
    public function demandes() {
        return $this->hasMany(Demande::class);
    }
    
    public function justificatifs() {
        return $this->hasMany(Justificatif::class);
    }
}