<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationReminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'demande_id', 
        'destinataire', 
        'email', 
        'statut', 
        'date_envoi', 
        'date_rappel', 
        'nombre_tentatives'
    ];

    protected $casts = [
        'date_envoi' => 'datetime',
        'date_rappel' => 'datetime',
        'nombre_tentatives' => 'integer'
    ];

    // --- RELATIONS ---
    public function demande() {
        return $this->belongsTo(Demande::class);
    }
}