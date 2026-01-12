/**
 * GameCell - Individual cell component
 * Memoized to prevent unnecessary re-renders
 */

import React, { memo } from 'react';
import type { Cell } from '../types/game';
import './GameCell.css';

interface GameCellProps {
  cell: Cell;
  isActive?: boolean; // Current falling letter position
}

export const GameCell: React.FC<GameCellProps> = memo(({ cell, isActive = false }) => {
  // Cell structure must always be rendered - it's part of the grid
  // Only the letter content is removed, not the cell itself
  return (
    <div
      className={`game-cell ${cell.isEmpty ? 'empty' : 'filled'} ${
        cell.isRemoving ? 'removing' : ''
      } ${cell.isFrozen ? 'frozen' : ''} ${isActive ? 'active' : ''} ${
        cell.isBomb ? 'bomb' : ''
      }`}
    >
      {/* Only render letter if it exists AND it's not a bomb - bombs show icon instead */}
      {cell.letter && !cell.isBomb && (
        <span className={`cell-letter ${cell.isRemoving ? 'removing' : ''}`}>
          {cell.letter}
        </span>
      )}
      {/* Show bomb icon when isBomb is true - hides the letter */}
      {cell.isBomb && <span className="bomb-icon">💣</span>}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if cell properties or active state change
  return (
    prevProps.cell.letter === nextProps.cell.letter &&
    prevProps.cell.isEmpty === nextProps.cell.isEmpty &&
    prevProps.cell.isRemoving === nextProps.cell.isRemoving &&
    prevProps.cell.isFrozen === nextProps.cell.isFrozen &&
    prevProps.cell.isBomb === nextProps.cell.isBomb &&
    prevProps.isActive === nextProps.isActive
  );
});

GameCell.displayName = 'GameCell';
