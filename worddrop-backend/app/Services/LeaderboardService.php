<?php

namespace App\Services;

use App\Models\Score;
use App\Models\GameSession;
use App\Models\Leaderboard;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LeaderboardService
{
    const REDIS_PREFIX = 'leaderboard:';
    const CACHE_TTL = 3600; // 1 hour

    /**
     * Update leaderboard when a score is submitted
     */
    public function updateLeaderboard(int $userId, int $score, array $metadata = []): void
    {
        try {
            // Update Redis sorted set
            $key = self::REDIS_PREFIX . 'all_time';
            Redis::zadd($key, $score, $userId);
        } catch (\Exception $e) {
            // Redis not available, log and continue with database update
            Log::warning('Redis unavailable, skipping Redis leaderboard update: ' . $e->getMessage());
        }
        
        try {
        
            // Update daily leaderboard
            $dailyKey = self::REDIS_PREFIX . 'daily:' . Carbon::today()->toDateString();
            Redis::zadd($dailyKey, $score, $userId);
            Redis::expire($dailyKey, 86400 * 7); // Keep for 7 days
            
            // Update weekly leaderboard
            $weekKey = self::REDIS_PREFIX . 'weekly:' . Carbon::now()->startOfWeek()->toDateString();
            Redis::zadd($weekKey, $score, $userId);
            Redis::expire($weekKey, 86400 * 14); // Keep for 2 weeks
            
            // Update monthly leaderboard
            $monthKey = self::REDIS_PREFIX . 'monthly:' . Carbon::now()->startOfMonth()->toDateString();
            Redis::zadd($monthKey, $score, $userId);
            Redis::expire($monthKey, 86400 * 60); // Keep for 60 days
        } catch (\Exception $e) {
            Log::warning('Redis unavailable for time-based leaderboards: ' . $e->getMessage());
        }
        
        // Update database leaderboard table (async via queue would be better)
        $this->updateDatabaseLeaderboard($userId, $score, $metadata);
    }

    /**
     * Get leaderboard from Redis
     */
    public function getLeaderboard(string $type = 'all_time', int $limit = 10, int $offset = 0): array
    {
        try {
            $key = $this->getLeaderboardKey($type);
            
            // Get top scores from Redis
            $scores = Redis::zrevrange($key, $offset, $offset + $limit - 1, 'WITHSCORES');
            
            if (empty($scores)) {
                // Fallback to database if Redis is empty
                return $this->getLeaderboardFromDatabase($type, $limit, $offset);
            }
        } catch (\Exception $e) {
            // Redis not available, fallback to database
            Log::warning('Redis unavailable, using database for leaderboard: ' . $e->getMessage());
            return $this->getLeaderboardFromDatabase($type, $limit, $offset);
        }
        
        $userIds = array_keys($scores);
        $users = DB::table('users')
            ->whereIn('id', $userIds)
            ->select('id', 'name', 'email')
            ->get()
            ->keyBy('id');
        
        $leaderboard = [];
        $position = $offset + 1;
        
        foreach ($scores as $userId => $score) {
            $user = $users[$userId] ?? null;
            if ($user) {
                $leaderboard[] = [
                    'position' => $position++,
                    'user_id' => $userId,
                    'name' => $user->name,
                    'score' => (int) $score,
                ];
            }
        }
        
        return $leaderboard;
    }

    /**
     * Get user's position in leaderboard
     */
    public function getUserPosition(int $userId, string $type = 'all_time'): ?array
    {
        try {
            $key = $this->getLeaderboardKey($type);
            
            // Get user's rank (0-indexed)
            $rank = Redis::zrevrank($key, $userId);
            
            if ($rank === null) {
                // Fallback to database
                return $this->getUserPositionFromDatabase($userId, $type);
            }
            
            // Get user's score
            $score = Redis::zscore($key, $userId);
            
            $user = DB::table('users')
                ->where('id', $userId)
                ->select('id', 'name', 'email')
                ->first();
            
            if (!$user) {
                return null;
            }
            
            return [
                'position' => $rank + 1,
                'user_id' => $userId,
                'name' => $user->name,
                'score' => (int) $score,
            ];
        } catch (\Exception $e) {
            // Redis not available, fallback to database
            Log::warning('Redis unavailable, using database for user position: ' . $e->getMessage());
            return $this->getUserPositionFromDatabase($userId, $type);
        }
    }

    /**
     * Get user position from database (fallback)
     */
    private function getUserPositionFromDatabase(int $userId, string $type): ?array
    {
        $userLeaderboard = Leaderboard::where('user_id', $userId)->first();
        if (!$userLeaderboard) {
            return null;
        }
        
        $query = Leaderboard::query();
        
        // Apply time filters
        if ($type === 'daily') {
            $query->whereHas('user.scores', function($q) {
                $q->whereDate('created_at', Carbon::today());
            });
        } elseif ($type === 'weekly') {
            $query->whereHas('user.scores', function($q) {
                $q->whereBetween('created_at', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ]);
            });
        } elseif ($type === 'monthly') {
            $query->whereHas('user.scores', function($q) {
                $q->whereMonth('created_at', Carbon::now()->month)
                  ->whereYear('created_at', Carbon::now()->year);
            });
        }
        
        $position = $query->where('high_score', '>', $userLeaderboard->high_score)->count() + 1;
        
        $user = DB::table('users')
            ->where('id', $userId)
            ->select('id', 'name', 'email')
            ->first();
        
        if (!$user) {
            return null;
        }
        
        return [
            'position' => $position,
            'user_id' => $userId,
            'name' => $user->name,
            'score' => $userLeaderboard->high_score,
        ];
    }

    /**
     * Get leaderboard key for Redis
     */
    private function getLeaderboardKey(string $type): string
    {
        return match($type) {
            'daily' => self::REDIS_PREFIX . 'daily:' . Carbon::today()->toDateString(),
            'weekly' => self::REDIS_PREFIX . 'weekly:' . Carbon::now()->startOfWeek()->toDateString(),
            'monthly' => self::REDIS_PREFIX . 'monthly:' . Carbon::now()->startOfMonth()->toDateString(),
            default => self::REDIS_PREFIX . 'all_time',
        };
    }

    /**
     * Update database leaderboard table
     */
    private function updateDatabaseLeaderboard(int $userId, int $score, array $metadata): void
    {
        $leaderboard = Leaderboard::firstOrNew(['user_id' => $userId]);
        
        // Update high score if this is higher
        if ($score > $leaderboard->high_score) {
            $leaderboard->high_score = $score;
        }
        
        // Update totals
        $leaderboard->total_games = $leaderboard->total_games + 1;
        $leaderboard->total_words_found = $leaderboard->total_words_found + ($metadata['words_found'] ?? 0);
        $leaderboard->total_word_of_day_found = $leaderboard->total_word_of_day_found + ($metadata['word_of_day_found'] ?? 0);
        $leaderboard->total_sponsor_trivia_found = $leaderboard->total_sponsor_trivia_found + ($metadata['sponsor_trivia_found'] ?? 0);
        
        // Recalculate average score
        $totalScores = Score::where('user_id', $userId)->sum('points');
        $totalCount = Score::where('user_id', $userId)->count();
        $leaderboard->average_score = $totalCount > 0 ? round($totalScores / $totalCount, 2) : 0;
        
        $leaderboard->save();
    }

    /**
     * Get leaderboard from database (fallback when Redis unavailable)
     */
    private function getLeaderboardFromDatabase(string $type, int $limit, int $offset): array
    {
        $query = Leaderboard::query();
        
        // Apply time filters based on type
        if ($type === 'daily') {
            $query->whereHas('user.scores', function($q) {
                $q->whereDate('created_at', Carbon::today());
            });
        } elseif ($type === 'weekly') {
            $query->whereHas('user.scores', function($q) {
                $q->whereBetween('created_at', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ]);
            });
        } elseif ($type === 'monthly') {
            $query->whereHas('user.scores', function($q) {
                $q->whereMonth('created_at', Carbon::now()->month)
                  ->whereYear('created_at', Carbon::now()->year);
            });
        }
        
        $leaderboards = $query->orderBy('high_score', 'desc')
            ->skip($offset)
            ->take($limit)
            ->with('user:id,name,email')
            ->get();
        
        $leaderboard = [];
        $position = $offset + 1;
        
        foreach ($leaderboards as $entry) {
            $leaderboard[] = [
                'position' => $position++,
                'user_id' => $entry->user_id,
                'name' => $entry->user->name ?? 'Anonymous',
                'score' => $entry->high_score,
            ];
        }
        
        return $leaderboard;
    }

    /**
     * Rebuild leaderboard from database (useful for migration or recovery)
     */
    public function rebuildLeaderboard(string $type = 'all_time'): void
    {
        try {
            $key = $this->getLeaderboardKey($type);
            
            // Clear existing leaderboard
            Redis::del($key);
        } catch (\Exception $e) {
            Log::warning('Redis unavailable for rebuild: ' . $e->getMessage());
            return;
        }
        
        // Get scores from database based on type
        $query = Score::select('user_id', DB::raw('MAX(points) as max_score'))
            ->groupBy('user_id');
        
        if ($type === 'daily') {
            $query->whereDate('created_at', Carbon::today());
        } elseif ($type === 'weekly') {
            $query->whereBetween('created_at', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ]);
        } elseif ($type === 'monthly') {
            $query->whereMonth('created_at', Carbon::now()->month)
                  ->whereYear('created_at', Carbon::now()->year);
        }
        
        $scores = $query->get();
        
        // Populate Redis
        try {
            foreach ($scores as $score) {
                Redis::zadd($key, $score->max_score, $score->user_id);
            }
        } catch (\Exception $e) {
            Log::warning('Redis unavailable during rebuild: ' . $e->getMessage());
        }
    }
}
