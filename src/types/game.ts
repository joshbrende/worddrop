/**
 * Core game type definitions
 * Framework-agnostic types for game logic
 */

export type Letter = 
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' 
  | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' 
  | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';

export interface Position {
  x: number;
  y: number;
}

export interface Cell {
  letter: Letter | null;
  isEmpty: boolean;
  isRemoving: boolean;
  isFrozen: boolean;
  isBomb?: boolean;
}

export interface FallingLetter {
  letter: Letter;
  position: Position;
  id: string;
  isBomb?: boolean;
}

export type Direction = 'left' | 'right' | 'down';

export interface DetectedWord {
  text: string;
  positions: Position[];
  orientation: 'horizontal' | 'vertical';
  startPosition: Position;
}

export interface GameState {
  board: Cell[][];
  currentLetter: FallingLetter | null;
  nextLetter: FallingLetter | null;
  score: number;
  level: number;
  comboCount: number;
  isGameOver: boolean;
  isPaused: boolean;
  wordsFound: string[];
  powerUps: PowerUp[]; // Power-up state
  isLevelingUp?: boolean; // Level-up banner is showing
  levelUpData?: {
    newLevel: number;
    points: number;
    themeId: string;
  } | null;
}

export interface ScoreCalculation {
  baseScore: number;
  letterScore: number;
  lengthBonus: number;
  multiplier: number;
  finalScore: number;
}

export type PowerUpType = 'bomb' | 'lightning' | 'freeze' | 'wind' | 'blank';

export interface PowerUp {
  type: PowerUpType;
  uses: number;
  isAvailable: boolean;
}

export interface PowerUpEffect {
  type: PowerUpType;
  duration?: number;
  position?: Position;
  metadata?: Record<string, unknown>;
}
