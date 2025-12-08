<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'demande_id', 
        'service_categorie_id', 
        'quantite', 
        'prix_total'
    ];

    // --- RELATIONS ---
    public function demande() {
        return $this->belongsTo(Demande::class);
    }

    public function serviceCategory() {
        return $this->belongsTo(ServiceCategory::class, 'service_categorie_id');
    }
}