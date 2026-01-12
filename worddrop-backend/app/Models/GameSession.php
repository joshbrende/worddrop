<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class GameSession extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'crazygames_user_id',
        'session_token',
        'level_reached',
        'final_score',
        'words_found',
        'duration_seconds',
        'ended_at',
    ];

    protected function casts(): array
    {
        return [
            'level_reached' => 'integer',
            'final_score' => 'integer',
            'words_found' => 'integer',
            'duration_seconds' => 'integer',
            'ended_at' => 'datetime',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($session) {
            if (empty($session->id)) {
                $session->id = (string) Str::uuid();
            }
            if (empty($session->session_token)) {
                $session->session_token = Str::random(40);
            }
        });
    }

    /**
     * Get the user for this game session.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the scores for this game session.
     */
    public function scores(): HasMany
    {
        return $this->hasMany(Score::class);
    }
}
