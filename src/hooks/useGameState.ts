/**
 * useGameState - Manages game state and engine
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameEngine, type GameEngineState } from '../core/GameEngine';
import type { PowerUpType } from '../types/game';
import crazyGamesService from '../services/CrazyGamesService';

interface UseGameStateOptions {
  gameMode?: 'normal' | 'word-of-day' | 'sponsor-trivia';
}

export function useGameState(options?: UseGameStateOptions) {
  const [gameState, setGameState] = useState<GameEngineState | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const gameMode = options?.gameMode || 'normal';

  // Initialize engine
  useEffect(() => {
    const engine = new GameEngine(gameMode); // Pass gameMode to constructor
    console.log('[useGameState] Initializing with game mode:', gameMode);

    // Load saved game data if in normal mode
    if (gameMode === 'normal') {
      crazyGamesService.loadData('worddrop_save_v1').then((data) => {
        if (data && engine) {
          console.log('[useGameState] Restoring saved game...');
          engine.restoreState(data);
        }
      });
    }

    engine.setStateChangeCallback((state) => {
      setGameState(state);
    });
    engineRef.current = engine;
    setGameState(engine.getState());

    // Auto-save interval (every 30 seconds)
    const saveInterval = setInterval(() => {
      // Check if engine exists and game is not over
      // Use getState().isGameOver because isGameOver is private
      if (engine && !engine.getState().isGameOver && gameMode === 'normal') {
        const state = engine.getPersistableState();
        // Only save if score > 0 to avoid overwriting with empty new games immediately
        if (state.score > 0) {
          crazyGamesService.saveData('worddrop_save_v1', state);
        }
      }
    }, 30000);

    return () => {
      // Save on unmount
      if (engine && !engine.getState().isGameOver && gameMode === 'normal') {
        const state = engine.getPersistableState();
        if (state.score > 0) {
          crazyGamesService.saveData('worddrop_save_v1', state);
        }
      }

      clearInterval(saveInterval);
      engineRef.current = null;
    };
  }, [gameMode]);

  // Game controls
  const moveLeft = useCallback((): void => {
    engineRef.current?.moveLetter('left');
  }, []);

  const moveRight = useCallback((): void => {
    engineRef.current?.moveLetter('right');
  }, []);

  const dropLetter = useCallback((): void => {
    engineRef.current?.dropLetter();
  }, []);

  const pause = useCallback((): void => {
    engineRef.current?.pause();
  }, []);

  const resume = useCallback((): void => {
    engineRef.current?.resume();
  }, []);

  const reset = useCallback((): void => {
    engineRef.current?.reset();
  }, []);

  const usePowerUp = useCallback((type: PowerUpType, metadata?: Record<string, unknown>): boolean => {
    return engineRef.current?.usePowerUp(type, metadata) ?? false;
  }, []);

  const completeLevelUp = useCallback((): void => {
    engineRef.current?.completeLevelUp();
  }, []);

  const handleTriviaAnswer = useCallback((isCorrect: boolean): void => {
    engineRef.current?.handleTriviaAnswer(isCorrect);
  }, []);

  return {
    gameState,
    engine: engineRef.current,
    moveLeft,
    moveRight,
    dropLetter,
    pause,
    resume,
    reset,
    usePowerUp,
    completeLevelUp,
    handleTriviaAnswer,
  };
}
