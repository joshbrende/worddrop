/**
 * useKeyboard - Handles keyboard input for game controls
 */

import { useEffect } from 'react';

export interface KeyboardControls {
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onDrop?: () => void;
  onPause?: () => void;
  enabled?: boolean;
}

export function useKeyboard({
  onMoveLeft,
  onMoveRight,
  onDrop,
  onPause,
  enabled = true,
}: KeyboardControls): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let dropIntervalId: number | null = null;
    let isHoldingDown = false;

    const handleKeyDown = (event: KeyboardEvent): void => {
      // Prevent default browser behavior for game keys
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'Space', 'KeyA', 'KeyD', 'KeyS'].includes(event.code)) {
        event.preventDefault();
      }

      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          onMoveLeft?.();
          break;
        case 'ArrowRight':
        case 'KeyD':
          onMoveRight?.();
          break;
        case 'ArrowDown':
        case 'KeyS':
          // Fast drop - move one cell on first press, then repeat with interval if held
          if (!isHoldingDown) {
            isHoldingDown = true;
            onDrop?.();
            // Set up repeat interval for holding down (slower - 300ms = ~3 cells per second)
            dropIntervalId = window.setInterval(() => {
              onDrop?.();
            }, 300); // 300ms interval = ~3 cells per second (slower and more controllable)
          }
          break;
        case 'Space':
        case 'Escape':
          onPause?.();
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent): void => {
      if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        isHoldingDown = false;
        if (dropIntervalId !== null) {
          clearInterval(dropIntervalId);
          dropIntervalId = null;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (dropIntervalId !== null) {
        clearInterval(dropIntervalId);
      }
    };
  }, [onMoveLeft, onMoveRight, onDrop, onPause, enabled]);
}
