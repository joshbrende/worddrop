/**
 * Sound effect constants and mappings
 * Maps game activities to sound effect names
 */

import type { SoundEffectName } from '../services/SoundService';

/**
 * Sound mappings for game activities
 */
export const SOUND_MAPPINGS = {
  // UI Activities
  MENU_BACKGROUND: 'menu' as SoundEffectName,
  MENU_LOOP: 'loop_menu' as SoundEffectName,
  BUTTON_PRESS: 'button' as SoundEffectName,
  ERROR: 'error' as SoundEffectName,

  // Game Background Music
  GAME_BACKGROUND: 'music' as SoundEffectName,
  GAME_BACKGROUND_ALT: 'in_game' as SoundEffectName,

  // Word Formation
  WORD_FORMED: 'word_formed' as SoundEffectName,
  COMBO: 'combo' as SoundEffectName,

  // Level Progression
  LEVEL_UP: 'level_up' as SoundEffectName,

  // Letter Movement
  MOVE: 'move' as SoundEffectName,
  LETTER_DROP: 'letter_drop' as SoundEffectName,

  // Power-Ups
  BOMB: 'bomb' as SoundEffectName,
  LIGHTNING: 'lightning' as SoundEffectName,
  FREEZE: 'freeze' as SoundEffectName,
  WIND: 'wind' as SoundEffectName,

  // Game State
  GAME_OVER: 'game_over' as SoundEffectName,
} as const;

import soundService from '../services/SoundService';

/**
 * Helper function to play sound for an activity
 */
export const playSoundForActivity = (activity: keyof typeof SOUND_MAPPINGS): void => {
  const soundName = SOUND_MAPPINGS[activity];
  soundService.play(soundName);
};
