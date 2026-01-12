/**
 * Board - Manages the game board state
 * Framework-agnostic core game logic
 */

import type { Cell, Position } from '../types/game';
import { BOARD_CONFIG } from '../constants/game';

export class Board {
  private cells: Cell[][];

  constructor() {
    this.cells = this.createEmptyBoard();
  }

  /**
   * Create an empty board
   */
  private createEmptyBoard(): Cell[][] {
    return Array.from({ length: BOARD_CONFIG.HEIGHT }, () =>
      Array.from({ length: BOARD_CONFIG.WIDTH }, () => ({
        letter: null,
        isEmpty: true,
        isRemoving: false,
        isFrozen: false,
      }))
    );
  }

  /**
   * Get the board state
   */
  getCells(): Cell[][] {
    return this.cells.map(row => [...row]); // Return deep copy
  }

  /**
   * Get a specific cell
   */
  getCell(position: Position): Cell | null {
    if (!this.isValidPosition(position)) {
      return null;
    }
    return { ...this.cells[position.y][position.x] };
  }

  /**
   * Set a cell
   */
  setCell(position: Position, cell: Partial<Cell>): void {
    if (!this.isValidPosition(position)) {
      return;
    }
    
    // Merge with existing cell properties
    const existingCell = this.cells[position.y][position.x];
    const mergedCell = {
      ...existingCell,
      ...cell,
    };
    
    // Determine isEmpty based on letter value
    // If letter is explicitly set (even if null), use it to determine isEmpty
    if ('letter' in cell && cell.letter !== undefined) {
      mergedCell.isEmpty = (cell.letter === null);
    } else if ('isEmpty' in cell && cell.isEmpty !== undefined) {
      // If isEmpty is explicitly provided but letter is not, use the explicit value
      mergedCell.isEmpty = cell.isEmpty;
    } else if (!mergedCell.hasOwnProperty('isEmpty')) {
      // Fallback: determine from merged letter value
      mergedCell.isEmpty = (mergedCell.letter === null || mergedCell.letter === undefined);
    }
    
    this.cells[position.y][position.x] = mergedCell as Cell;
  }

  /**
   * Clear a cell
   */
  clearCell(position: Position): void {
    if (!this.isValidPosition(position)) {
      return;
    }
    this.setCell(position, {
      letter: null,
      isEmpty: true,
      isRemoving: false,
      isFrozen: false,
      isBomb: false,
    });
  }

  /**
   * Check if position is valid
   */
  isValidPosition(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < BOARD_CONFIG.WIDTH &&
      position.y >= 0 &&
      position.y < BOARD_CONFIG.HEIGHT
    );
  }

  /**
   * Check if cell is empty
   */
  isEmpty(position: Position): boolean {
    const cell = this.getCell(position);
    return cell?.isEmpty ?? false;
  }

  /**
   * Mark cells for removal (for animation)
   */
  markForRemoval(positions: Position[]): void {
    positions.forEach(pos => {
      if (this.isValidPosition(pos)) {
        this.setCell(pos, { isRemoving: true });
      }
    });
  }

  /**
   * Clear multiple cells
   */
  clearCells(positions: Position[]): void {
    positions.forEach(pos => this.clearCell(pos));
  }

  /**
   * Reset the board to empty state
   */
  reset(): void {
    this.cells = this.createEmptyBoard();
  }

  /**
   * Get all non-empty cells
   */
  getNonEmptyCells(): Array<{ position: Position; cell: Cell }> {
    const result: Array<{ position: Position; cell: Cell }> = [];
    for (let y = 0; y < BOARD_CONFIG.HEIGHT; y++) {
      for (let x = 0; x < BOARD_CONFIG.WIDTH; x++) {
        const cell = this.getCell({ x, y });
        if (cell && !cell.isEmpty) {
          result.push({ position: { x, y }, cell });
        }
      }
    }
    return result;
  }

  /**
   * Check if top row has any letters (game over condition)
   */
  isTopRowBlocked(): boolean {
    for (let x = 0; x < BOARD_CONFIG.WIDTH; x++) {
      const cell = this.getCell({ x, y: 0 });
      if (cell && !cell.isEmpty) {
        return true;
      }
    }
    return false;
  }
}
