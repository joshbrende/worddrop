<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sponsor;
use Illuminate\Http\JsonResponse;

class SponsorController extends Controller
{
    /**
     * Get sponsor details by slug
     */
    public function show(string $slug): JsonResponse
    {
        $sponsor = Sponsor::active()
            ->where('slug', $slug)
            ->first();
        
        if (!$sponsor) {
            return response()->json([
                'success' => false,
                'message' => 'Sponsor not found',
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $sponsor->id,
                'name' => $sponsor->name,
                'slug' => $sponsor->slug,
                'logo_url' => $sponsor->logo_url,
                'website_url' => $sponsor->website_url,
                'description' => $sponsor->description,
            ],
        ]);
    }
}
