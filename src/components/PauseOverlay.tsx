import React, { useState } from 'react';
import { SettingsModal } from './SettingsModal';
import soundService from '../services/SoundService';
import { SOUND_MAPPINGS } from '../constants/sounds';
import './PauseOverlay.css';

interface PauseOverlayProps {
  onResume: () => void;
  wordOfTheDay?: {
    question?: string;
    category?: string;
  } | null;
  onReturnToMenu?: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  onResume,
  wordOfTheDay,
  onReturnToMenu,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const handleButtonClick = () => {
    soundService.play(SOUND_MAPPINGS.BUTTON_PRESS);
  };

  const handleResume = () => {
    handleButtonClick();
    onResume();
  };

  const handleSettings = () => {
    handleButtonClick();
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleReturnToMenu = () => {
    handleButtonClick();
    if (window.confirm('Are you sure you want to return to the menu? Your progress will be saved.')) {
      if (onReturnToMenu) {
        onReturnToMenu();
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <>
      <div className="pause-overlay">
        <div className="pause-overlay-content">
          <h2 className="pause-title">PAUSED</h2>

          {/* Word of the Day Question */}
          {wordOfTheDay && wordOfTheDay.question && (
            <div className="pause-wotd-section">
              <div className="pause-wotd-label">WORD OF THE DAY</div>
              <div className="pause-wotd-question">{wordOfTheDay.question}</div>
              {wordOfTheDay.category && (
                <div className="pause-wotd-category">[{wordOfTheDay.category}]</div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pause-actions">
            <button className="pause-button pause-button-primary" onClick={handleResume}>
              RESUME
            </button>
            <button className="pause-button" onClick={handleSettings}>
              SETTINGS
            </button>
            <button className="pause-button" onClick={handleReturnToMenu}>
              RETURN TO MENU
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal isOpen={showSettings} onClose={handleCloseSettings} />}
    </>
  );
};
