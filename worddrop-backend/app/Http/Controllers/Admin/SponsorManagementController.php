<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sponsor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SponsorManagementController extends Controller
{
    /**
     * List all sponsors
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 15), 100);
        $activeOnly = $request->query('active_only', false);
        
        $query = Sponsor::withCount('questions');
        
        if ($activeOnly) {
            $query->where('is_active', true);
        }
        
        $sponsors = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $sponsors->items(),
            'meta' => [
                'current_page' => $sponsors->currentPage(),
                'last_page' => $sponsors->lastPage(),
                'per_page' => $sponsors->perPage(),
                'total' => $sponsors->total(),
            ],
        ]);
    }

    /**
     * Create new sponsor
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:sponsors,name',
            'slug' => 'nullable|string|max:255|unique:sponsors,slug',
            'logo_url' => 'nullable|url|max:500',
            'website_url' => 'nullable|url|max:500',
            'description' => 'nullable|string',
            'contact_email' => 'nullable|email|max:255',
            'contact_name' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);
        
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        $validated['is_active'] = $validated['is_active'] ?? true;
        
        $sponsor = Sponsor::create($validated);
        
        return response()->json([
            'success' => true,
            'data' => $sponsor,
            'message' => 'Sponsor created successfully',
        ], 201);
    }

    /**
     * Get sponsor details
     */
    public function show(string $id): JsonResponse
    {
        $sponsor = Sponsor::withCount('questions')
            ->with('questions:id,sponsor_id,question,answer,difficulty,points,is_active')
            ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $sponsor,
        ]);
    }

    /**
     * Update sponsor
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $sponsor = Sponsor::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:sponsors,name,' . $id,
            'slug' => 'nullable|string|max:255|unique:sponsors,slug,' . $id,
            'logo_url' => 'nullable|url|max:500',
            'website_url' => 'nullable|url|max:500',
            'description' => 'nullable|string',
            'contact_email' => 'nullable|email|max:255',
            'contact_name' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);
        
        $sponsor->update($validated);
        
        return response()->json([
            'success' => true,
            'data' => $sponsor->fresh(),
            'message' => 'Sponsor updated successfully',
        ]);
    }

    /**
     * Delete sponsor (soft delete by setting is_active to false)
     */
    public function destroy(string $id): JsonResponse
    {
        $sponsor = Sponsor::findOrFail($id);
        
        // Soft delete by deactivating
        $sponsor->update(['is_active' => false]);
        
        return response()->json([
            'success' => true,
            'message' => 'Sponsor deactivated successfully',
        ]);
    }
}
