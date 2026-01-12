/**
 * Level-specific effect configurations
 * Each level has unique visual and audio effects that escalate in intensity
 */

export interface LevelEffectConfig {
  duration: number; // Total animation duration in milliseconds
  particleCount: [number, number]; // Min and max particle count
  audioLayers: string[]; // Sound effect names to layer
  screenEffect: 'flash' | 'flash-lens' | 'flash-blur' | 'flash-bloom' | 'flash-heat' | 'flash-waves' | 'flash-shake';
  specialFeatures: string[]; // Special effects like 'lightning', 'fire', 'achievement-badge', etc.
  vibrationPattern: number[]; // Vibration pattern in milliseconds
  audioPitch: number | [number, number]; // Single pitch (0.8-1.3) or pitch sweep [start, end]
  description: string; // Human-readable description
}

/**
 * Get level-specific effect configuration
 */
export const getLevelEffectConfig = (level: number): LevelEffectConfig => {
  const configs: Record<number, LevelEffectConfig> = {
    2: {
      duration: 3500,
      particleCount: [20, 30],
      audioLayers: ['level_up'],
      screenEffect: 'flash',
      specialFeatures: [],
      vibrationPattern: [100, 50, 100],
      audioPitch: 1.0,
      description: 'Hot Pink - Basic flash with pink particles',
    },
    3: {
      duration: 4000,
      particleCount: [40, 50],
      audioLayers: ['level_up', 'lightning'],
      screenEffect: 'flash-lens',
      specialFeatures: ['lightning'],
      vibrationPattern: [150, 50, 150, 50, 100],
      audioPitch: 1.1,
      description: 'Electric Green - Lens flare with lightning effects',
    },
    4: {
      duration: 4500,
      particleCount: [60, 70],
      audioLayers: ['level_up'],
      screenEffect: 'flash-blur',
      specialFeatures: ['energy-orbs'],
      vibrationPattern: [200, 100, 200, 100, 150],
      audioPitch: 0.9,
      description: 'Deep Purple - Radial blur with energy orbs',
    },
    5: {
      duration: 5000,
      particleCount: [80, 90],
      audioLayers: ['level_up', 'combo'],
      screenEffect: 'flash-bloom',
      specialFeatures: ['achievement-badge', 'golden-shine'],
      vibrationPattern: [250, 50, 250, 50, 250, 50, 200],
      audioPitch: 1.15,
      description: 'Bright Yellow - Bloom effect with achievement badge (Halfway Hero)',
    },
    6: {
      duration: 5500,
      particleCount: [100, 120],
      audioLayers: ['level_up', 'bomb'],
      screenEffect: 'flash-heat',
      specialFeatures: ['fire', 'flames'],
      vibrationPattern: [300, 100, 300, 100, 250],
      audioPitch: 1.05,
      description: 'Neon Orange - Heat wave with fire effects',
    },
    7: {
      duration: 6000,
      particleCount: [120, 150],
      audioLayers: ['level_up', 'wind'],
      screenEffect: 'flash-waves',
      specialFeatures: ['water-ripple', 'wave-pattern'],
      vibrationPattern: [350, 80, 350, 80, 350, 80, 300],
      audioPitch: 1.2,
      description: 'Cyan Wave - Water ripple with wave effects',
    },
    8: {
      duration: 7000,
      particleCount: [150, 200],
      audioLayers: ['level_up', 'combo', 'bomb'],
      screenEffect: 'flash-shake',
      specialFeatures: ['achievement-badge', 'storm', 'screen-shake', 'multiple-layers'],
      vibrationPattern: [400, 100, 400, 100, 400, 100, 400, 100, 350],
      audioPitch: [0.9, 1.3], // Pitch sweep from low to high
      description: 'Magenta Storm - Epic finale with storm effects and achievement badge (Legend)',
    },
  };

  return configs[level] || configs[2]; // Default to level 2 config if invalid level
};

/**
 * Check if level is a milestone level
 */
export const isMilestoneLevel = (level: number): boolean => {
  return level === 5 || level === 8; // Halfway (5) and Final (8)
};

/**
 * Get achievement badge name for milestone levels
 */
export const getAchievementBadge = (level: number): string | null => {
  if (level === 5) return 'HALFWAY HERO';
  if (level === 8) return 'LEGEND';
  return null;
};
