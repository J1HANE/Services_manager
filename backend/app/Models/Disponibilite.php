<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disponibilite extends Model
{
    use HasFactory;

    protected $table = 'disponibilites'; // Pluriel explicite

    protected $fillable = [
        'service_id', 
        'type',             // 'semaine' ou 'date'
        'jour_semaine', 
        'date_specifique', 
        'est_disponible', 
        'raison', 
        'heure_debut', 
        'heure_fin'
    ];

    protected $casts = [
        'date_specifique' => 'date',
        'est_disponible' => 'boolean',
        'jour_semaine' => 'integer'
    ];

    // --- RELATIONS ---
    public function service() {
        return $this->belongsTo(Service::class);
    }
}