<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Score extends Model
{
    public $timestamps = false;
    const UPDATED_AT = null;

    protected $fillable = [
        'game_session_id',
        'user_id',
        'word',
        'points',
        'combo_count',
        'level',
        'word_type',
        'word_id',
        'question_id',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'points' => 'integer',
            'combo_count' => 'integer',
            'level' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Get the game session for this score.
     */
    public function gameSession(): BelongsTo
    {
        return $this->belongsTo(GameSession::class);
    }

    /**
     * Get the user for this score.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the word (if word of day) for this score.
     */
    public function wordOfDay(): BelongsTo
    {
        return $this->belongsTo(Word::class, 'word_id');
    }

    /**
     * Get the question (if sponsor trivia) for this score.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
