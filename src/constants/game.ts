/**
 * Game configuration constants
 * All magic numbers extracted here for easy balancing
 */

export const BOARD_CONFIG = {
  WIDTH: 8,
  HEIGHT: 12,
  MIN_WORD_LENGTH: 3,
  MAX_WORD_LENGTH: 8,
} as const;

export const DROP_CONFIG = {
  BASE_INTERVAL: 1000,              // ms - initial drop speed
  MIN_INTERVAL: 100,                // ms - maximum speed (fastest)
  SPEED_INCREASE_PER_LEVEL: 100,    // ms - how much faster per level
  FAST_DROP_INTERVAL: 50,           // ms - fast drop speed when holding down (slower than instant)
} as const;

export const SCORING_CONFIG = {
  BASE_POINTS: {
    3: 100,
    4: 200,
    5: 400,
    6: 800,
    7: 1600,
    8: 3200,
  } as const,
  
  LETTER_SCORES: {
    A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
    K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
    U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
  } as const,
  
  MULTIPLIERS: {
    VERTICAL: 1.5,
    COMBO: {
      BASE: 1.0,
      INCREMENT: 0.2,
      MAX: 3.0,
      RESET_TIME: 5000, // ms
    },
    LEVEL: {
      BASE: 1.0,
      INCREMENT: 0.1,
    },
    SPECIAL: {
      WORD_OF_DAY: 3.0,
      SPONSOR_TRIVIA: 2.5,
      REGULAR_TRIVIA: 2.0,
    },
  },
  
  BONUS_POINTS: {
    INTERSECTION: 1.5,
    MILESTONE: {
      50: 500,
      100: 1000,
      200: 2000,
      300: 3000,
      400: 4000,
      500: 5000,
    },
  },
} as const;

export const LEVEL_CONFIG = {
  MAX_LEVEL: 8,
  LEVEL_THEMES: {
    1: 'neon-blue',
    2: 'hot-pink',
    3: 'electric-green',
    4: 'deep-purple',
    5: 'bright-yellow',
    6: 'neon-orange',
    7: 'cyan-wave',
    8: 'magenta-storm',
  } as const,
  POINTS_THRESHOLDS: {
    1: 0,        // Start at level 1
    2: 1000,     // 1,000 points to reach level 2
    3: 3500,     // 2,500 more (total 3,500) to reach level 3
    4: 8500,     // 5,000 more (total 8,500) to reach level 4
    5: 16000,    // 7,500 more (total 16,000) to reach level 5
    6: 26000,    // 10,000 more (total 26,000) to reach level 6
    7: 41000,    // 15,000 more (total 41,000) to reach level 7
    8: 61000,    // 20,000 more (total 61,000) to reach level 8
  } as const,
  SPEED_INCREASE_PER_LEVEL: 100, // ms - decrease drop interval per level (makes letters fall faster)
} as const;

/**
 * Calculate drop speed for a given level
 * Lower interval = faster drop speed
 * Level 1: 1000ms, Level 2: 900ms, Level 3: 800ms, etc.
 */
export const calculateDropSpeed = (level: number): number => {
  return Math.max(
    DROP_CONFIG.BASE_INTERVAL - ((level - 1) * DROP_CONFIG.SPEED_INCREASE_PER_LEVEL),
    DROP_CONFIG.MIN_INTERVAL
  );
};

export const GAME_OVER_CONFIG = {
  TOP_ROW_BLOCKED: true, // Game over when top row has letters
} as const;

export type LetterScoreKey = keyof typeof SCORING_CONFIG.LETTER_SCORES;
