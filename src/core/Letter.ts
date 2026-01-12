/**
 * Letter - Represents a falling letter
 * Framework-agnostic core game logic
 */

import type { Letter as LetterType, Position } from '../types/game';

export class Letter {
  public readonly letter: LetterType;
  public position: Position;
  public readonly id: string;
  public isBomb: boolean;

  constructor(letter: LetterType, position: Position, isBomb = false) {
    this.letter = letter;
    this.position = { ...position };
    this.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.isBomb = isBomb;
  }

  /**
   * Move letter to new position
   */
  moveTo(position: Position): void {
    this.position = { ...position };
  }

  /**
   * Move letter by delta
   */
  moveBy(deltaX: number, deltaY: number): void {
    this.position.x += deltaX;
    this.position.y += deltaY;
  }

  /**
   * Clone the letter
   */
  clone(): Letter {
    return new Letter(this.letter, { ...this.position }, this.isBomb);
  }
}

/**
 * Generate a random letter (A-Z)
 * Re-exported from LetterGenerator for better vowel distribution
 * This function is maintained for backward compatibility
 */
export { generateRandomLetter } from './LetterGenerator';
