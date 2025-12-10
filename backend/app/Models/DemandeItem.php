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
        'prix_total',
    ];

    protected $casts = [
        'quantite' => 'decimal:2',
        'prix_total' => 'decimal:2',
    ];

    // Relations
    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }

    public function serviceCategorie()
    {
        return $this->belongsTo(ServiceCategorie::class);
    }
}
