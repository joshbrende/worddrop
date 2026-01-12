/**
 * useGameState - Manages game state and engine
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameEngine, type GameEngineState } from '../core/GameEngine';
import type { PowerUpType } from '../types/game';

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
    engine.setStateChangeCallback((state) => {
      setGameState(state);
    });
    engineRef.current = engine;
    setGameState(engine.getState());

    return () => {
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
