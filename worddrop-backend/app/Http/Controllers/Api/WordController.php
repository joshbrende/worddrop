<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Word;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class WordController extends Controller
{
    /**
     * Get today's word of the day
     * Matches frontend structure from wordOfTheDay.ts
     */
    public function getToday(): JsonResponse
    {
        $word = Word::active()
            ->forDate(Carbon::today())
            ->first();
        
        if (!$word) {
            return response()->json([
                'success' => false,
                'message' => 'No word of the day found for today',
            ], 404);
        }
        
        return $this->formatWordResponse($word);
    }

    /**
     * Get word of the day for a specific date
     */
    public function getByDate(string $date): JsonResponse
    {
        try {
            $dateObj = Carbon::parse($date);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid date format',
            ], 400);
        }
        
        $word = Word::active()
            ->forDate($dateObj)
            ->first();
        
        if (!$word) {
            return response()->json([
                'success' => false,
                'message' => 'No word of the day found for this date',
            ], 404);
        }
        
        return $this->formatWordResponse($word);
    }

    /**
     * Format word response to match frontend structure
     * Matches WordOfTheDay interface from wordOfTheDay.ts
     */
    private function formatWordResponse(Word $word): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $word->id,
                'question' => $word->question ?? $word->hint, // Use question field, fallback to hint
                'answer' => $word->word, // The word to find (matches frontend)
                'word' => $word->word, // Keep for backward compatibility
                'date' => $word->date->toDateString(),
                'category' => $word->category,
                'hint' => $word->hint,
                'difficulty' => $word->difficulty,
                'points' => $word->points,
                'type' => 'daily',
            ],
        ]);
    }
}
