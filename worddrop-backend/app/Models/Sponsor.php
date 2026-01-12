<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Sponsor extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'logo_url',
        'website_url',
        'description',
        'contact_email',
        'contact_name',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($sponsor) {
            if (empty($sponsor->slug)) {
                $sponsor->slug = Str::slug($sponsor->name);
            }
        });
    }

    /**
     * Get the questions for this sponsor.
     */
    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    /**
     * Scope to get active sponsors.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
