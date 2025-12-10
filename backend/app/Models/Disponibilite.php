<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disponibilite extends Model
{
    use HasFactory;

    protected $table = 'disponibilites'; // Pluriel explicite

    protected $fillable = [
        'service_id',
        'type_disponibilite',
        'jour_semaine',
        'date_exclusion',
        'raison',
    ];

    protected $casts = [
        'jour_semaine' => 'integer',
        'date_exclusion' => 'date',
    ];

    // Relations
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    // Scopes
    public function scopeRegular($query)
    {
        return $query->where('type_disponibilite', 'regular');
    }

    public function scopeException($query)
    {
        return $query->where('type_disponibilite', 'exception');
    }

    public function scopeForDay($query, $day)
    {
        return $query->where('type_disponibilite', 'regular')
            ->where('jour_semaine', $day);
    }
}
