<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Dashboard/Index', [
        'stats' => [
            'totalRevenue' => 1250.00,
            'newCustomers' => 1234,
            'activeAccounts' => 45678,
            'growthRate' => 4.5,
        ],
    ]);
});

Route::prefix('admin')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'totalRevenue' => 1250.00,
                'newCustomers' => 1234,
                'activeAccounts' => 45678,
                'growthRate' => 4.5,
            ],
        ]);
    })->name('admin.dashboard');

    // Word of the Day Management
    Route::get('/words', function () {
        return Inertia::render('Words/Index');
    })->name('admin.words.index');
    
    Route::get('/words/create', function () {
        return Inertia::render('Words/Form');
    })->name('admin.words.create');
    
    Route::get('/words/{id}/edit', function ($id) {
        return Inertia::render('Words/Form', [
            'wordId' => $id,
        ]);
    })->name('admin.words.edit');

    // Sponsor Management
    Route::get('/sponsors', function () {
        return Inertia::render('Sponsors/Index');
    })->name('admin.sponsors.index');
    
    Route::get('/sponsors/create', function () {
        return Inertia::render('Sponsors/Form');
    })->name('admin.sponsors.create');
    
    Route::get('/sponsors/{id}/edit', function ($id) {
        return Inertia::render('Sponsors/Form', [
            'sponsorId' => $id,
        ]);
    })->name('admin.sponsors.edit');

    // Analytics
    Route::get('/analytics/game-modes', function () {
        return Inertia::render('Analytics/GameModes', [
            'currentPage' => 'analytics',
        ]);
    })->name('admin.analytics.game-modes');
});
