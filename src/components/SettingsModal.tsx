/**
 * SettingsModal - Settings modal component
 * Provides game settings including sound toggle
 */

import React, { useState, useEffect } from 'react';
import soundService from '../services/SoundService';
import { SOUND_MAPPINGS } from '../constants/sounds';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [effectsEnabled, setEffectsEnabled] = useState(true);

  // Load current sound settings
  useEffect(() => {
    if (isOpen) {
      setMusicEnabled(soundService.getMusicEnabled());
      setEffectsEnabled(soundService.getEffectsEnabled());
    }
  }, [isOpen]);

  const handleMusicToggle = (enabled: boolean) => {
    setMusicEnabled(enabled);
    soundService.setMusicEnabled(enabled);
  };

  const handleEffectsToggle = (enabled: boolean) => {
    setEffectsEnabled(enabled);
    soundService.setEffectsEnabled(enabled);
  };

  const handleClose = () => {
    soundService.play(SOUND_MAPPINGS.BUTTON_PRESS);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={handleClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h2 className="settings-modal-title">SETTINGS</h2>
          <button className="settings-modal-close" onClick={handleClose} aria-label="Close settings">
            ✕
          </button>
        </div>

        <div className="settings-modal-content">
          <div className="settings-section">
            <h3 className="settings-section-title">Audio Settings</h3>
            
            <div className="settings-item">
              <label className="settings-label">
                <span className="settings-label-text">Music</span>
                <span className="settings-label-description">Background music during gameplay and menu</span>
              </label>
              <div className="settings-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={musicEnabled}
                    onChange={(e) => handleMusicToggle(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">{musicEnabled ? 'ON' : 'OFF'}</span>
              </div>
            </div>

            <div className="settings-item">
              <label className="settings-label">
                <span className="settings-label-text">Sound Effects</span>
                <span className="settings-label-description">Game sounds (words, combos, power-ups, etc.)</span>
              </label>
              <div className="settings-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={effectsEnabled}
                    onChange={(e) => handleEffectsToggle(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">{effectsEnabled ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-modal-footer">
          <button className="settings-button" onClick={handleClose}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
