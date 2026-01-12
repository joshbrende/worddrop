<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Word;
use App\Models\Sponsor;
use App\Models\Question;
use App\Models\GameSession;
use App\Models\Score;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_words' => Word::count(),
            'active_words' => Word::where('is_active', true)->count(),
            'total_sponsors' => Sponsor::count(),
            'active_sponsors' => Sponsor::where('is_active', true)->count(),
            'total_questions' => Question::count(),
            'active_questions' => Question::where('is_active', true)->count(),
            'total_game_sessions' => GameSession::count(),
            'total_scores' => Score::count(),
            'total_users' => User::count(),
            'total_revenue' => 0, // Placeholder - implement if needed
            'new_customers' => User::where('created_at', '>=', Carbon::now()->subMonth())->count(),
            'active_accounts' => GameSession::distinct('user_id')->whereNotNull('user_id')->count(),
            'growth_rate' => $this->calculateGrowthRate(),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Score analytics
     */
    public function scoreAnalytics(Request $request): JsonResponse
    {
        $period = $request->query('period', '7days'); // 7days, 30days, 90days
        
        $days = match($period) {
            '30days' => 30,
            '90days' => 90,
            default => 7,
        };
        
        $startDate = Carbon::now()->subDays($days);
        
        $analytics = [
            'total_scores' => Score::where('created_at', '>=', $startDate)->count(),
            'average_score' => Score::where('created_at', '>=', $startDate)->avg('points'),
            'highest_score' => Score::where('created_at', '>=', $startDate)->max('points'),
            'scores_by_type' => Score::where('created_at', '>=', $startDate)
                ->select('word_type', DB::raw('count(*) as count'))
                ->groupBy('word_type')
                ->get()
                ->pluck('count', 'word_type'),
            'daily_scores' => Score::where('created_at', '>=', $startDate)
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $analytics,
        ]);
    }

    /**
     * Sponsor performance
     */
    public function sponsorPerformance(): JsonResponse
    {
        $performance = Sponsor::withCount(['questions as total_questions', 'questions as active_questions' => function($query) {
            $query->where('is_active', true);
        }])
        ->withCount(['questions as total_times_answered' => function($query) {
            $query->join('scores', 'questions.id', '=', 'scores.question_id')
                  ->select(DB::raw('count(*)'));
        }])
        ->get();
        
        return response()->json([
            'success' => true,
            'data' => $performance,
        ]);
    }

    /**
     * User statistics
     */
    public function userStatistics(): JsonResponse
    {
        $stats = [
            'total_users' => User::count(),
            'users_with_scores' => User::has('scores')->count(),
            'top_players' => User::withCount('scores')
                ->orderBy('scores_count', 'desc')
                ->limit(10)
                ->get(['id', 'name', 'email', 'scores_count']),
            'new_users_this_month' => User::where('created_at', '>=', Carbon::now()->startOfMonth())->count(),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Word of the Day and Sponsor Question Statistics
     */
    public function gameModeStatistics(Request $request): JsonResponse
    {
        $period = $request->query('period', 'all'); // all, 7days, 30days, 90days
        
        $dateFilter = match($period) {
            '7days' => Carbon::now()->subDays(7),
            '30days' => Carbon::now()->subDays(30),
            '90days' => Carbon::now()->subDays(90),
            default => null,
        };
        
        $scoreQuery = Score::query();
        if ($dateFilter) {
            $scoreQuery->where('created_at', '>=', $dateFilter);
        }
        
        // Word of the Day Statistics
        $wordOfDayScores = (clone $scoreQuery)->where('word_type', 'word_of_day');
        $wordOfDayStats = [
            'total_found' => $wordOfDayScores->count(),
            'unique_users' => $wordOfDayScores->distinct('user_id')->count('user_id'),
            'total_points_awarded' => $wordOfDayScores->sum('points'),
            'average_points' => round($wordOfDayScores->avg('points') ?? 0, 2),
            'by_word' => (clone $wordOfDayScores)
                ->join('words', 'scores.word_id', '=', 'words.id')
                ->select('words.id', 'words.word', 'words.date', DB::raw('count(*) as times_found'), DB::raw('count(distinct scores.user_id) as unique_users'))
                ->groupBy('words.id', 'words.word', 'words.date')
                ->orderBy('times_found', 'desc')
                ->get(),
            'daily_breakdown' => (clone $wordOfDayScores)
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'), DB::raw('count(distinct user_id) as unique_users'))
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->limit(30)
                ->get(),
        ];
        
        // Sponsor Trivia Statistics
        $sponsorTriviaScores = (clone $scoreQuery)->where('word_type', 'sponsor_trivia');
        $sponsorTriviaStats = [
            'total_answered' => $sponsorTriviaScores->count(),
            'unique_users' => $sponsorTriviaScores->distinct('user_id')->count('user_id'),
            'total_points_awarded' => $sponsorTriviaScores->sum('points'),
            'average_points' => round($sponsorTriviaScores->avg('points') ?? 0, 2),
            'by_sponsor' => (clone $sponsorTriviaScores)
                ->join('questions', 'scores.question_id', '=', 'questions.id')
                ->join('sponsors', 'questions.sponsor_id', '=', 'sponsors.id')
                ->select('sponsors.id', 'sponsors.name', DB::raw('count(*) as times_answered'), DB::raw('count(distinct scores.user_id) as unique_users'))
                ->groupBy('sponsors.id', 'sponsors.name')
                ->orderBy('times_answered', 'desc')
                ->get(),
            'by_question' => (clone $sponsorTriviaScores)
                ->join('questions', 'scores.question_id', '=', 'questions.id')
                ->select('questions.id', 'questions.question', 'questions.answer', DB::raw('count(*) as times_answered'), DB::raw('count(distinct scores.user_id) as unique_users'))
                ->groupBy('questions.id', 'questions.question', 'questions.answer')
                ->orderBy('times_answered', 'desc')
                ->limit(20)
                ->get(),
            'daily_breakdown' => (clone $sponsorTriviaScores)
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'), DB::raw('count(distinct user_id) as unique_users'))
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->limit(30)
                ->get(),
        ];
        
        // Overall Statistics
        $totalUsers = User::count();
        $usersWhoFoundWordOfDay = (clone $wordOfDayScores)->distinct('user_id')->count('user_id');
        $usersWhoAnsweredSponsor = (clone $sponsorTriviaScores)->distinct('user_id')->count('user_id');
        
        $overallStats = [
            'total_users' => $totalUsers,
            'users_who_found_word_of_day' => $usersWhoFoundWordOfDay,
            'word_of_day_participation_rate' => $totalUsers > 0 ? round(($usersWhoFoundWordOfDay / $totalUsers) * 100, 2) : 0,
            'users_who_answered_sponsor' => $usersWhoAnsweredSponsor,
            'sponsor_participation_rate' => $totalUsers > 0 ? round(($usersWhoAnsweredSponsor / $totalUsers) * 100, 2) : 0,
            'users_who_found_both' => $this->getUsersWhoFoundBoth($dateFilter),
        ];
        
        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'word_of_day' => $wordOfDayStats,
                'sponsor_trivia' => $sponsorTriviaStats,
                'overall' => $overallStats,
            ],
        ]);
    }

    /**
     * Get users who found both Word of the Day and Sponsor Trivia
     */
    private function getUsersWhoFoundBoth(?Carbon $dateFilter): int
    {
        $wordOfDayQuery = Score::where('word_type', 'word_of_day')->whereNotNull('user_id');
        $sponsorQuery = Score::where('word_type', 'sponsor_trivia')->whereNotNull('user_id');
        
        if ($dateFilter) {
            $wordOfDayQuery->where('created_at', '>=', $dateFilter);
            $sponsorQuery->where('created_at', '>=', $dateFilter);
        }
        
        $wordOfDayUsers = $wordOfDayQuery->distinct('user_id')->pluck('user_id')->toArray();
        $sponsorUsers = $sponsorQuery->distinct('user_id')->pluck('user_id')->toArray();
        
        $usersWhoFoundBoth = array_intersect($wordOfDayUsers, $sponsorUsers);
        
        return count($usersWhoFoundBoth);
    }

    /**
     * Calculate growth rate
     */
    private function calculateGrowthRate(): float
    {
        $currentMonth = GameSession::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();
        
        $lastMonth = GameSession::whereMonth('created_at', Carbon::now()->subMonth()->month)
            ->whereYear('created_at', Carbon::now()->subMonth()->year)
            ->count();
        
        if ($lastMonth == 0) {
            return $currentMonth > 0 ? 100 : 0;
        }
        
        return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 2);
    }
}
