<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'type_service', 
        'type_categorie', 
        'nom', 
        'description', 
        'photo'
    ];

    // --- RELATIONS ---
    public function services() {
        return $this->belongsToMany(Service::class, 'service_categories')
                    ->withPivot('prix', 'unite_prix');
    }
}