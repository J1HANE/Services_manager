<?php

namespace App\Http\Controllers\API\Public;

use App\Http\Controllers\Controller;
use App\Models\ServiceType;
use App\Models\SubService;
use Illuminate\Http\Request;

class SubServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = SubService::with('serviceType');

        // filter by service_type code or id
        if ($request->has('type_service')) {
            $code = $request->input('type_service');
            $query->whereHas('serviceType', fn($q) => $q->where('code', $code));
        }
        if ($request->has('service_type_id')) {
            $query->where('service_type_id', $request->input('service_type_id'));
        }

        $subs = $query->orderBy('nom')->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'nom' => $s->nom,
                'description' => $s->description,
                'service_type' => $s->serviceType ? [
                    'id' => $s->serviceType->id,
                    'code' => $s->serviceType->code,
                    'nom' => $s->serviceType->nom,
                ] : null,
            ];
        });

        return response()->json(['success' => true, 'data' => $subs]);
    }
}


