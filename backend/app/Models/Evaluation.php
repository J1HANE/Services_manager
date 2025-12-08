<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    use HasFactory;
    
    protected $table = 'evaluation'; // Force le nom singulier comme en BDD

    protected $fillable = [
        'demande_id', 
        'cible', 
        'note_moyenne', 
        'note_ponctualite', 
        'note_proprete', 
        'note_qualite', 
        'commentaire'
    ];

    protected $casts = [
        'note_moyenne' => 'float',
    ];

    // --- RELATIONS ---
    public function demande() {
        return $this->belongsTo(Demande::class);
    }

    public function reclamation() {
        return $this->hasOne(Reclamation::class);
    }
}