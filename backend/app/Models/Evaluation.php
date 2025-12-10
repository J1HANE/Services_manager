<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    use HasFactory;

    protected $table = 'evaluation';

    protected $fillable = [
        'demande_id',
        'cible',
        'note_moyenne',
        'note_ponctualite',
        'note_proprete',
        'note_qualite',
        'commentaire',
    ];

    protected $casts = [
        'note_moyenne' => 'decimal:2',
        'note_ponctualite' => 'integer',
        'note_proprete' => 'integer',
        'note_qualite' => 'integer',
    ];

    // Relations
    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }

    public function reclamation()
    {
        return $this->hasOne(Reclamation::class);
    }

    // Scopes
    public function scopePourClient($query)
    {
        return $query->where('cible', 'client');
    }

    public function scopePourIntervenant($query)
    {
        return $query->where('cible', 'intervenant');
    }
}
