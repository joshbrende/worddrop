/**
 * ScorePopup - Animated score popup component
 * Shows score in center of grid with neon orange color and gold stars (3-5 based on word length)
 */

import React, { useEffect } from 'react';
import { ANIMATION_DURATIONS } from '../constants/animations';
import './ScorePopup.css';

interface ScorePopupProps {
  score: number;
  combo?: number;
  word?: string; // Word that was created
  position?: { x: number; y: number }; // Optional, now centered by default
  onComplete: () => void;
}

export const ScorePopup: React.FC<ScorePopupProps> = ({ score, combo = 1, word, position, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, ANIMATION_DURATIONS.SCORE_POPUP);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const scoreClass = score >= 100 ? 'high' : combo > 1 ? 'combo' : '';
  const comboMultiplier = Math.min(3, 1 + (combo - 1) * 0.2); // Calculate multiplier (up to 3x)

  // Calculate number of stars based on word length (3-5 stars)
  // 3 letters = 3 stars, 4-5 letters = 4 stars, 6+ letters = 5 stars
  const getStarCount = (wordLength: number): number => {
    if (wordLength > 5) return 5; // 6+ letters = 5 stars
    if (wordLength >= 4) return 4; // 4-5 letters = 4 stars
    return 3; // 3 letters = 3 stars
  };

  const starCount = word ? getStarCount(word.length) : 3;

  // Center positioning - if position provided, use it, otherwise center (handled by CSS)
  const style = position 
    ? { left: `${position.x}px`, top: `${position.y}px` }
    : {}; // Empty style means CSS centering will apply

  return (
    <div
      className={`score-popup center-popup ${scoreClass}`}
      style={style}
      data-score={scoreClass}
    >
      <div className="score-text">+{score}</div>
      {word && (
        <div className="stars-popup">
          {Array.from({ length: starCount }).map((_, index) => (
            <span 
              key={index} 
              className={`star ${index === 0 ? 'star-first' : index === starCount - 1 ? 'star-last' : 'star-middle'}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              ★
            </span>
          ))}
        </div>
      )}
      {combo > 1 && (
        <div className="combo-container">
          <div className="combo-text">{combo}x</div>
          <div className="combo-label">COMBO!</div>
          <div className="combo-multiplier">+{Math.floor((comboMultiplier - 1) * 100)}%</div>
        </div>
      )}
    </div>
  );
};
