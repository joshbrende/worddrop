<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Word extends Model
{
    protected $fillable = [
        'word',
        'question',
        'date',
        'category',
        'hint',
        'difficulty',
        'points',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_active' => 'boolean',
            'points' => 'integer',
        ];
    }

    /**
     * Get the user who created this word.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the scores for this word.
     */
    public function scores()
    {
        return $this->hasMany(Score::class);
    }

    /**
     * Scope to get active words.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get word for a specific date.
     */
    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }
}
