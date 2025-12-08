<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ServiceCategory extends Pivot
{
    // Important car ta table a une colonne 'id' auto-incrémentée
    public $incrementing = true;
    protected $table = 'service_categories';

    protected $fillable = [
        'service_id', 
        'category_id', 
        'prix', 
        'unite_prix'
    ];

    // --- RELATIONS ---
    public function service() {
        return $this->belongsTo(Service::class);
    }

    public function category() {
        return $this->belongsTo(Category::class);
    }
}