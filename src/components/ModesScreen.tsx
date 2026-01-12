import React, { useState, useEffect } from 'react';
import soundService from '../services/SoundService';
import { SOUND_MAPPINGS } from '../constants/sounds';
import './ModesScreen.css';

interface ModesScreenProps {
  onBack: () => void;
  onStartGame: (mode?: 'normal' | 'word-of-day' | 'sponsor-trivia') => void;
}

export const ModesScreen: React.FC<ModesScreenProps> = ({ onBack, onStartGame }) => {
  const [wordOfTheDay, setWordOfTheDay] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load today's word of the day
    const loadWordOfTheDay = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.153:8000/api/v1';
        const response = await fetch(`${API_BASE_URL}/word-of-day`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setWordOfTheDay(data.data);
          }
        }
      } catch (error) {
        console.error('Error loading word of the day:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWordOfTheDay();
  }, []);

  const handleButtonClick = () => {
    soundService.play(SOUND_MAPPINGS.BUTTON_PRESS);
  };

  const handleBack = () => {
    handleButtonClick();
    onBack();
  };

  const handleStartNormal = () => {
    handleButtonClick();
    onStartGame('normal');
  };

  const handleStartWordOfDay = () => {
    handleButtonClick();
    onStartGame('word-of-day');
  };

  const handleStartSponsorTrivia = () => {
    handleButtonClick();
    onStartGame('sponsor-trivia');
  };

  return (
    <div className="modes-screen">
      <div className="modes-background">
        <img 
          src="/assets/menu_bg.png" 
          alt="Modes Background" 
          className="modes-bg-image"
        />
        <div className="modes-overlay" />
      </div>

      <div className="modes-container">
        {/* Header */}
        <div className="modes-header">
          <button className="modes-back-button" onClick={handleBack}>
            ← BACK
          </button>
          <h1 className="modes-title">GAME MODES</h1>
        </div>

        {/* Game Modes */}
        <div className="modes-grid">
          {/* Normal Mode */}
          <div className="mode-card">
            <div className="mode-icon">
              <span className="mode-icon-emoji">🏆</span>
            </div>
            <h2 className="mode-name">CLASSIC MODE</h2>
            <p className="mode-description">
              Play the classic WordDROP experience. Find words, build combos, and climb the leaderboard!
            </p>
            <div className="mode-features">
              <div className="mode-feature">
                <span>✓</span> Unlimited gameplay
              </div>
              <div className="mode-feature">
                <span>✓</span> Power-ups available
              </div>
              <div className="mode-feature">
                <span>✓</span> Global leaderboard
              </div>
            </div>
            <button className="mode-button" onClick={handleStartNormal}>
              PLAY CLASSIC
            </button>
          </div>

          {/* Word of the Day Mode */}
          <div className="mode-card mode-featured">
            <div className="mode-badge">DAILY CHALLENGE</div>
            <div className="mode-icon">
              <span className="mode-icon-emoji">📖</span>
            </div>
            <h2 className="mode-name">WORD OF THE DAY</h2>
            <p className="mode-description">
              Find today's special word and answer the daily question to earn bonus points and achievements!
            </p>
            {loading ? (
              <div className="mode-today-question">Loading today's challenge...</div>
            ) : wordOfTheDay ? (
              <div className="mode-today-question">
                <div className="mode-question-label">TODAY'S CHALLENGE</div>
                <div className="mode-question-text">{wordOfTheDay.question || 'Find the word of the day!'}</div>
                {wordOfTheDay.category && (
                  <div className="mode-question-category">
                    [{wordOfTheDay.category}]
                  </div>
                )}
              </div>
            ) : (
              <div className="mode-today-question">No challenge available today</div>
            )}
            <div className="mode-features">
              <div className="mode-feature">
                <span>✓</span> Daily challenge
              </div>
              <div className="mode-feature">
                <span>✓</span> Bonus points
              </div>
              <div className="mode-feature">
                <span>✓</span> Achievement unlock
              </div>
            </div>
            <button 
              className="mode-button mode-button-primary" 
              onClick={handleStartWordOfDay}
              disabled={!wordOfTheDay}
            >
              PLAY WORD OF THE DAY
            </button>
          </div>

          {/* Sponsor Trivia Mode */}
          <div className="mode-card mode-featured">
            <div className="mode-badge">SPONSORED</div>
            <div className="mode-icon">
              <span className="mode-icon-emoji">🏅</span>
            </div>
            <h2 className="mode-name">SPONSOR TRIVIA</h2>
            <p className="mode-description">
              Answer sponsor questions correctly to earn extra points and unlock special rewards!
            </p>
            <div className="mode-features">
              <div className="mode-feature">
                <span>✓</span> Sponsor challenges
              </div>
              <div className="mode-feature">
                <span>✓</span> Higher point rewards
              </div>
              <div className="mode-feature">
                <span>✓</span> Special achievements
              </div>
            </div>
            <button className="mode-button mode-button-primary" onClick={handleStartSponsorTrivia}>
              PLAY SPONSOR TRIVIA
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="modes-footer">
          <p className="modes-footer-text">Select a mode to start playing!</p>
        </div>
      </div>
    </div>
  );
};
