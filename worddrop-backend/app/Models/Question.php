<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Question extends Model
{
    protected $fillable = [
        'sponsor_id',
        'question',
        'answer',
        'options',
        'category',
        'difficulty',
        'points',
        'base_points',
        'bonus_multiplier',
        'hint',
        'is_active',
        'priority',
        'starts_at',
        'ends_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'points' => 'integer',
            'base_points' => 'integer',
            'bonus_multiplier' => 'decimal:2',
            'priority' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'options' => 'array', // JSON array of multiple choice options
        ];
    }

    /**
     * Get the sponsor for this question.
     */
    public function sponsor(): BelongsTo
    {
        return $this->belongsTo(Sponsor::class);
    }

    /**
     * Get the user who created this question.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the scores for this question.
     */
    public function scores()
    {
        return $this->hasMany(Score::class);
    }

    /**
     * Scope to get active questions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', now());
            });
    }

    /**
     * Scope to get questions for a sponsor.
     */
    public function scopeForSponsor($query, $sponsorId)
    {
        return $query->where('sponsor_id', $sponsorId);
    }
}
