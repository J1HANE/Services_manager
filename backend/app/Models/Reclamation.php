<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reclamation extends Model
{
    use HasFactory;

    protected $table = 'reclamation'; // Force le nom singulier

    protected $fillable = [
        'evaluation_id', 
        'sujet', 
        'description', 
        'justificatifs'
    ];

    // --- RELATIONS ---
    public function evaluation() {
        return $this->belongsTo(Evaluation::class);
    }
}