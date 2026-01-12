<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSession;
use App\Services\CrazyGamesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GameController extends Controller
{
    protected CrazyGamesService $crazyGamesService;

    public function __construct(CrazyGamesService $crazyGamesService)
    {
        $this->crazyGamesService = $crazyGamesService;
    }

    /**
     * Create or update a game session
     * 
     * Supports both CrazyGames users and anonymous/guest sessions
     * According to CrazyGames requirements: https://docs.crazygames.com/requirements/account-integration/
     */
    public function createOrUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_token' => 'nullable|string',
            'user_id' => 'nullable|integer|exists:users,id',
            'crazygames_user_id' => 'nullable|string|max:255',
            'level_reached' => 'required|integer|min:1',
            'final_score' => 'required|integer|min:0',
            'words_found' => 'required|integer|min:0',
            'duration_seconds' => 'nullable|integer|min:0',
        ]);
        
        $sessionToken = $validated['session_token'] ?? Str::random(40);
        
        // Handle CrazyGames user ID
        $userId = $validated['user_id'] ?? null;
        $crazygamesUserId = $validated['crazygames_user_id'] ?? null;
        
        // If CrazyGames user ID provided but no user_id, get or create user
        // Per CrazyGames requirements: automatically register/login CrazyGames users
        if ($crazygamesUserId && !$userId) {
            $user = $this->crazyGamesService->getOrCreateUser($crazygamesUserId);
            if ($user) {
                $userId = $user->id;
            }
        }
        
        $session = GameSession::updateOrCreate(
            ['session_token' => $sessionToken],
            [
                'user_id' => $userId,
                'crazygames_user_id' => $crazygamesUserId,
                'level_reached' => $validated['level_reached'],
                'final_score' => $validated['final_score'],
                'words_found' => $validated['words_found'],
                'duration_seconds' => $validated['duration_seconds'] ?? null,
                'ended_at' => now(),
            ]
        );
        
        return response()->json([
            'success' => true,
            'data' => [
                'session_token' => $session->session_token,
                'game_session_id' => $session->id,
                'user_id' => $session->user_id,
                'crazygames_user_id' => $session->crazygames_user_id,
            ],
        ], 201);
    }
}
