<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WordController;
use App\Http\Controllers\Api\SponsorController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\ScoreController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\CrazyGamesController;
use App\Http\Controllers\Admin\WordManagementController;
use App\Http\Controllers\Admin\SponsorManagementController;
use App\Http\Controllers\Admin\QuestionManagementController;
use App\Http\Controllers\Admin\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Game APIs
Route::prefix('v1')->group(function () {
    // CrazyGames Integration
    Route::post('/crazygames/register-login', [CrazyGamesController::class, 'registerOrLogin']);
    Route::get('/crazygames/user/{crazygames_user_id}', [CrazyGamesController::class, 'getUser']);
    
    // Word of the Day
    Route::get('/word-of-day', [WordController::class, 'getToday']);
    Route::get('/word-of-day/{date}', [WordController::class, 'getByDate']);
    
    // Sponsor Questions
    Route::get('/sponsor-question', [QuestionController::class, 'getRandom']);
    Route::get('/sponsor-question/{id}', [QuestionController::class, 'show']);
    Route::get('/sponsor/{slug}', [SponsorController::class, 'show']);
    
    // Game Sessions
    Route::post('/game-session', [GameController::class, 'createOrUpdate']);
    
    // Scores
    Route::post('/scores', [ScoreController::class, 'store']);
    
    // Leaderboard
    Route::get('/leaderboard', [ScoreController::class, 'leaderboard']);
    Route::get('/leaderboard/user/{user_id}', [ScoreController::class, 'getUserPosition']);
});

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [\App\Http\Controllers\Auth\AuthController::class, 'login']);
    Route::post('/register', [\App\Http\Controllers\Auth\AuthController::class, 'register']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [\App\Http\Controllers\Auth\AuthController::class, 'logout']);
        Route::get('/me', [\App\Http\Controllers\Auth\AuthController::class, 'me']);
    });
});

// Admin APIs
// TODO: Add authentication middleware in production
// For now, allowing access without auth for development
Route::prefix('admin')->group(function () {
    // Dashboard & Analytics
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/analytics/scores', [DashboardController::class, 'scoreAnalytics']);
    Route::get('/analytics/sponsors', [DashboardController::class, 'sponsorPerformance']);
    Route::get('/analytics/users', [DashboardController::class, 'userStatistics']);
    Route::get('/analytics/game-modes', [DashboardController::class, 'gameModeStatistics']);
    
    // Word Management
    Route::apiResource('words', WordManagementController::class);
    Route::post('/words/bulk', [WordManagementController::class, 'bulkImport']);
    Route::post('/words/{id}/assign-date', [WordManagementController::class, 'assignDate']);
    
    // Sponsor Management
    Route::apiResource('sponsors', SponsorManagementController::class);
    
    // Question Management
    Route::apiResource('questions', QuestionManagementController::class);
    Route::post('/questions/bulk', [QuestionManagementController::class, 'bulkImport']);
});
