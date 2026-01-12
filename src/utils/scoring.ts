/**
 * Scoring utilities
 * Pure functions for calculating word scores
 */

import type { ScoreCalculation } from '../types/game';
import { SCORING_CONFIG, BOARD_CONFIG } from '../constants/game';

export interface ScoringOptions {
  word: string;
  orientation: 'horizontal' | 'vertical';
  comboCount: number;
  level: number;
  specialWordType?: 'word-of-day' | 'sponsor-trivia' | 'regular-trivia';
}

/**
 * Calculate score for a word
 * Returns breakdown of all score components
 */
export function calculateWordScore(options: ScoringOptions): ScoreCalculation {
  const { word, orientation, comboCount, level, specialWordType } = options;

  // Validate input - check word length matches game rules
  if (!word || typeof word !== 'string') {
    throw new Error(`Invalid word: ${word}`);
  }

  const wordLength = word.length;
  if (wordLength < BOARD_CONFIG.MIN_WORD_LENGTH || wordLength > BOARD_CONFIG.MAX_WORD_LENGTH) {
    throw new Error(`Invalid word length: "${word}" (length: ${wordLength}, required: ${BOARD_CONFIG.MIN_WORD_LENGTH}-${BOARD_CONFIG.MAX_WORD_LENGTH})`);
  }

  const upperWord = word.toUpperCase();
  // wordLength already calculated above

  // Calculate base points by word length
  const basePoints = calculateBasePoints(wordLength);

  // Calculate letter scores (sum of individual letter values)
  const letterScore = calculateLetterScore(upperWord);

  // Calculate length bonus (additional points for longer words)
  const lengthBonus = calculateLengthBonus(wordLength);

  // Calculate multipliers
  const comboMultiplier = calculateComboMultiplier(comboCount);
  const verticalMultiplier = orientation === 'vertical' ? SCORING_CONFIG.MULTIPLIERS.VERTICAL : 1.0;
  const levelMultiplier = calculateLevelMultiplier(level);
  const specialMultiplier = calculateSpecialMultiplier(specialWordType);

  // Total multiplier (multiply all multipliers together)
  const totalMultiplier = comboMultiplier * verticalMultiplier * levelMultiplier * specialMultiplier;

  // Calculate final score
  const baseScore = basePoints + letterScore + lengthBonus;
  const finalScore = Math.round(baseScore * totalMultiplier);

  return {
    baseScore,
    letterScore,
    lengthBonus,
    multiplier: totalMultiplier,
    finalScore,
  };
}

/**
 * Calculate base points by word length
 */
function calculateBasePoints(length: number): number {
  if (length >= 8) {
    return SCORING_CONFIG.BASE_POINTS[8];
  }
  
  const points = SCORING_CONFIG.BASE_POINTS[length as keyof typeof SCORING_CONFIG.BASE_POINTS];
  return points ?? 0;
}

/**
 * Calculate letter scores (sum of individual letter values)
 */
function calculateLetterScore(word: string): number {
  return word.split('').reduce((sum, letter) => {
    const letterScore = SCORING_CONFIG.LETTER_SCORES[letter as keyof typeof SCORING_CONFIG.LETTER_SCORES];
    return sum + (letterScore ?? 0);
  }, 0);
}

/**
 * Calculate length bonus
 * Longer words get additional bonus points
 */
function calculateLengthBonus(length: number): number {
  // Length bonus: +50 points per letter beyond minimum (3)
  if (length <= 3) {
    return 0;
  }
  return (length - 3) * 50;
}

/**
 * Calculate combo multiplier
 * Increases with consecutive words found within time limit
 */
function calculateComboMultiplier(comboCount: number): number {
  const { BASE, INCREMENT, MAX } = SCORING_CONFIG.MULTIPLIERS.COMBO;
  const multiplier = BASE + (comboCount * INCREMENT);
  return Math.min(multiplier, MAX);
}

/**
 * Calculate level multiplier
 * Increases slightly per level
 */
function calculateLevelMultiplier(level: number): number {
  const { BASE, INCREMENT } = SCORING_CONFIG.MULTIPLIERS.LEVEL;
  if (level < 1) {
    return BASE;
  }
  return BASE + ((level - 1) * INCREMENT);
}

/**
 * Calculate special word multiplier
 * For Word of Day, Sponsor Trivia, etc.
 */
function calculateSpecialMultiplier(
  specialWordType?: 'word-of-day' | 'sponsor-trivia' | 'regular-trivia'
): number {
  if (!specialWordType) {
    return 1.0;
  }

  const multipliers = SCORING_CONFIG.MULTIPLIERS.SPECIAL;
  switch (specialWordType) {
    case 'word-of-day':
      return multipliers.WORD_OF_DAY;
    case 'sponsor-trivia':
      return multipliers.SPONSOR_TRIVIA;
    case 'regular-trivia':
      return multipliers.REGULAR_TRIVIA;
    default:
      return 1.0;
  }
}

/**
 * Calculate score for intersection (double letter score)
 * When a letter is part of multiple words
 */
export function calculateIntersectionBonus(
  letter: string,
  wordCount: number
): number {
  if (wordCount <= 1) {
    return 0;
  }

  const letterScore = SCORING_CONFIG.LETTER_SCORES[letter.toUpperCase() as keyof typeof SCORING_CONFIG.LETTER_SCORES] ?? 0;
  // Each additional word after first gets letter score again
  return letterScore * (wordCount - 1);
}

/**
 * Check if word count milestone is reached and return bonus
 */
export function getMilestoneBonus(wordCount: number): number {
  const milestones = SCORING_CONFIG.BONUS_POINTS.MILESTONE;
  const milestoneKeys = Object.keys(milestones).map(Number).sort((a, b) => b - a);
  
  for (const milestone of milestoneKeys) {
    if (wordCount >= milestone) {
      return milestones[milestone as keyof typeof milestones];
    }
  }
  
  return 0;
}
