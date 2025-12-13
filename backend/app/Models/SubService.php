<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubService extends Model
{
    use HasFactory;

    protected $table = 'sub_services';

    protected $fillable = [
        'service_type_id',
        'nom',
        'description',
    ];

    public function serviceType()
    {
        return $this->belongsTo(ServiceType::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class, 'sub_service_id');
    }
}


