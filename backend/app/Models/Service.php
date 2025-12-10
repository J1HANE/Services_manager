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
        'parametres_specifiques',
        'nb_avis',
        'moyenne_note',
        'moyenne_ponctualite',
        'moyenne_proprete',
        'moyenne_qualite',
    ];

    protected $casts = [
        'est_actif' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'rayon_km' => 'integer',
        'parametres_specifiques' => 'array',
        'nb_avis' => 'integer',
        'moyenne_note' => 'integer',
        'moyenne_ponctualite' => 'integer',
        'moyenne_proprete' => 'integer',
        'moyenne_qualite' => 'integer',
    ];

    // Relations
    public function intervenant()
    {
        return $this->belongsTo(User::class, 'intervenant_id');
    }

    public function serviceCategories()
    {
        return $this->hasMany(ServiceCategorie::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Categorie::class, 'service_categories', 'service_id', 'category_id')
            ->withPivot('prix', 'unite_prix')
            ->withTimestamps();
    }

    public function demandes()
    {
        return $this->hasMany(Demande::class);
    }

    public function disponibilites()
    {
        return $this->hasMany(Disponibilite::class);
    }

    // Scopes
    public function scopeActif($query)
    {
        return $query->where('est_actif', true)->where('statut', 'actif');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type_service', $type);
    }
}
