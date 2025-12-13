<?php

namespace App\Http\Controllers\API\Public;

use App\Http\Controllers\Controller;
use App\Models\ServiceType;
use Illuminate\Http\Request;

class ServiceTypeController extends Controller
{
    public function index()
    {
        $types = ServiceType::orderBy('nom')->get(['id', 'code', 'nom']);
        return response()->json(['success' => true, 'data' => $types]);
    }
}


