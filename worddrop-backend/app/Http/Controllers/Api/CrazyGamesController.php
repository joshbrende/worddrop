<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CrazyGamesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CrazyGamesController extends Controller
{
    protected CrazyGamesService $crazyGamesService;

    public function __construct(CrazyGamesService $crazyGamesService)
    {
        $this->crazyGamesService = $crazyGamesService;
    }

    /**
     * Register/login user from CrazyGames SDK
     * 
     * This endpoint handles automatic user registration/login per CrazyGames requirements:
     * https://docs.crazygames.com/requirements/account-integration/
     * 
     * Frontend should call this when CrazyGames SDK provides a userId
     */
    public function registerOrLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'crazygames_user_id' => 'required|string|max:255',
            'username' => 'nullable|string|max:255',
        ]);
        
        $user = $this->crazyGamesService->getOrCreateUser(
            $validated['crazygames_user_id'],
            $validated['username'] ?? null
        );
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid CrazyGames user ID',
            ], 400);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => $user->id,
                'crazygames_user_id' => $user->crazygames_user_id,
                'name' => $user->name,
            ],
            'message' => 'User registered/logged in successfully',
        ], 201);
    }

    /**
     * Get user by CrazyGames user ID
     */
    public function getUser(Request $request, string $crazygamesUserId): JsonResponse
    {
        $user = \App\Models\User::findByCrazyGamesId($crazygamesUserId);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => $user->id,
                'crazygames_user_id' => $user->crazygames_user_id,
                'name' => $user->name,
            ],
        ]);
    }
}
