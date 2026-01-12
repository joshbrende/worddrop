<?php

namespace App\Services;

use App\Models\Question;

class SponsorQuestionScoringService
{
    // Scoring constants matching frontend
    const BASE_POINTS = 100;
    const WORD_LENGTH_BONUS = 20; // Points per letter
    const DIFFICULTY_MULTIPLIER = [
        'easy' => 1.0,
        'medium' => 1.5,
        'hard' => 2.5,
    ];
    const CATEGORY_BONUS = [
        'Finance' => 1.3,
        'Technology' => 1.2,
        'E-Commerce' => 1.2,
        'Luxury' => 1.2,
        'Automotive' => 1.1,
        'Kids' => 1.0,
        'Education' => 1.1,
        'Fast Food' => 1.0,
        'Beverages' => 1.0,
        'Sportswear' => 1.0,
        'Retail' => 1.0,
        'Coffee' => 1.0,
        'Streaming' => 1.0,
        'Chocolate' => 1.0,
        'Snacks' => 1.0,
        'Ice Cream' => 1.0,
        'Fast Fashion' => 1.0,
        'Social Media' => 1.0,
        'Gaming' => 1.0,
        'Cameras' => 1.0,
        'Luxury Cars' => 1.0,
    ];
    const COMBO_MULTIPLIER = 0.1; // 10% increase per combo

    /**
     * Calculate points for a sponsor question
     * 
     * Formula: (basePoints + wordLengthBonus) * difficultyMultiplier * categoryBonus * bonusMultiplier
     */
    public function calculatePoints(Question $question, int $comboCount = 1): int
    {
        // Use question's base_points if set, otherwise use default
        $basePoints = $question->base_points ?? self::BASE_POINTS;
        
        // Word length bonus
        $wordLengthBonus = strlen($question->answer) * self::WORD_LENGTH_BONUS;
        
        // Difficulty multiplier
        $difficultyMultiplier = self::DIFFICULTY_MULTIPLIER[$question->difficulty ?? 'easy'] ?? 1.0;
        
        // Category bonus
        $categoryBonus = self::CATEGORY_BONUS[$question->category ?? ''] ?? 1.0;
        
        // Question's custom bonus multiplier
        $bonusMultiplier = $question->bonus_multiplier ?? 1.0;
        
        // Combo multiplier
        $comboBonus = 1 + (($comboCount - 1) * self::COMBO_MULTIPLIER);
        
        // Calculate final points
        $points = round(
            ($basePoints + $wordLengthBonus) * 
            $difficultyMultiplier * 
            $categoryBonus * 
            $bonusMultiplier *
            $comboBonus
        );
        
        return max($points, 0); // Ensure non-negative
    }

    /**
     * Get scoring breakdown for debugging
     */
    public function getScoringBreakdown(Question $question, int $comboCount = 1): array
    {
        $basePoints = $question->base_points ?? self::BASE_POINTS;
        $wordLengthBonus = strlen($question->answer) * self::WORD_LENGTH_BONUS;
        $difficultyMultiplier = self::DIFFICULTY_MULTIPLIER[$question->difficulty ?? 'easy'] ?? 1.0;
        $categoryBonus = self::CATEGORY_BONUS[$question->category ?? ''] ?? 1.0;
        $bonusMultiplier = $question->bonus_multiplier ?? 1.0;
        $comboBonus = 1 + (($comboCount - 1) * self::COMBO_MULTIPLIER);
        
        $finalPoints = $this->calculatePoints($question, $comboCount);
        
        return [
            'base_points' => $basePoints,
            'word_length_bonus' => $wordLengthBonus,
            'word_length' => strlen($question->answer),
            'difficulty_multiplier' => $difficultyMultiplier,
            'category_bonus' => $categoryBonus,
            'bonus_multiplier' => $bonusMultiplier,
            'combo_bonus' => $comboBonus,
            'combo_count' => $comboCount,
            'final_points' => $finalPoints,
            'calculation' => sprintf(
                '(%d + %d) * %.2f * %.2f * %.2f * %.2f = %d',
                $basePoints,
                $wordLengthBonus,
                $difficultyMultiplier,
                $categoryBonus,
                $bonusMultiplier,
                $comboBonus,
                $finalPoints
            ),
        ];
    }
}
