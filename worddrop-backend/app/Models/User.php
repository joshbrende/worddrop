<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'api_token',
        'role',
        'crazygames_user_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the words created by this user.
     */
    public function createdWords()
    {
        return $this->hasMany(Word::class, 'created_by');
    }

    /**
     * Get the questions created by this user.
     */
    public function createdQuestions()
    {
        return $this->hasMany(Question::class, 'created_by');
    }

    /**
     * Get the game sessions for this user.
     */
    public function gameSessions()
    {
        return $this->hasMany(GameSession::class);
    }

    /**
     * Get the scores for this user.
     */
    public function scores()
    {
        return $this->hasMany(Score::class);
    }

    /**
     * Get the leaderboard entry for this user.
     */
    public function leaderboard()
    {
        return $this->hasOne(Leaderboard::class);
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Find or create user by CrazyGames user ID
     */
    public static function findByCrazyGamesId(string $crazygamesUserId): ?self
    {
        return self::where('crazygames_user_id', $crazygamesUserId)->first();
    }

    /**
     * Create user from CrazyGames user ID (for guest users who sign up)
     */
    public static function createFromCrazyGames(string $crazygamesUserId, ?string $name = null): self
    {
        return self::create([
            'crazygames_user_id' => $crazygamesUserId,
            'name' => $name ?? 'Player ' . substr($crazygamesUserId, -6),
            'email' => $crazygamesUserId . '@crazygames.local', // Placeholder email
            'password' => bcrypt(Str::random(32)), // Random password, not used
            'role' => 'player',
        ]);
    }
}