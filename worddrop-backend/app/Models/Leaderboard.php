<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Leaderboard extends Model
{
    protected $fillable = [
        'user_id',
        'high_score',
        'total_games',
        'total_words_found',
        'total_word_of_day_found',
        'total_sponsor_trivia_found',
        'average_score',
    ];

    protected function casts(): array
    {
        return [
            'high_score' => 'integer',
            'total_games' => 'integer',
            'total_words_found' => 'integer',
            'total_word_of_day_found' => 'integer',
            'total_sponsor_trivia_found' => 'integer',
            'average_score' => 'decimal:2',
        ];
    }

    /**
     * Get the user for this leaderboard entry.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to order by high score descending.
     */
    public function scopeTopScores($query, $limit = 10)
    {
        return $query->orderBy('high_score', 'desc')->limit($limit);
    }
}
