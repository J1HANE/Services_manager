<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Demande extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'service_id',
        'type_demande',
        'description',
        'prix_total',
        'adresse',
        'ville',
        'latitude',
        'longitude',
        'statut',
        'parametres_demande',
        'date_souhaitee',
    ];

    protected $casts = [
        'prix_total' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'parametres_demande' => 'array',
        'date_souhaitee' => 'date',
    ];

    // Relations
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function items()
    {
        return $this->hasMany(DemandeItem::class);
    }

    public function evaluations()
    {
        return $this->hasMany(Evaluation::class);
    }

    // Scopes
    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    public function scopeAccepte($query)
    {
        return $query->where('statut', 'accepte');
    }

    public function scopeTermine($query)
    {
        return $query->where('statut', 'termine');
    }
}
