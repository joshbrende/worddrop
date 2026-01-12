/**
 * Power-Up configuration constants
 */

export const POWER_UP_CONFIG = {
  INITIAL_USES: 3,                    // Initial uses per power-up per game
  BOMB_SCORE: 100,                    // Points awarded for bomb explosion
  LIGHTNING_SCORE: 100,               // Points awarded for lightning clear
  WIND_SCORE: 100,                    // Points awarded for wind clear
  FREEZE_DURATION: 5000,              // ms - freeze effect duration (5 seconds)
  FREEZE_SPEED_MULTIPLIER: 0.5,       // 0.5 = 50% slower (multiply drop interval by 2)
} as const;

export const POWER_UP_ICONS = {
  bomb: '💣',
  lightning: '⚡',
  freeze: '❄️',
  wind: '🌬️',
  blank: '🔠',
} as const;

export const POWER_UP_LABELS = {
  bomb: 'Bomb',
  lightning: 'Lightning',
  freeze: 'Freeze',
  wind: 'Wind',
  blank: 'Choose Letter',
} as const;
