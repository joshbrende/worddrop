/**
 * App - Main application component
 * Handles navigation: Splash Screen -> Menu -> Game
 */

import React, { useEffect, useState, useCallback } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SplashScreen } from './components/SplashScreen';
import { MenuScreen } from './components/MenuScreen';
import { GameBoard } from './components/GameBoard';
import dictionaryService from './services/DictionaryService';
import soundService from './services/SoundService';
import { SOUND_MAPPINGS } from './constants/sounds';
import './App.css';

type AppState = 'splash' | 'menu' | 'game';
type GameMode = 'normal' | 'word-of-day' | 'sponsor-trivia' | undefined;

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('splash');
  const [gameMode, setGameMode] = useState<GameMode>(undefined);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('INITIALIZING SYSTEM');

  // Initialize sound service early
  useEffect(() => {
    soundService.initialize();
  }, []);

  // Initialize dictionary service and simulate loading progress
  // Dictionary loads in background - transition doesn't wait for it
  useEffect(() => {
    let progressInterval: number | undefined;
    let currentProgress = 0;

    console.log('[App] Starting initialization...');

    // Start dictionary loading in background (fire and forget)
    // Dictionary has fallback, so it's safe to load async
    console.log('[App] Starting dictionary initialization in background...');
    dictionaryService
      .initialize()
      .then(() => {
        const size = dictionaryService.getDictionarySize();
        console.log(`[App] ✅ Dictionary loaded in background: ${size} words available`);
      })
      .catch((error) => {
        console.warn('[App] ⚠️ Dictionary loading error (using fallback):', error);
      });

    // Simulate loading progress - gradually increase to 100% independently
    // Don't wait for dictionary - it loads in background
    progressInterval = window.setInterval(() => {
      currentProgress += Math.random() * 10 + 3; // Random increment between 3-13%
      
      if (currentProgress >= 100) {
        // Reach 100% and stop
        currentProgress = 100;
        setLoadingProgress(100);
        setLoadingMessage('LOADING COMPLETE');
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = undefined;
        }
        console.log('[App] Progress reached 100% - ready to transition');
      } else {
        setLoadingProgress(Math.min(100, Math.round(currentProgress)));

        // Update loading message based on progress
        if (currentProgress < 30) {
          setLoadingMessage('INITIALIZING SYSTEM');
        } else if (currentProgress < 60) {
          setLoadingMessage('LOADING DICTIONARY');
        } else if (currentProgress < 95) {
          setLoadingMessage('PREPARING GAME');
        } else {
          setLoadingMessage('LOADING COMPLETE');
        }
      }
    }, 200);

    return () => {
      console.log('[App] Cleanup: clearing progress interval');
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, []);

  const handleSplashComplete = useCallback(() => {
    console.log('[App] handleSplashComplete called - transitioning to menu');
    // User has interacted with splash screen (page loaded), so music can play
    // The SoundService interaction listener will have detected the page load/view
    // Start menu music after transition
    setTimeout(() => {
      soundService.playBackgroundMusic(SOUND_MAPPINGS.MENU_BACKGROUND);
    }, 100);
    setAppState('menu');
  }, []);

  const handleStartGame = (mode?: 'normal' | 'word-of-day' | 'sponsor-trivia') => {
    setGameMode(mode || 'normal');
    setAppState('game');
  };

  const handleReturnToMenu = () => {
    setAppState('menu');
  };

  return (
    <ErrorBoundary>
      <div className="app">
        {appState === 'splash' && (
          <ErrorBoundary>
            <SplashScreen
              onComplete={handleSplashComplete}
              loadingProgress={loadingProgress}
              loadingMessage={loadingMessage}
            />
          </ErrorBoundary>
        )}

        {appState === 'menu' && (
          <ErrorBoundary>
            <MenuScreen onStartGame={handleStartGame} />
          </ErrorBoundary>
        )}

        {appState === 'game' && (
          <ErrorBoundary>
            <GameBoard gameMode={gameMode} onReturnToMenu={handleReturnToMenu} />
          </ErrorBoundary>
        )}
      </div>
    </ErrorBoundary>
  );
};
