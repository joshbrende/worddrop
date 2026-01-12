<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Word;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class WordManagementController extends Controller
{
    /**
     * List all words (paginated)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 15), 100);
        
        $words = Word::with('creator:id,name')
            ->orderBy('date', 'desc')
            ->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $words->items(),
            'meta' => [
                'current_page' => $words->currentPage(),
                'last_page' => $words->lastPage(),
                'per_page' => $words->perPage(),
                'total' => $words->total(),
            ],
        ]);
    }

    /**
     * Create new word
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'word' => 'required|string|max:255|unique:words,word',
            'question' => 'nullable|string', // The clue/question for word of the day
            'date' => 'required|date|unique:words,date',
            'category' => 'nullable|string|max:255',
            'hint' => 'nullable|string',
            'difficulty' => 'required|in:easy,medium,hard',
            'points' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);
        
        $validated['word'] = strtoupper($validated['word']);
        $validated['created_by'] = auth()->id();
        $validated['is_active'] = $validated['is_active'] ?? true;
        
        $word = Word::create($validated);
        
        return response()->json([
            'success' => true,
            'data' => $word,
            'message' => 'Word created successfully',
        ], 201);
    }

    /**
     * Get word details
     */
    public function show(string $id): JsonResponse
    {
        $word = Word::with('creator:id,name')->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $word,
        ]);
    }

    /**
     * Update word
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $word = Word::findOrFail($id);
        
        $validated = $request->validate([
            'word' => 'sometimes|string|max:255|unique:words,word,' . $id,
            'question' => 'nullable|string', // The clue/question for word of the day
            'date' => 'sometimes|date|unique:words,date,' . $id,
            'category' => 'nullable|string|max:255',
            'hint' => 'nullable|string',
            'difficulty' => 'sometimes|in:easy,medium,hard',
            'points' => 'sometimes|integer|min:1',
            'is_active' => 'boolean',
        ]);
        
        if (isset($validated['word'])) {
            $validated['word'] = strtoupper($validated['word']);
        }
        
        $word->update($validated);
        
        return response()->json([
            'success' => true,
            'data' => $word->fresh(),
            'message' => 'Word updated successfully',
        ]);
    }

    /**
     * Delete word
     */
    public function destroy(string $id): JsonResponse
    {
        $word = Word::findOrFail($id);
        $word->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Word deleted successfully',
        ]);
    }

    /**
     * Assign word to specific date
     */
    public function assignDate(Request $request, string $id): JsonResponse
    {
        $word = Word::findOrFail($id);
        
        $validated = $request->validate([
            'date' => 'required|date|unique:words,date,' . $id,
        ]);
        
        $word->update(['date' => $validated['date']]);
        
        return response()->json([
            'success' => true,
            'data' => $word->fresh(),
            'message' => 'Word assigned to date successfully',
        ]);
    }

    /**
     * Bulk import words
     */
    public function bulkImport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'words' => 'required|array',
            'words.*.word' => 'required|string|max:255',
            'words.*.date' => 'required|date',
            'words.*.category' => 'nullable|string|max:255',
            'words.*.hint' => 'nullable|string',
            'words.*.difficulty' => 'required|in:easy,medium,hard',
            'words.*.points' => 'required|integer|min:1',
        ]);
        
        $created = [];
        $errors = [];
        
        foreach ($validated['words'] as $index => $wordData) {
            try {
                $wordData['word'] = strtoupper($wordData['word']);
                $wordData['created_by'] = auth()->id();
                $wordData['is_active'] = true;
                
                $word = Word::create($wordData);
                $created[] = $word;
            } catch (\Exception $e) {
                $errors[] = [
                    'index' => $index,
                    'word' => $wordData['word'] ?? 'unknown',
                    'error' => $e->getMessage(),
                ];
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'created' => count($created),
                'errors' => count($errors),
                'words' => $created,
                'error_details' => $errors,
            ],
            'message' => 'Bulk import completed',
        ], 201);
    }
}
