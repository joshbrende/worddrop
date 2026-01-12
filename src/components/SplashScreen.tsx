/**
 * SplashScreen - Initial loading/splash screen
 * Shows logo and loading progress
 * Simplified version with CSS transitions instead of complex interval logic
 */

import React, { useEffect, useState, useRef } from 'react';
import soundService from '../services/SoundService';
import './SplashScreen.css';

interface SplashScreenProps {
  onComplete: () => void;
  loadingProgress: number; // 0-100
  loadingMessage?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  loadingProgress,
  loadingMessage = 'INITIALIZING SYSTEM' 
}) => {
  // Visual progress that animates smoothly towards loadingProgress
  const [progress, setProgress] = useState(0);
  const transitionStartedRef = useRef(false);

  // Mark user interaction when splash screen is clicked/tapped
  // This enables audio playback for subsequent screens
  useEffect(() => {
    const handleInteraction = () => {
      // Any interaction on splash screen enables audio
      // The SoundService will detect this and allow music to play
    };

    // Listen for any interaction - page view counts as interaction for splash
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Update progress to match loadingProgress with smooth animation via CSS transition
  useEffect(() => {
    if (loadingProgress >= 100) {
      // Force to exactly 100% immediately when loadingProgress reaches 100%
      console.log(`[SplashScreen] loadingProgress reached 100% - setting progress to 100%`);
      setProgress(100);
    } else {
      // Normal update for values < 100%
      setProgress(loadingProgress);
    }
  }, [loadingProgress]);

  // Auto-advance to menu when loading progress reaches 100%
  useEffect(() => {
    // Only transition when loadingProgress is 100% and transition hasn't started
    if (loadingProgress >= 100 && !transitionStartedRef.current) {
      console.log(`[SplashScreen] Progress at 100% - starting transition to menu...`);
      
      transitionStartedRef.current = true; // Mark as started to prevent re-runs
      
      // Wait for CSS transition to complete (progress bar animation) + show completion state
      // Total delay: 1000ms to allow visual progress bar to reach 100% and stay there briefly
      const timer = window.setTimeout(() => {
        console.log('[SplashScreen] Transition delay complete - calling onComplete()');
        try {
          onComplete();
          console.log('[SplashScreen] ✅ Transitioning to menu');
        } catch (error) {
          console.error('[SplashScreen] ❌ Error calling onComplete():', error);
        }
      }, 1000);

      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
    return undefined;
  }, [loadingProgress, onComplete]);

  return (
    <div className="splash-screen">
      <div className="splash-container">
        {/* Logo */}
        <div className="splash-logo-container">
          <img 
            src="/assets/logo.png" 
            alt="WordDROP Logo" 
            className="splash-logo"
          />
        </div>

        {/* Loading Bar */}
        <div className="splash-loading-bar-container">
          <div className="splash-loading-bar">
            <div 
              className="splash-loading-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="splash-loading-info">
            <span className="splash-loading-text">{loadingMessage}</span>
            <span className="splash-loading-percentage">{Math.min(100, Math.round(progress))}%</span>
          </div>
        </div>

        {/* Status Message */}
        <div className="splash-status">
          <span className="splash-status-text">Establishing connection...</span>
        </div>
      </div>
    </div>
  );
};
