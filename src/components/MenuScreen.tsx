/**
 * MenuScreen - Main menu screen
 * Shows game menu with options
 */

import React, { useState, useEffect } from 'react';
import soundService from '../services/SoundService';
import { SOUND_MAPPINGS } from '../constants/sounds';
import { SettingsModal } from './SettingsModal';
import { ModesScreen } from './ModesScreen';
import { HowToPlayScreen } from './HowToPlayScreen';
import './MenuScreen.css';

interface MenuScreenProps {
  onStartGame: (mode?: 'normal' | 'word-of-day' | 'sponsor-trivia') => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({ onStartGame }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Play menu music when menu appears (should already be initialized by App)
  useEffect(() => {
    // Music should start automatically after splash screen
    // If it hasn't started yet, try to play it (will play if user has interacted)
    soundService.playBackgroundMusic(SOUND_MAPPINGS.MENU_BACKGROUND);

    return () => {
      soundService.stopBackgroundMusic();
    };
  }, []);

  const handleButtonClick = () => {
    soundService.play(SOUND_MAPPINGS.BUTTON_PRESS);
  };

  const handleModes = () => {
    handleButtonClick();
    setShowModes(true);
  };

  const handleCloseModes = () => {
    handleButtonClick();
    setShowModes(false);
  };

  const handleHowToPlay = () => {
    handleButtonClick();
    setShowHowToPlay(true);
  };

  const handleCloseHowToPlay = () => {
    handleButtonClick();
    setShowHowToPlay(false);
  };

  const handleSettings = () => {
    handleButtonClick();
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleQuit = () => {
    handleButtonClick();
    if (window.confirm('Are you sure you want to quit?')) {
      window.close();
      // Fallback if window.close doesn't work (e.g., in some browsers)
      if (window.history.length > 1) {
        window.history.back();
      }
    }
  };

  const handleStartGame = (mode?: 'normal' | 'word-of-day' | 'sponsor-trivia') => {
    handleButtonClick();
    soundService.stopBackgroundMusic();
    onStartGame(mode);
  };

  if (showModes) {
    return (
      <ModesScreen 
        onBack={handleCloseModes}
        onStartGame={handleStartGame}
      />
    );
  }

  if (showHowToPlay) {
    return (
      <HowToPlayScreen 
        onBack={handleCloseHowToPlay}
      />
    );
  }

  return (
    <div className="menu-screen">
      <div className="menu-background">
        <img 
          src="/assets/menu_bg.png" 
          alt="Menu Background" 
          className="menu-bg-image"
        />
        <div className="menu-overlay" />
      </div>

      <div className="menu-container">
        {/* Logo */}
        <div className="menu-logo-container">
          <img 
            src="/assets/logo.png" 
            alt="WordDROP Logo" 
            className="menu-logo"
          />
        </div>

        {/* Menu Buttons */}
        <div className="menu-buttons">
          <button className="menu-button" onClick={() => handleStartGame('normal')}>
            <div>
              <span>PLAY</span>
            </div>
          </button>

          <button className="menu-button" onClick={handleModes}>
            <div>
              <span>MODES</span>
            </div>
          </button>

          <button className="menu-button" onClick={handleHowToPlay}>
            <div>
              <span>HOW TO PLAY</span>
            </div>
          </button>

          <button className="menu-button" onClick={handleSettings}>
            <div>
              <span>SETTINGS</span>
            </div>
          </button>

          <button className="menu-button" onClick={handleQuit}>
            <div>
              <span>QUIT</span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="menu-footer">
          <p className="menu-footer-text">WordDROP - CrazyGames Edition</p>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={handleCloseSettings} />
    </div>
  );
};
