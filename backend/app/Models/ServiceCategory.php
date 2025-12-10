<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ServiceCategory extends Pivot
{
    protected $table = 'service_categories';

    protected $fillable = [
        'service_id',
        'category_id',
        'prix',
        'unite_prix',
    ];

    protected $casts = [
        'prix' => 'decimal:2',
    ];

    // Relations
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function categorie()
    {
        return $this->belongsTo(Categorie::class, 'category_id');
    }

    public function demandeItems()
    {
        return $this->hasMany(DemandeItem::class);
    }
}
