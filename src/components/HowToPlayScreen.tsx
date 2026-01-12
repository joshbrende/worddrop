/**
 * HowToPlayScreen - Instructions screen for the game
 */

import React from 'react';
import soundService from '../services/SoundService';
import { SOUND_MAPPINGS } from '../constants/sounds';
import './HowToPlayScreen.css';

interface HowToPlayScreenProps {
  onBack: () => void;
}

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({ onBack }) => {
  const handleButtonClick = () => {
    soundService.play(SOUND_MAPPINGS.BUTTON_PRESS);
  };

  const handleBack = () => {
    handleButtonClick();
    onBack();
  };

  return (
    <div className="how-to-play-screen">
      <div className="how-to-play-background">
        <img
          src="/assets/menu_bg.png"
          alt="How to Play Background"
          className="how-to-play-bg-image"
        />
        <div className="how-to-play-overlay" />
      </div>

      <div className="how-to-play-container">
        {/* Header */}
        <div className="how-to-play-header">
          <button className="how-to-play-back-button" onClick={handleBack}>
            ← BACK
          </button>
          <h1 className="how-to-play-title">HOW TO PLAY</h1>
        </div>

        {/* Content */}
        <div className="how-to-play-content">
          {/* Basic Gameplay */}
          <section className="how-to-play-section">
            <h2 className="section-title">BASIC GAMEPLAY</h2>
            <div className="section-content">
              <div className="instruction-item">
                <span className="instruction-icon">⬇️</span>
                <div className="instruction-text">
                  <strong>Letters fall from the top</strong> - Control them with arrow keys or WASD
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">↔️</span>
                <div className="instruction-text">
                  <strong>Move left/right</strong> - Use ← → or A D keys to position letters
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⬇️</span>
                <div className="instruction-text">
                  <strong>Drop faster</strong> - Press ↓ or S to speed up the fall
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🔤</span>
                <div className="instruction-text">
                  <strong>Form words</strong> - Connect letters horizontally or vertically to create words
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">💥</span>
                <div className="instruction-text">
                  <strong>Words disappear</strong> - Valid words are removed and you earn points
                </div>
              </div>
            </div>
          </section>

          {/* Scoring */}
          <section className="how-to-play-section">
            <h2 className="section-title">SCORING</h2>
            <div className="section-content">
              <div className="instruction-item">
                <span className="instruction-icon">🔤</span>
                <div className="instruction-text">
                  <strong>Minimum Word Length</strong> - Words must be at least 3 letters long. 3-letter words start at 100 base points.
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⭐</span>
                <div className="instruction-text">
                  <strong>Base Points</strong> - Longer words earn more: 3 letters = 100pts, 4 = 200pts, 5 = 400pts, 6 = 800pts, 7 = 1600pts, 8+ = 3200pts
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🔤</span>
                <div className="instruction-text">
                  <strong>Letter Values</strong> - Each letter has a point value (A=1, Q/Z=10). Rarer letters are worth more!
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">📏</span>
                <div className="instruction-text">
                  <strong>Length Bonus</strong> - Words longer than 3 letters get +50 bonus points per extra letter
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🔥</span>
                <div className="instruction-text">
                  <strong>Combos</strong> - Form words quickly (within 5 seconds) to build combos. Each combo adds +0.2x multiplier (up to 3.0x max)
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⬆️</span>
                <div className="instruction-text">
                  <strong>Vertical Bonus</strong> - Vertical words get a 1.5x multiplier bonus
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">📈</span>
                <div className="instruction-text">
                  <strong>Level Multiplier</strong> - Higher levels give slightly higher multipliers (+0.1x per level)
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🎯</span>
                <div className="instruction-text">
                  <strong>Special Words</strong> - Word of the Day (3.0x), Sponsor Trivia (2.5x), Regular Trivia (2.0x) get massive multipliers
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">💎</span>
                <div className="instruction-text">
                  <strong>Milestone Bonuses</strong> - Reach word count milestones (50, 100, 200, 300, 400, 500 words) for huge bonus points
                </div>
              </div>
            </div>
          </section>

          {/* Game Modes */}
          <section className="how-to-play-section">
            <h2 className="section-title">GAME MODES</h2>
            <div className="section-content">
              <div className="instruction-item">
                <span className="instruction-icon">🏆</span>
                <div className="instruction-text">
                  <strong>Classic Mode</strong> - Standard gameplay with unlimited words to find
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">📖</span>
                <div className="instruction-text">
                  <strong>Word of the Day</strong> - Find today's special word to earn achievements and bonus points
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🎯</span>
                <div className="instruction-text">
                  <strong>Sponsor Trivia</strong> - Answer multiple choice questions correctly, then find the answer word on the board
                </div>
              </div>
            </div>
          </section>

          {/* Power-Ups */}
          <section className="how-to-play-section">
            <h2 className="section-title">POWER-UPS</h2>
            <div className="section-content">
              <div className="instruction-item">
                <span className="instruction-icon">💣</span>
                <div className="instruction-text">
                  <strong>Bomb</strong> - Turns the current falling letter into a bomb. When it lands, it explodes and destroys all letters in a 3x3 area, earning bonus points.
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⚡</span>
                <div className="instruction-text">
                  <strong>Lightning</strong> - Clears all letters in a random column, giving you more space and earning points for each letter cleared.
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">❄️</span>
                <div className="instruction-text">
                  <strong>Freeze</strong> - Slows down the letter falling speed by 50% for 5 seconds, giving you more time to plan your moves.
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🌪️</span>
                <div className="instruction-text">
                  <strong>Wind</strong> - Clears all letters in a random row, creating space and earning points for each letter removed.
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🎯</span>
                <div className="instruction-text">
                  <strong>Blank</strong> - Allows you to choose any letter (A-Z) for the current falling letter. Perfect for completing words!
                </div>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="how-to-play-section">
            <h2 className="section-title">TIPS & TRICKS</h2>
            <div className="section-content">
              <div className="instruction-item">
                <span className="instruction-icon">💡</span>
                <div className="instruction-text">
                  Plan ahead - Look for word opportunities before placing letters
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⚡</span>
                <div className="instruction-text">
                  Build combos - Form words quickly to maximize your score multiplier
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🎮</span>
                <div className="instruction-text">
                  Use power-ups strategically - Save them for when the board gets crowded
                </div>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⏸️</span>
                <div className="instruction-text">
                  Pause anytime - Press Space or ESC to pause and take a break
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="how-to-play-footer">
          <button className="how-to-play-back-button-bottom" onClick={handleBack}>
            ← BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};
