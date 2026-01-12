/**
 * PowerUps - Power-up buttons component
 * Phase 3: Power-Ups System
 */

import React, { useState, useEffect } from 'react';
import type { PowerUp, PowerUpType } from '../types/game';
import { POWER_UP_ICONS, POWER_UP_LABELS } from '../constants/powerups';
import soundService from '../services/SoundService';
import { SOUND_MAPPINGS } from '../constants/sounds';
import crazyGamesService from '../services/CrazyGamesService';
import './PowerUps.css';

interface PowerUpsProps {
  powerUps: PowerUp[];
  onUsePowerUp: (type: PowerUpType, metadata?: Record<string, unknown>) => void;
  onAddPowerUpUses?: (type: PowerUpType, amount: number) => void;
  onPause?: () => void;
  onResume?: () => void;
  disabled?: boolean;
}

interface LetterSelectorModalProps {
  isOpen: boolean;
  onSelect: (letter: string) => void;
  onClose: () => void;
}

const LetterSelectorModal: React.FC<LetterSelectorModalProps> = ({ isOpen, onSelect, onClose }) => {
  if (!isOpen) return null;

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="letter-selector-overlay" onClick={onClose}>
      <div className="letter-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="letter-selector-header">
          <h3>Choose a Letter</h3>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="letter-selector-grid">
          {letters.map((letter) => (
            <button
              key={letter}
              className="letter-button"
              onClick={() => {
                onSelect(letter);
                onClose();
              }}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PowerUps: React.FC<PowerUpsProps> = ({ 
  powerUps, 
  onUsePowerUp, 
  onAddPowerUpUses,
  onPause,
  onResume,
  disabled = false 
}) => {
  const [showLetterSelector, setShowLetterSelector] = useState(false);
  const [loadingAd, setLoadingAd] = useState<PowerUpType | null>(null);

  const handlePowerUpClick = (type: PowerUpType): void => {
    if (disabled) return;

    const powerUp = powerUps.find(p => p.type === type);
    if (!powerUp) {
      return;
    }

    // If no uses remaining, show ad to get more
    if (powerUp.uses === 0) {
      handleWatchAd(type);
      return;
    }

    if (!powerUp.isAvailable) {
      return;
    }

    // Play button sound
    soundService.play(SOUND_MAPPINGS.BUTTON_PRESS);

    // Blank power-up shows letter selector modal
    if (type === 'blank') {
      setShowLetterSelector(true);
      return;
    }

    // Use power-up immediately
    onUsePowerUp(type);
  };

  const handleWatchAd = (type: PowerUpType): void => {
    if (!crazyGamesService.isAvailable()) {
      alert('Ads are not available. Please disable your ad blocker to watch ads for power-ups.');
      return;
    }

    if (loadingAd) {
      return; // Already loading an ad
    }

    setLoadingAd(type);
    
    // Pause game and mute audio
    if (onPause) {
      onPause();
    }
    soundService.muteAll();

    // Request rewarded ad
    crazyGamesService.requestRewardedAd(
      () => {
        // Ad finished - give reward
        setLoadingAd(null);
        if (onAddPowerUpUses) {
          onAddPowerUpUses(type, 1); // Add 1 use
        }
        soundService.unmuteAll();
        if (onResume) {
          onResume();
        }
        soundService.play(SOUND_MAPPINGS.LEVEL_UP || SOUND_MAPPINGS.WORD_FORMED);
      },
      (error) => {
        // Ad error - resume game
        setLoadingAd(null);
        soundService.unmuteAll();
        if (onResume) {
          onResume();
        }
        console.warn('[PowerUps] Ad error:', error);
        if (error.code !== 'adCooldown') {
          alert(`Unable to show ad: ${error.message}`);
        }
      }
    );
  };

  const handleLetterSelect = (letter: string): void => {
    onUsePowerUp('blank', { letter });
    setShowLetterSelector(false);
  };

  // Debug: Log power-ups to identify missing one
  useEffect(() => {
    console.log('[PowerUps] Power-ups received:', powerUps.map(pu => pu.type));
    const types = powerUps.map(pu => pu.type);
    if (!types.includes('lightning')) {
      console.error('[PowerUps] ⚠️ LIGHTNING MISSING! Types received:', types);
    } else {
      console.log('[PowerUps] ✅ Lightning IS in the array!');
    }
  }, [powerUps]);

  return (
    <>
      <div className="power-ups-container">
        {powerUps.map((powerUp, index) => {
          const icon = POWER_UP_ICONS[powerUp.type];
          const label = POWER_UP_LABELS[powerUp.type];
          const isDisabled = disabled || !powerUp.isAvailable || powerUp.uses === 0;

          // Debug: Log ALL power-ups being rendered
          console.log(`[PowerUps] Rendering ${index + 1}/${powerUps.length}:`, powerUp.type, { icon, label, isDisabled, uses: powerUp.uses });

          if (!icon) {
            console.error(`[PowerUps] ❌ NO ICON for type: ${powerUp.type}`);
          }

          const isLoadingAd = loadingAd === powerUp.type;
          const showWatchAd = powerUp.uses === 0 && crazyGamesService.isAvailable();

          return (
            <div key={powerUp.type} className="power-up-wrapper">
              <button
                className={`power-up-button ${powerUp.type} ${isDisabled && !showWatchAd ? 'disabled' : ''} ${isLoadingAd ? 'loading' : ''}`}
                onClick={() => handlePowerUpClick(powerUp.type)}
                disabled={isDisabled && !showWatchAd}
                title={showWatchAd ? `Watch ad to get ${label}` : `${label} (${powerUp.uses} uses remaining)`}
              >
                <span className="power-up-icon">{icon}</span>
                {isLoadingAd ? (
                  <span className="power-up-count loading">...</span>
                ) : showWatchAd ? (
                  <span className="power-up-count watch-ad">📺</span>
                ) : (
                  <span className="power-up-count">{powerUp.uses}</span>
                )}
              </button>
              {showWatchAd && !isLoadingAd && (
                <div className="watch-ad-hint">Watch Ad</div>
              )}
            </div>
          );
        })}
      </div>

      <LetterSelectorModal
        isOpen={showLetterSelector}
        onSelect={handleLetterSelect}
        onClose={() => setShowLetterSelector(false)}
      />
    </>
  );
};
