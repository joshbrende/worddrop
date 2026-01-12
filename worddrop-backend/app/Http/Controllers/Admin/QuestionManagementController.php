<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Sponsor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestionManagementController extends Controller
{
    /**
     * List all questions (with filters)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 15), 100);
        
        $query = Question::with(['sponsor:id,name,slug', 'creator:id,name']);
        
        // Filters
        if ($request->has('sponsor_id')) {
            $query->where('sponsor_id', $request->query('sponsor_id'));
        }
        
        if ($request->has('difficulty')) {
            $query->where('difficulty', $request->query('difficulty'));
        }
        
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }
        
        $questions = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $questions->items(),
            'meta' => [
                'current_page' => $questions->currentPage(),
                'last_page' => $questions->lastPage(),
                'per_page' => $questions->perPage(),
                'total' => $questions->total(),
            ],
        ]);
    }

    /**
     * Create new question
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sponsor_id' => 'required|integer|exists:sponsors,id',
            'question' => 'required|string',
            'answer' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'difficulty' => 'required|in:easy,medium,hard',
            'points' => 'required|integer|min:1',
            'base_points' => 'nullable|integer|min:0', // Base points for scoring calculation
            'bonus_multiplier' => 'nullable|numeric|min:0|max:10', // Custom bonus multiplier
            'hint' => 'nullable|string',
            'is_active' => 'boolean',
            'priority' => 'integer|min:0',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
        ]);
        
        $validated['answer'] = strtoupper($validated['answer']);
        $validated['created_by'] = auth()->id();
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['priority'] = $validated['priority'] ?? 0;
        
        $question = Question::create($validated);
        
        return response()->json([
            'success' => true,
            'data' => $question->load(['sponsor:id,name,slug', 'creator:id,name']),
            'message' => 'Question created successfully',
        ], 201);
    }

    /**
     * Get question details
     */
    public function show(string $id): JsonResponse
    {
        $question = Question::with(['sponsor', 'creator:id,name'])
            ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $question,
        ]);
    }

    /**
     * Update question
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $question = Question::findOrFail($id);
        
        $validated = $request->validate([
            'sponsor_id' => 'sometimes|integer|exists:sponsors,id',
            'question' => 'sometimes|string',
            'answer' => 'sometimes|string|max:255',
            'category' => 'nullable|string|max:255',
            'difficulty' => 'sometimes|in:easy,medium,hard',
            'points' => 'sometimes|integer|min:1',
            'base_points' => 'nullable|integer|min:0',
            'bonus_multiplier' => 'nullable|numeric|min:0|max:10',
            'hint' => 'nullable|string',
            'is_active' => 'boolean',
            'priority' => 'integer|min:0',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
        ]);
        
        if (isset($validated['answer'])) {
            $validated['answer'] = strtoupper($validated['answer']);
        }
        
        $question->update($validated);
        
        return response()->json([
            'success' => true,
            'data' => $question->fresh()->load(['sponsor:id,name,slug', 'creator:id,name']),
            'message' => 'Question updated successfully',
        ]);
    }

    /**
     * Delete question
     */
    public function destroy(string $id): JsonResponse
    {
        $question = Question::findOrFail($id);
        $question->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Question deleted successfully',
        ]);
    }

    /**
     * Bulk import questions
     */
    public function bulkImport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'questions' => 'required|array',
            'questions.*.sponsor_id' => 'required|integer|exists:sponsors,id',
            'questions.*.question' => 'required|string',
            'questions.*.answer' => 'required|string|max:255',
            'questions.*.category' => 'nullable|string|max:255',
            'questions.*.difficulty' => 'required|in:easy,medium,hard',
            'questions.*.points' => 'required|integer|min:1',
            'questions.*.hint' => 'nullable|string',
        ]);
        
        $created = [];
        $errors = [];
        
        foreach ($validated['questions'] as $index => $questionData) {
            try {
                $questionData['answer'] = strtoupper($questionData['answer']);
                $questionData['created_by'] = auth()->id();
                $questionData['is_active'] = true;
                $questionData['priority'] = 0;
                
                $question = Question::create($questionData);
                $created[] = $question;
            } catch (\Exception $e) {
                $errors[] = [
                    'index' => $index,
                    'question' => substr($questionData['question'] ?? 'unknown', 0, 50),
                    'error' => $e->getMessage(),
                ];
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'created' => count($created),
                'errors' => count($errors),
                'questions' => $created,
                'error_details' => $errors,
            ],
            'message' => 'Bulk import completed',
        ], 201);
    }
}
