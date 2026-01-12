/**
 * Animation constants - Duration and timing values
 */

export const ANIMATION_DURATIONS = {
  /** Word removal animation duration (ms) */
  WORD_REMOVAL: 400,
  
  /** Score popup display duration (ms) */
  SCORE_POPUP: 1000,
  
  /** Power-up effect duration (ms) */
  POWER_UP_EFFECT: 500,
  
  /** Freeze power-up duration (ms) */
  FREEZE_DURATION: 5000,
  
  /** Cascade delay between word checks (ms) */
  CASCADE_DELAY: 100,
  
  /** Gravity application delay (ms) */
  GRAVITY_DELAY: 50,
} as const;

/**
 * Animation easing functions
 */
export const ANIMATION_EASING = {
  EASE_OUT: 'ease-out',
  EASE_IN: 'ease-in',
  EASE_IN_OUT: 'ease-in-out',
  LINEAR: 'linear',
} as const;
