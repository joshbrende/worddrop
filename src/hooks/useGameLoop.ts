/**
 * useGameLoop - Frame-rate independent game loop hook
 */

import { useEffect, useRef } from 'react';
import type { GameEngine } from '../core/GameEngine';

export function useGameLoop(engine: GameEngine | null, isPaused: boolean): void {
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!engine || isPaused) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
      return;
    }

    let lastTime = performance.now();

    const loop = (currentTime: number): void => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Cap deltaTime to prevent huge jumps (e.g., tab switching)
      const clampedDeltaTime = Math.min(deltaTime, 100); // Max 100ms per frame

      // Frame-rate independent update
      engine.update(clampedDeltaTime);

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
    };
  }, [engine, isPaused]);
}
