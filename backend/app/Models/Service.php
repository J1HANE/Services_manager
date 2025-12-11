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
        'image_principale',
        'images_supplementaires',
        'est_actif',
        'statut',
        'ville',
        'adresse',
        'latitude',
        'longitude',
        'rayon_km',
        'parametres_specifiques',
    ];

    protected $casts = [
        'est_actif' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'rayon_km' => 'integer',
        'parametres_specifiques' => 'array',
        'images_supplementaires' => 'array',
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

    public function evaluations()
    {
        // Evaluations are linked to demandes, not directly to services
        return $this->hasManyThrough(
            Evaluation::class,
            Demande::class,
            'service_id',    // Foreign key on demandes table
            'demande_id',    // Foreign key on evaluations table
            'id',            // Local key on services table
            'id'             // Local key on demandes table
        );
    }

    // Calculated Attributes (Accessors)
    public function getNoteMoyenneAttribute()
    {
        return $this->evaluations()
            ->where('cible', 'intervenant')
            ->avg('note_moyenne') ?? 0;
    }

    public function getNbAvisAttribute()
    {
        return $this->evaluations()
            ->where('cible', 'intervenant')
            ->count();
    }

    public function getMoyennePonctualiteAttribute()
    {
        return $this->evaluations()
            ->where('cible', 'intervenant')
            ->avg('note_ponctualite') ?? 0;
    }

    public function getMoyennePropreteAttribute()
    {
        return $this->evaluations()
            ->where('cible', 'intervenant')
            ->avg('note_proprete') ?? 0;
    }

    public function getMoyenneQualiteAttribute()
    {
        return $this->evaluations()
            ->where('cible', 'intervenant')
            ->avg('note_qualite') ?? 0;
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
