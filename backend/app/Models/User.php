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
        'role',
        'telephone',
        'photo_profil',
        'est_verifie',
        'note_moyenne',
        'nb_avis',
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    protected $casts = [
        'est_verifie' => 'boolean',
        'note_moyenne' => 'decimal:2',
        'nb_avis' => 'integer',
    ];

    // Relations
    public function servicesIntervenant()
    {
        return $this->hasMany(Service::class, 'intervenant_id');
    }

    public function demandesClient()
    {
        return $this->hasMany(Demande::class, 'client_id');
    }

    // Accessors & Mutators
    public function getPasswordAttribute()
    {
        return $this->mot_de_passe;
    }

    public function setPasswordAttribute($value)
    {
        $this->attributes['mot_de_passe'] = bcrypt($value);
    }
}
