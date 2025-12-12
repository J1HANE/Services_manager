<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reclamation extends Model
{
    use HasFactory;

    protected $table = 'reclamation';

    protected $fillable = [
        'evaluation_id',
        'demande_id',
        'createur_id',
        'createur_type',
        'sujet',
        'description',
        'justificatifs',
        'statut',
        'reponse',
        'reponse_at',
        'repondu_par',
    ];

    protected $casts = [
        'reponse_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relations
    public function evaluation()
    {
        return $this->belongsTo(Evaluation::class);
    }

    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }

    public function createur()
    {
        return $this->belongsTo(User::class, 'createur_id');
    }

    public function reponduPar()
    {
        return $this->belongsTo(User::class, 'repondu_par');
    }

    // Scopes
    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    public function scopeEnCours($query)
    {
        return $query->where('statut', 'en_cours');
    }

    public function scopeResolue($query)
    {
        return $query->where('statut', 'resolue');
    }

    public function scopeFermee($query)
    {
        return $query->where('statut', 'fermee');
    }

    public function scopeParType($query, $type)
    {
        return $query->where('createur_type', $type);
    }
}
