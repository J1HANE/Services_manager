<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nom', 
        'prenom', 
        'email', 
        'mot_de_passe', 
        'surnom', 
        'role',          // 'client', 'intervenant', 'admin'
        'telephone', 
        'photo_profil',
        'est_verifie', 
        'note_moyenne', 
        'nb_avis'
    ];

    protected $hidden = [
        'mot_de_passe', 
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'mot_de_passe' => 'hashed',
        'est_verifie' => 'boolean',
        'note_moyenne' => 'float',
        'nb_avis' => 'integer'
    ];

    // --- RELATIONS ---
    public function services() {
        return $this->hasMany(Service::class, 'intervenant_id');
    }

    public function demandesClient() {
        return $this->hasMany(Demande::class, 'client_id');
    }

    public function justificatifs() {
        return $this->hasMany(Justificatif::class, 'intervenant_id');
    }
}