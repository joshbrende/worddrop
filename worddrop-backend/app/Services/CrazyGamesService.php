<?php

namespace App\Services;

use App\Models\User;
use App\Models\GameSession;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CrazyGamesService
{
    /**
     * Get or create user from CrazyGames user ID
     * 
     * According to CrazyGames requirements:
     * - Users should be automatically registered/logged in via CrazyGames account
     * - Guest users can play without registration
     * 
     * @param string|null $crazygamesUserId CrazyGames user ID from SDK
     * @param string|null $username Optional username from CrazyGames
     * @return User|null
     */
    public function getOrCreateUser(?string $crazygamesUserId, ?string $username = null): ?User
    {
        if (!$crazygamesUserId) {
            // Guest/anonymous user - return null
            return null;
        }
        
        // Try to find existing user
        $user = User::findByCrazyGamesId($crazygamesUserId);
        
        if ($user) {
            // Update username if provided and different
            if ($username && $user->name !== $username) {
                $user->update(['name' => $username]);
            }
            return $user;
        }
        
        // Create new user from CrazyGames account
        // Note: Email is placeholder since CrazyGames doesn't provide email
        $user = User::create([
            'crazygames_user_id' => $crazygamesUserId,
            'name' => $username ?? 'Player ' . substr($crazygamesUserId, -6),
            'email' => $crazygamesUserId . '@crazygames.local',
            'password' => bcrypt(Str::random(32)), // Random password, not used for login
            'role' => 'player',
        ]);
        
        Log::info('Created user from CrazyGames', [
            'crazygames_user_id' => $crazygamesUserId,
            'user_id' => $user->id,
        ]);
        
        return $user;
    }

    /**
     * Link game session to CrazyGames user
     */
    public function linkSessionToCrazyGamesUser(GameSession $session, ?string $crazygamesUserId): void
    {
        if (!$crazygamesUserId) {
            return;
        }
        
        // Update session with CrazyGames user ID
        $session->update(['crazygames_user_id' => $crazygamesUserId]);
        
        // If session has no user_id but has crazygames_user_id, try to link
        if (!$session->user_id) {
            $user = User::findByCrazyGamesId($crazygamesUserId);
            if ($user) {
                $session->update(['user_id' => $user->id]);
            }
        }
    }
}
