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
        'parametres_demande', // Champ JSON
        'date_souhaitee'
    ];

    protected $casts = [
        'parametres_demande' => 'array',
        'date_souhaitee' => 'date',
        'prix_total' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    // --- RELATIONS ---
    public function client() {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function service() {
        return $this->belongsTo(Service::class);
    }

    public function items() {
        return $this->hasMany(DemandeItem::class);
    }

    public function evaluation() {
        return $this->hasOne(Evaluation::class);
    }
    
    public function reminders() {
        return $this->hasMany(EvaluationReminder::class);
    }
}