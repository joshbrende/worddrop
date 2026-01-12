/**
 * GameOverScreen - Cyberpunk-themed game over screen with achievements
 * Displays final score, stats, and achievements unlocked during the game
 */

import React from 'react';
import soundService from '../services/SoundService';
import { SOUND_MAPPINGS } from '../constants/sounds';
import './GameOverScreen.css';

interface GameOverScreenProps {
  score: number;
  level: number;
  wordsFound: number;
  maxCombo: number;
  achievements: string[];
  foundWordOfTheDay: boolean;
  foundSponsorWord: boolean;
  onRestart: () => void;
  onReturnToMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  level,
  wordsFound,
  maxCombo,
  achievements,
  foundWordOfTheDay,
  foundSponsorWord,
  onRestart,
  onReturnToMenu,
}) => {
  const handleButtonClick = () => {
    soundService.play(SOUND_MAPPINGS.BUTTON_PRESS);
  };

  const handleRestart = () => {
    handleButtonClick();
    onRestart();
  };

  const handleReturnToMenu = () => {
    handleButtonClick();
    onReturnToMenu();
  };

  // Achievement definitions
  const achievementDefinitions: Record<string, { icon: string; name: string; description: string }> = {
    word_of_day_completed: {
      icon: '📅',
      name: 'Daily Champion',
      description: 'Found the Word of the Day',
    },
    sponsor_trivia_completed: {
      icon: '🎯',
      name: 'Trivia Master',
      description: 'Completed Sponsor Trivia',
    },
  };

  // Get all achievements to display
  const allAchievements = [
    ...achievements.map((type) => achievementDefinitions[type] || { icon: '🏆', name: type, description: 'Achievement unlocked' }),
    ...(foundWordOfTheDay && !achievements.includes('word_of_day_completed')
      ? [{ icon: '📅', name: 'Daily Champion', description: 'Found the Word of the Day' }]
      : []),
    ...(foundSponsorWord && !achievements.includes('sponsor_trivia_completed')
      ? [{ icon: '🎯', name: 'Trivia Master', description: 'Completed Sponsor Trivia' }]
      : []),
  ];

  return (
    <div className="game-over-overlay">
      <div className="game-over-container">
        {/* Header */}
        <div className="game-over-header">
          <h1 className="game-over-title">GAME OVER</h1>
          <div className="game-over-subtitle">SYSTEM TERMINATED</div>
        </div>

        {/* Stats Grid */}
        <div className="game-over-stats">
          <div className="stat-card">
            <div className="stat-icon">💯</div>
            <div className="stat-label">FINAL SCORE</div>
            <div className="stat-value">{score.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-label">LEVEL REACHED</div>
            <div className="stat-value">{level}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔤</div>
            <div className="stat-label">WORDS FOUND</div>
            <div className="stat-value">{wordsFound}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-label">MAX COMBO</div>
            <div className="stat-value">{maxCombo}x</div>
          </div>
        </div>

        {/* Achievements Section */}
        {allAchievements.length > 0 && (
          <div className="game-over-achievements">
            <h2 className="achievements-title">
              <span className="achievements-icon">🏆</span>
              ACHIEVEMENTS UNLOCKED
            </h2>
            <div className="achievements-list">
              {allAchievements.map((achievement, index) => (
                <div key={index} className="achievement-item">
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-content">
                    <div className="achievement-name">{achievement.name}</div>
                    <div className="achievement-description">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Achievements Message */}
        {allAchievements.length === 0 && (
          <div className="game-over-no-achievements">
            <div className="no-achievements-icon">💭</div>
            <div className="no-achievements-text">No achievements unlocked this round</div>
            <div className="no-achievements-hint">Try Word of the Day or Sponsor Trivia modes!</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="game-over-actions">
          <button className="game-over-button restart-button" onClick={handleRestart}>
            <span className="button-icon">🔄</span>
            <span className="button-text">RESTART</span>
          </button>
          <button className="game-over-button menu-button" onClick={handleReturnToMenu}>
            <span className="button-icon">🏠</span>
            <span className="button-text">MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
