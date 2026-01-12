/**
 * Board-specific constants
 */

import { BOARD_CONFIG } from './game';

export const CELL_SIZE = {
  WIDTH: 48,  // px
  HEIGHT: 48, // px
} as const;

export const BOARD_PIXEL_DIMENSIONS = {
  WIDTH: BOARD_CONFIG.WIDTH * CELL_SIZE.WIDTH,
  HEIGHT: BOARD_CONFIG.HEIGHT * CELL_SIZE.HEIGHT,
} as const;
