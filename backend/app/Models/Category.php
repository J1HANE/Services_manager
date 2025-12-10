<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';

    protected $fillable = [
        'type_service',
        'type_categorie',
        'nom',
        'description',
        'photo',
    ];

    // Relations
    public function serviceCategories()
    {
        return $this->hasMany(ServiceCategorie::class, 'category_id');
    }

    public function services()
    {
        return $this->belongsToMany(Service::class, 'service_categories', 'category_id', 'service_id')
            ->withPivot('prix', 'unite_prix')
            ->withTimestamps();
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type_service', $type);
    }

    public function scopeMateriel($query)
    {
        return $query->where('type_categorie', 'materiel');
    }

    public function scopeService($query)
    {
        return $query->where('type_categorie', 'service');
    }
}
