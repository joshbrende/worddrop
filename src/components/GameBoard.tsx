/**
 * GameBoard - Main game board component
 * Phase 1: Basic rendering of board and falling letters
 */

import React, { useCallback, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyboard } from '../hooks/useKeyboard';
import { useCanvasAnimation } from '../hooks/useCanvasAnimation';
import { GameCell } from './GameCell';
import { ScorePopup } from './ScorePopup';
import { PowerUps } from './PowerUps';
import { LevelUpBanner } from './LevelUpBanner';
import { TriviaModal } from './TriviaModal';
import { WordOfTheDayBanner } from './WordOfTheDayBanner';
import { PauseOverlay } from './PauseOverlay';
import { GameOverScreen } from './GameOverScreen';
import { BOARD_CONFIG } from '../constants/game';
import soundService from '../services/SoundService';
import { SOUND_MAPPINGS } from '../constants/sounds';
import type { PowerUpType } from '../types/game';
import './GameBoard.css';

interface GameBoardProps {
  gameMode?: 'normal' | 'word-of-day' | 'sponsor-trivia';
  onReturnToMenu?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameMode = 'normal', onReturnToMenu }) => {
  const {
    gameState,
    engine,
    moveLeft,
    moveRight,
    dropLetter,
    pause,
    resume,
    // reset, // Unused
    usePowerUp,
    completeLevelUp,
    // handleTriviaAnswer, // Unused
  } = useGameState({ gameMode });

  const isPaused = gameState?.isPaused ?? false;
  const isGameOver = gameState?.isGameOver ?? false;

  // Game loop
  useGameLoop(engine, isPaused || isGameOver);

  // Keyboard controls
  useKeyboard({
    onMoveLeft: moveLeft,
    onMoveRight: moveRight,
    onDrop: dropLetter,
    onPause: isPaused ? resume : pause,
    enabled: !isGameOver,
  });

  // Handle score popup removal
  const handlePopupComplete = useCallback((id: number) => {
    engine?.removeScorePopup(id);
  }, [engine]);

  // Handle power-up usage - use hook method for consistency
  const handleUsePowerUp = useCallback((type: PowerUpType, metadata?: Record<string, unknown>) => {
    usePowerUp(type, metadata);
  }, [usePowerUp]);

  // Handle level-up banner completion
  const handleLevelUpComplete = useCallback(() => {
    completeLevelUp();
  }, [completeLevelUp]);

  // Canvas animation hook
  const canvasRef = useCanvasAnimation();

  // Handle controls for repeat action (hold down)
  const controlIntervalRef = React.useRef<number | null>(null);

  const handleControlStart = (action: () => void, intervalMs: number = 200) => {
    // Execute immediately
    action();

    // Clear any existing interval
    if (controlIntervalRef.current) {
      clearInterval(controlIntervalRef.current);
    }

    // Start repeat interval
    controlIntervalRef.current = window.setInterval(action, intervalMs);
  };

  const handleControlEnd = () => {
    if (controlIntervalRef.current) {
      clearInterval(controlIntervalRef.current);
      controlIntervalRef.current = null;
    }
  };

  // Start in-game music when game board mounts (PLAY button was clicked, so user has interacted)
  useEffect(() => {
    // User clicked PLAY button, so music can play immediately
    soundService.playBackgroundMusic(SOUND_MAPPINGS.GAME_BACKGROUND);

    return () => {
      soundService.stopBackgroundMusic();
    };
  }, []);

  // Handle trivia answer - MUST be before any conditional returns
  const handleTriviaAnswerCallback = useCallback((isCorrect: boolean, selectedAnswer?: string) => {
    engine?.handleTriviaAnswer(isCorrect, selectedAnswer);
  }, [engine]);

  // Handle word of day banner complete - MUST be before any conditional returns
  const handleWordOfDayComplete = useCallback(() => {
    // Banner auto-hides, state is already updated
  }, []);

  // Handle restart game
  const handleRestart = useCallback(() => {
    if (engine) {
      engine.reset();
      // Game mode data will be reloaded automatically in reset()
    }
  }, [engine]);

  // Early return AFTER all hooks
  if (!gameState) {
    return <div className="game-loading">Loading game...</div>;
  }

  const currentPos = gameState.currentLetter?.position;
  const showLevelUpBanner = gameState.isLevelingUp && gameState.levelUpData;
  const showWordOfDayBanner = gameState.foundWordOfTheDay && gameState.wordOfTheDay;
  const showTrivia = gameState.showTriviaModal && gameState.currentSponsorQuestion;
  // const showSponsorWordBanner = gameState.pendingSponsorWord && !gameState.isPaused; // Unused

  return (
    <div className="game-board-container">
      {/* Word of the Day Banner */}
      {showWordOfDayBanner && gameState.wordOfTheDay && (
        <WordOfTheDayBanner
          wordOfTheDay={gameState.wordOfTheDay}
          onComplete={handleWordOfDayComplete}
        />
      )}

      {/* Trivia Modal */}
      {showTrivia && gameState.currentSponsorQuestion && (
        <TriviaModal
          question={gameState.currentSponsorQuestion}
          onAnswer={handleTriviaAnswerCallback}
        />
      )}

      {/* Level-Up Banner */}
      {showLevelUpBanner && (
        <LevelUpBanner
          level={gameState.levelUpData!.newLevel}
          points={gameState.levelUpData!.points}
          themeId={gameState.levelUpData!.themeId}
          onComplete={handleLevelUpComplete}
        />
      )}

      <div id="large-header" className="large-header">
        <canvas ref={canvasRef} className="demo-canvas" />
      </div>

      <div className="game-info">
        <div className="score">Score: {gameState.score}</div>
        <div className="level">Level: {gameState.level}</div>
        {gameState.comboCount > 0 && (
          <div className="combo-indicator">
            <span className="combo-label">Combo:</span>
            <span className="combo-value">{gameState.comboCount}x</span>
          </div>
        )}
        {gameState.nextLetter && (
          <div className="next-letter">
            <span className="next-label">Next:</span>
            <span className="next-letter-value">{gameState.nextLetter.letter}</span>
          </div>
        )}
        {isGameOver && <div className="game-over-indicator">GAME OVER</div>}
      </div>

      <div className="power-ups-container-wrapper">
        <PowerUps
          powerUps={gameState.powerUps || []}
          onUsePowerUp={handleUsePowerUp}
          onAddPowerUpUses={(type, amount) => engine?.addPowerUpUses(type, amount)}
          onPause={pause}
          onResume={resume}
          disabled={isPaused || isGameOver}
        />
      </div>

      {/* Game Over Screen */}
      {isGameOver && (
        <GameOverScreen
          score={gameState.score}
          level={gameState.level}
          wordsFound={gameState.wordsFound.length}
          maxCombo={gameState.maxCombo || 0}
          achievements={gameState.achievements || []}
          foundWordOfTheDay={gameState.foundWordOfTheDay}
          foundSponsorWord={gameState.foundSponsorWord}
          onRestart={handleRestart}
          onReturnToMenu={onReturnToMenu || (() => window.location.href = '/')}
        />
      )}

      {/* Pause Overlay - Only show if manually paused, not when banners/modals are showing or waiting for sponsor word */}
      {isPaused && !isGameOver && !showWordOfDayBanner && !showTrivia && !showLevelUpBanner && !gameState.pendingSponsorWord && (
        <PauseOverlay
          onResume={resume}
          wordOfTheDay={gameState.wordOfTheDay}
          onReturnToMenu={onReturnToMenu || (() => window.location.href = '/')}
        />
      )}

      <div className="game-board">
        <div className="game-board-grid">
          {Array.from({ length: BOARD_CONFIG.HEIGHT }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="board-row">
              {Array.from({ length: BOARD_CONFIG.WIDTH }).map((_, colIndex) => {
                const cell = gameState.board[rowIndex][colIndex];
                const isActive =
                  currentPos?.x === colIndex && currentPos?.y === rowIndex;

                // Show falling letter in active cell - if it's a bomb, hide the letter
                // GameCell component handles memoization, so object creation here is fine
                const displayCell = isActive && gameState.currentLetter
                  ? {
                    ...cell,
                    letter: gameState.currentLetter.isBomb ? null : gameState.currentLetter.letter,
                    isEmpty: false, // Always false when active letter is present
                    isBomb: gameState.currentLetter.isBomb,
                  }
                  : cell;

                return (
                  <GameCell
                    key={`${rowIndex}-${colIndex}`}
                    cell={displayCell}
                    isActive={isActive}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Score Popups - Centered on grid */}
        {gameState.scorePopups.map(popup => (
          <ScorePopup
            key={popup.id}
            score={popup.score}
            combo={popup.combo}
            word={popup.word}
            onComplete={() => handlePopupComplete(popup.id)}
          />
        ))}

        {/* Game Controls - At the bottom of the grid - Pointer events for mobile hold support */}
        <div className="game-controls">
          {/* Left Spacer (1 part) */}
          <div className="controls-section-left"></div>

          {/* Center Controls (3 parts) */}
          <div className="controls-section-center">
            <button
              className="control-button control-button-left"
              onPointerDown={(e) => {
                e.preventDefault(); // Prevent text selection/ghost clicks
                handleControlStart(moveLeft, 150);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                handleControlEnd();
              }}
              onPointerLeave={handleControlEnd}
              disabled={isPaused || isGameOver}
              title="Move Left (←/A)"
            >
              <span>←</span>
            </button>
            <button
              className="control-button control-button-drop"
              onPointerDown={(e) => {
                e.preventDefault();
                handleControlStart(dropLetter, 100); // Faster drop
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                handleControlEnd();
              }}
              onPointerLeave={handleControlEnd}
              disabled={isPaused || isGameOver}
              title="Drop (Space)"
            >
              <span>⬇</span>
              <span className="control-label">DROP</span>
            </button>
            <button
              className="control-button control-button-right"
              onPointerDown={(e) => {
                e.preventDefault();
                handleControlStart(moveRight, 150);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                handleControlEnd();
              }}
              onPointerLeave={handleControlEnd}
              disabled={isPaused || isGameOver}
              title="Move Right (→/D)"
            >
              <span>→</span>
            </button>
          </div>

          {/* Right Action (1 part) */}
          <div className="controls-section-right">
            <button
              className="control-button control-button-settings"
              onClick={isPaused ? resume : pause}
              title="Settings/Pause (P/ESC)"
            >
              <span>⚙️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
