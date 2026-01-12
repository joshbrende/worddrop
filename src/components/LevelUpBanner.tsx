/**
 * LevelUpBanner - Animated banner shown when player levels up
 * Features level-specific visual and audio effects that escalate in intensity
 */

import React, { useEffect, useState } from 'react';
import { getThemeByLevel } from '../constants/themes';
import { getLevelEffectConfig, getAchievementBadge } from '../utils/levelEffects';
import { applyThemeToDocument } from '../constants/themes';
import soundService from '../services/SoundService';
import { SOUND_MAPPINGS } from '../constants/sounds';
import './LevelUpBanner.css';

interface LevelUpBannerProps {
  level: number;
  points: number;
  themeId: string;
  onComplete: () => void;
}

export const LevelUpBanner: React.FC<LevelUpBannerProps> = ({
  level,
  points,
  // themeId, // Unused
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const theme = getThemeByLevel(level);
  const effectConfig = getLevelEffectConfig(level);
  const achievementBadge = getAchievementBadge(level);

  // Apply theme colors to document when banner appears
  useEffect(() => {
    applyThemeToDocument(theme.colors);

    // Play level-up sound
    soundService.play(SOUND_MAPPINGS.LEVEL_UP);
  }, [theme]);

  // Auto-dismiss banner after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Small delay before calling onComplete to allow fade-out
      setTimeout(() => {
        onComplete();
      }, 300);
    }, effectConfig.duration);

    return () => clearTimeout(timer);
  }, [effectConfig.duration, onComplete]);

  // Generate particle count (random within range)
  const particleCount = Math.floor(
    Math.random() * (effectConfig.particleCount[1] - effectConfig.particleCount[0] + 1) +
    effectConfig.particleCount[0]
  );

  if (!isVisible) return null;

  return (
    <div
      className={`level-up-overlay level-up-${level}`}
      style={{
        '--theme-primary': theme.colors.primary,
        '--theme-secondary': theme.colors.secondary,
        '--theme-accent': theme.colors.accent,
        '--theme-success': theme.colors.success,
      } as React.CSSProperties}
    >
      {/* Screen Effect Overlay */}
      <div
        className={`screen-effect screen-effect-${effectConfig.screenEffect}`}
        style={{
          backgroundColor: theme.colors.primary,
        }}
      />

      {/* Particle System */}
      <div className="particles-container">
        {Array.from({ length: particleCount }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className={`particle particle-${i % 8}`}
            style={{
              '--particle-color': theme.colors.primary,
              '--animation-delay': `${(i * 50) % 1000}ms`,
              '--particle-index': i,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Main Banner Content */}
      <div className="level-up-banner">
        {/* Achievement Badge (for milestone levels) */}
        {achievementBadge && (
          <div className="achievement-badge">
            <div className="badge-icon">🏆</div>
            <div className="badge-text">{achievementBadge}</div>
          </div>
        )}

        {/* Level Text */}
        <div className="level-text-container">
          <div className="level-label">LEVEL UP!</div>
          <div className="level-number">LEVEL {level}</div>
        </div>

        {/* Points Display */}
        <div className="points-display">
          {points.toLocaleString()} Points
        </div>

        {/* Special Effects */}
        {effectConfig.specialFeatures.includes('lightning') && (
          <div className="lightning-effects">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`lightning-${i}`} className={`lightning lightning-${i}`} />
            ))}
          </div>
        )}

        {effectConfig.specialFeatures.includes('energy-orbs') && (
          <div className="energy-orbs">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`orb-${i}`} className={`orb orb-${i}`} />
            ))}
          </div>
        )}

        {effectConfig.specialFeatures.includes('fire') && (
          <div className="fire-effects">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`flame-${i}`} className={`flame flame-${i}`} />
            ))}
          </div>
        )}

        {effectConfig.specialFeatures.includes('water-ripple') && (
          <div className="water-effects">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`ripple-${i}`} className={`ripple ripple-${i}`} />
            ))}
          </div>
        )}

        {effectConfig.specialFeatures.includes('screen-shake') && (
          <div className="shake-effect" />
        )}
      </div>
    </div>
  );
};
