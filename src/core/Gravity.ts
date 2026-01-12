/**
 * Gravity - Applies gravity to the board
 * Framework-agnostic core game logic
 */

import type { Cell } from '../types/game';
import { BOARD_CONFIG } from '../constants/game';

export class Gravity {
  /**
   * Applies gravity to board - letters fall down
   * Returns true if any letters moved
   */
  apply(board: Cell[][]): boolean {
    let moved = false;

    // Process from bottom to top (important for correct gravity)
    for (let row = BOARD_CONFIG.HEIGHT - 2; row >= 0; row--) {
      for (let col = 0; col < BOARD_CONFIG.WIDTH; col++) {
        if (this.canFall(board, row, col)) {
          this.fall(board, row, col);
          moved = true;
        }
      }
    }

    return moved;
  }

  /**
   * Applies gravity until stable (no more moves possible)
   * Returns true if any movement occurred
   */
  applyUntilStable(board: Cell[][]): boolean {
    let iterations = 0;
    let anyMoved = false;
    const MAX_ITERATIONS = 100; // Safety limit to prevent infinite loops

    while (iterations < MAX_ITERATIONS) {
      const moved = this.apply(board);
      if (!moved) {
        break; // No more movement possible
      }
      anyMoved = true;
      iterations++;
    }

    if (iterations >= MAX_ITERATIONS) {
      console.error('⚠️ Gravity application exceeded max iterations - possible infinite loop');
    } else if (anyMoved) {
      console.log(`✅ Gravity applied: ${iterations} iteration(s) to stabilize`);
    }

    return anyMoved;
  }

  /**
   * Check if cell can fall down
   */
  private canFall(board: Cell[][], row: number, col: number): boolean {
    // Check if cell has a letter
    if (!board[row] || !board[row][col] || board[row][col].isEmpty) {
      return false;
    }

    // Check if cell is frozen (can't fall)
    if (board[row][col].isFrozen) {
      return false;
    }

    // Check if cell is being removed (don't apply gravity during removal)
    if (board[row][col].isRemoving) {
      return false;
    }

    // Check if there's space below
    if (row + 1 >= BOARD_CONFIG.HEIGHT) {
      return false;
    }

    // Check if cell below is empty
    return board[row + 1][col].isEmpty && !board[row + 1][col].isRemoving;
  }

  /**
   * Move cell down one row
   */
  private fall(board: Cell[][], row: number, col: number): void {
    if (row + 1 >= BOARD_CONFIG.HEIGHT) {
      return;
    }

    // Swap cells
    const temp = board[row][col];
    board[row][col] = {
      letter: null,
      isEmpty: true,
      isRemoving: false,
      isFrozen: false,
    };
    board[row + 1][col] = temp;
  }
}
