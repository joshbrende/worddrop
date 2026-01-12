<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Services\SponsorQuestionScoringService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    protected SponsorQuestionScoringService $scoringService;

    public function __construct(SponsorQuestionScoringService $scoringService)
    {
        $this->scoringService = $scoringService;
    }

    /**
     * Get random active sponsor question
     * Matches frontend structure from sponsorQuestions.ts
     */
    public function getRandom(Request $request): JsonResponse
    {
        $level = (int) $request->query('level', 1);
        $comboCount = (int) $request->query('combo_count', 1);
        
        // Determine difficulty based on level (matching frontend logic)
        $difficulty = match(true) {
            $level <= 5 => 'easy',
            $level <= 15 => 'medium',
            default => 'hard',
        };
        
        $question = Question::active()
            ->where('difficulty', $difficulty)
            ->inRandomOrder()
            ->with('sponsor:id,name,slug,logo_url')
            ->first();
        
        if (!$question) {
            // Fallback to any active question
            $question = Question::active()
                ->inRandomOrder()
                ->with('sponsor:id,name,slug,logo_url')
                ->first();
        }
        
        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'No active questions available',
            ], 404);
        }
        
        // Calculate points using scoring service
        $calculatedPoints = $this->scoringService->calculatePoints($question, $comboCount);
        
        // Generate multiple choice options if not provided
        $options = $question->options;
        if (empty($options) || !is_array($options) || count($options) < 2) {
            // Auto-generate options: correct answer + 3 random wrong answers
            $options = $this->generateMultipleChoiceOptions($question->answer, $question->category);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $question->id,
                'sponsor' => $question->sponsor->name,
                'sponsorLogo' => $question->sponsor->logo_url,
                'sponsorDetails' => [
                    'id' => $question->sponsor->id,
                    'name' => $question->sponsor->name,
                    'slug' => $question->sponsor->slug,
                    'logo_url' => $question->sponsor->logo_url,
                ],
                'question' => $question->question,
                'answer' => $question->answer,
                'options' => $options, // Multiple choice options
                'category' => $question->category,
                'difficulty' => $question->difficulty,
                'points' => $calculatedPoints, // Calculated points
                'basePoints' => $question->base_points ?? SponsorQuestionScoringService::BASE_POINTS,
                'bonusMultiplier' => $question->bonus_multiplier ?? 1.0,
                'hint' => $question->hint,
                'type' => 'sponsor',
                'date' => now()->toDateString(),
            ],
        ]);
    }

    /**
     * Get specific question by ID
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $comboCount = (int) $request->query('combo_count', 1);
        
        $question = Question::active()
            ->with('sponsor:id,name,slug,logo_url,website_url,description')
            ->find($id);
        
        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Question not found',
            ], 404);
        }
        
        // Calculate points using scoring service
        $calculatedPoints = $this->scoringService->calculatePoints($question, $comboCount);
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $question->id,
                'sponsor' => $question->sponsor->name,
                'sponsorLogo' => $question->sponsor->logo_url,
                'sponsorDetails' => [
                    'id' => $question->sponsor->id,
                    'name' => $question->sponsor->name,
                    'slug' => $question->sponsor->slug,
                    'logo_url' => $question->sponsor->logo_url,
                    'website_url' => $question->sponsor->website_url,
                    'description' => $question->sponsor->description,
                ],
                'question' => $question->question,
                'answer' => $question->answer,
                'options' => $question->options ?? $this->generateMultipleChoiceOptions($question->answer, $question->category),
                'category' => $question->category,
                'difficulty' => $question->difficulty,
                'points' => $calculatedPoints,
                'basePoints' => $question->base_points ?? SponsorQuestionScoringService::BASE_POINTS,
                'bonusMultiplier' => $question->bonus_multiplier ?? 1.0,
                'hint' => $question->hint,
                'type' => 'sponsor',
            ],
        ]);
    }

    /**
     * Generate multiple choice options from answer
     * Creates 3 wrong answers from other questions or a word list
     */
    private function generateMultipleChoiceOptions(string $correctAnswer, ?string $category = null): array
    {
        $correct = strtoupper(trim($correctAnswer));
        $options = [$correct];
        $wrongAnswers = [];
        
        // Strategy 1: Get answers from other questions in the same category
        if ($category) {
            $otherAnswers = Question::where('category', $category)
                ->where('answer', '!=', $correct)
                ->where('is_active', true)
                ->inRandomOrder()
                ->limit(10)
                ->pluck('answer')
                ->map(fn($answer) => strtoupper(trim($answer)))
                ->filter(fn($answer) => $answer !== $correct && strlen($answer) > 0)
                ->unique()
                ->values()
                ->toArray();
            
            if (count($otherAnswers) >= 3) {
                $wrongAnswers = array_slice($otherAnswers, 0, 3);
            }
        }
        
        // Strategy 2: Get answers from any other questions if we don't have enough
        if (count($wrongAnswers) < 3) {
            $moreAnswers = Question::where('answer', '!=', $correct)
                ->where('is_active', true)
                ->inRandomOrder()
                ->limit(20)
                ->pluck('answer')
                ->map(fn($answer) => strtoupper(trim($answer)))
                ->filter(fn($answer) => $answer !== $correct && strlen($answer) > 0 && !in_array($answer, $wrongAnswers))
                ->unique()
                ->values()
                ->toArray();
            
            $wrongAnswers = array_merge($wrongAnswers, array_slice($moreAnswers, 0, 3 - count($wrongAnswers)));
        }
        
        // Strategy 3: Use a comprehensive word list as fallback
        if (count($wrongAnswers) < 3) {
            $wordList = $this->getWordList();
            $answerLength = strlen($correct);
            
            // Filter words by similar length (within 2 characters)
            $similarLengthWords = array_filter($wordList, function($word) use ($correct, $answerLength) {
                $wordUpper = strtoupper(trim($word));
                return $wordUpper !== $correct 
                    && strlen($wordUpper) >= max(1, $answerLength - 2)
                    && strlen($wordUpper) <= $answerLength + 2
                    && !in_array($wordUpper, $wrongAnswers);
            });
            
            if (count($similarLengthWords) > 0) {
                $similarWords = array_values($similarLengthWords);
                shuffle($similarWords);
                $wrongAnswers = array_merge($wrongAnswers, array_slice($similarWords, 0, 3 - count($wrongAnswers)));
            }
        }
        
        // Strategy 4: Generate variations if still not enough
        if (count($wrongAnswers) < 3) {
            $variations = $this->generateWordVariations($correct);
            $wrongAnswers = array_merge($wrongAnswers, array_slice($variations, 0, 3 - count($wrongAnswers)));
        }
        
        // Ensure we have exactly 3 wrong answers
        while (count($wrongAnswers) < 3) {
            $wrongAnswers[] = $this->generateRandomWord();
        }
        
        // Add wrong answers and shuffle
        $options = array_merge($options, array_slice($wrongAnswers, 0, 3));
        shuffle($options);
        
        return $options;
    }
    
    /**
     * Get a comprehensive word list for generating wrong answers
     */
    private function getWordList(): array
    {
        return [
            // Common words
            'APPLE', 'BANANA', 'CHERRY', 'DANCE', 'EAGLE', 'FLOWER', 'GARDEN', 'HAPPY', 'ISLAND', 'JUNGLE',
            'KITTEN', 'LIGHT', 'MUSIC', 'NIGHT', 'OCEAN', 'PAPER', 'QUICK', 'RIVER', 'SUNNY', 'TIGER',
            'UNITY', 'VOICE', 'WATER', 'XENON', 'YELLOW', 'ZEBRA',
            // Colors
            'RED', 'BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'PURPLE', 'PINK', 'BLACK', 'WHITE', 'GRAY', 'BROWN',
            // Numbers
            'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
            // Animals
            'LION', 'BEAR', 'WOLF', 'DEER', 'BIRD', 'FISH', 'SNAKE', 'MOUSE', 'HORSE', 'COW', 'PIG', 'DOG', 'CAT',
            // Sports
            'SOCCER', 'TENNIS', 'GOLF', 'SWIM', 'RUN', 'JUMP', 'SKATE', 'SKI', 'SURF', 'CLIMB',
            // Geography
            'MOUNTAIN', 'VALLEY', 'FOREST', 'DESERT', 'BEACH', 'LAKE', 'RIVER', 'OCEAN', 'ISLAND', 'CITY',
            // Technology
            'COMPUTER', 'PHONE', 'TABLET', 'CAMERA', 'SCREEN', 'KEYBOARD', 'MOUSE', 'SPEAKER', 'HEADPHONE',
            // Food
            'PIZZA', 'BURGER', 'SALAD', 'BREAD', 'CHEESE', 'MILK', 'JUICE', 'COFFEE', 'TEA', 'CAKE',
            // Body parts
            'HEAD', 'HAND', 'FOOT', 'EYE', 'EAR', 'NOSE', 'MOUTH', 'ARM', 'LEG', 'BACK',
            // Actions
            'RUN', 'WALK', 'JUMP', 'SIT', 'STAND', 'SLEEP', 'EAT', 'DRINK', 'READ', 'WRITE',
        ];
    }
    
    /**
     * Generate word variations (similar length, different letters)
     */
    private function generateWordVariations(string $word): array
    {
        $variations = [];
        $length = strlen($word);
        $wordList = $this->getWordList();
        
        // Find words of similar length
        $similarWords = array_filter($wordList, function($w) use ($word, $length) {
            $wUpper = strtoupper(trim($w));
            return strlen($wUpper) === $length && $wUpper !== $word;
        });
        
        return array_values(array_slice($similarWords, 0, 3));
    }
    
    /**
     * Generate a random word as last resort
     */
    private function generateRandomWord(): string
    {
        $wordList = $this->getWordList();
        return strtoupper($wordList[array_rand($wordList)]);
    }
}
