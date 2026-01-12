/**
 * Collision detection utilities
 * Pure functions for collision checking
 */

import type { Position } from '../types/game';
import { BOARD_CONFIG } from '../constants/game';

/**
 * Check if position is within board bounds
 */
export function isValidPosition(position: Position): boolean {
  return (
    position.x >= 0 &&
    position.x < BOARD_CONFIG.WIDTH &&
    position.y >= 0 &&
    position.y < BOARD_CONFIG.HEIGHT
  );
}

/**
 * Check if two positions are equal
 */
export function arePositionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * Calculate distance between two positions
 */
export function getDistance(pos1: Position, pos2: Position): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
