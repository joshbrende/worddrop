/**
 * SponsorWordBanner - Banner showing the word to find after answering trivia correctly
 */

import React from 'react';
import './SponsorWordBanner.css';

interface SponsorWordBannerProps {
  word: string;
  points: number;
}

export const SponsorWordBanner: React.FC<SponsorWordBannerProps> = ({ word, points }) => {
  return (
    <div className="sponsor-word-banner">
      <div className="sponsor-word-content">
        <div className="sponsor-word-icon">🎯</div>
        <div className="sponsor-word-text">
          <div className="sponsor-word-label">FIND THIS WORD:</div>
          <div className="sponsor-word-value">{word}</div>
          <div className="sponsor-word-points">+{points} points when found</div>
        </div>
      </div>
    </div>
  );
};
