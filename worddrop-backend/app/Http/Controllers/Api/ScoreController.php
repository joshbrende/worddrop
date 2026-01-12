<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Score;
use App\Models\GameSession;
use App\Services\LeaderboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScoreController extends Controller
{
    protected LeaderboardService $leaderboardService;

    public function __construct(LeaderboardService $leaderboardService)
    {
        $this->leaderboardService = $leaderboardService;
    }

    /**
     * Submit a score
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'game_session_id' => 'required|uuid|exists:game_sessions,id',
            'user_id' => 'nullable|integer|exists:users,id',
            'crazygames_user_id' => 'nullable|string|max:255',
            'word' => 'required|string|max:255',
            'points' => 'required|integer|min:0',
            'combo_count' => 'nullable|integer|min:1|default:1',
            'level' => 'required|integer|min:1',
            'word_type' => 'required|in:normal,word_of_day,sponsor_trivia',
            'word_id' => 'nullable|integer|exists:words,id',
            'question_id' => 'nullable|integer|exists:questions,id',
        ]);
        
        // Verify game session exists
        $gameSession = GameSession::findOrFail($validated['game_session_id']);
        
        // Determine user_id - prioritize provided user_id, then game session user_id
        // If crazygames_user_id provided, try to find user
        $userId = $validated['user_id'] ?? $gameSession->user_id;
        if (!$userId && isset($validated['crazygames_user_id'])) {
            $user = \App\Models\User::findByCrazyGamesId($validated['crazygames_user_id']);
            $userId = $user?->id;
        }
        
        // Create score
        $score = Score::create([
            'game_session_id' => $validated['game_session_id'],
            'user_id' => $userId,
            'word' => strtoupper($validated['word']),
            'points' => $validated['points'],
            'combo_count' => $validated['combo_count'] ?? 1,
            'level' => $validated['level'],
            'word_type' => $validated['word_type'],
            'word_id' => $validated['word_id'] ?? null,
            'question_id' => $validated['question_id'] ?? null,
            'created_at' => now(),
        ]);
        
        // Update leaderboard if user_id exists
        if ($score->user_id) {
            $metadata = [
                'words_found' => 1,
                'word_of_day_found' => $validated['word_type'] === 'word_of_day' ? 1 : 0,
                'sponsor_trivia_found' => $validated['word_type'] === 'sponsor_trivia' ? 1 : 0,
            ];
            
            // Get user's current high score from session
            $sessionHighScore = $gameSession->final_score;
            
            $this->leaderboardService->updateLeaderboard(
                $score->user_id,
                $sessionHighScore,
                $metadata
            );
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'score_id' => $score->id,
                'points' => $score->points,
            ],
        ], 201);
    }

    /**
     * Get leaderboard
     */
    public function leaderboard(Request $request): JsonResponse
    {
        $type = $request->query('type', 'all_time');
        $limit = min((int) $request->query('limit', 10), 100); // Max 100
        $offset = max((int) $request->query('offset', 0), 0);
        
        $leaderboard = $this->leaderboardService->getLeaderboard($type, $limit, $offset);
        
        return response()->json([
            'success' => true,
            'data' => $leaderboard,
            'meta' => [
                'type' => $type,
                'limit' => $limit,
                'offset' => $offset,
                'count' => count($leaderboard),
            ],
        ]);
    }

    /**
     * Get user's position in leaderboard
     */
    public function getUserPosition(Request $request, string $user_id): JsonResponse
    {
        $type = $request->query('type', 'all_time');
        
        $position = $this->leaderboardService->getUserPosition((int) $user_id, $type);
        
        if (!$position) {
            return response()->json([
                'success' => false,
                'message' => 'User not found in leaderboard',
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $position,
        ]);
    }
}
