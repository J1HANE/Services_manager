<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Model;
class Metier extends Model
{
    protected $fillable = ['nom', 'code'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_metiers', 'metier_id', 'user_id')
                    ->withPivot('principal', 'ordre');
    }
}
