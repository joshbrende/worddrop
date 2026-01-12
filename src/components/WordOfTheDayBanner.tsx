/**
 * WordOfTheDayBanner - Celebration banner when word of the day is found
 */

import React, { useEffect, useState } from 'react';
import type { WordOfTheDay } from '../services/GameApiService';
import soundService from '../services/SoundService';
import { SOUND_MAPPINGS } from '../constants/sounds';
import './WordOfTheDayBanner.css';

interface WordOfTheDayBannerProps {
  wordOfTheDay: WordOfTheDay;
  onComplete: () => void;
}

export const WordOfTheDayBanner: React.FC<WordOfTheDayBannerProps> = ({ wordOfTheDay, onComplete }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Play celebration sound
    soundService.play(SOUND_MAPPINGS.LEVEL_UP || SOUND_MAPPINGS.WORD_FORMED);

    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500); // Wait for fade-out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) {
    return null;
  }

  return (
    <div className="word-of-day-banner">
      <div className="word-of-day-content">
        <div className="word-of-day-icon">⭐</div>
        <h2 className="word-of-day-title">Word of the Day Found!</h2>
        <p className="word-of-day-word">{wordOfTheDay.answer}</p>
        <p className="word-of-day-question">{wordOfTheDay.question}</p>
        <div className="word-of-day-bonus">
          <span className="bonus-label">3x Multiplier Applied!</span>
        </div>
      </div>
    </div>
  );
};
