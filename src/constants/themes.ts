/**
 * Theme definitions for each level
 * Each level has a unique color theme that creates visual progression
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
  success: string;
  error: string;
}

export interface ThemeOption {
  name: string;
  colors: ThemeColors;
  id: string;
}

export const themeOptions: ThemeOption[] = [
  {
    id: 'neon-blue',
    name: 'Neon Blue',
    colors: {
      primary: '#00d9ff',
      secondary: '#0066cc',
      background: '#1a1a2e',
      surface: 'rgba(0, 217, 255, 0.1)',
      text: '#ffffff',
      accent: '#00ffff',
      success: '#00ff00',
      error: '#ff0033'
    }
  },
  {
    id: 'hot-pink',
    name: 'Hot Pink',
    colors: {
      primary: '#ff007f',
      secondary: '#cc0066',
      background: '#1a1a2e',
      surface: 'rgba(255, 0, 127, 0.1)',
      text: '#ffffff',
      accent: '#ff69b4',
      success: '#ff1493',
      error: '#ff0033'
    }
  },
  {
    id: 'electric-green',
    name: 'Electric Green',
    colors: {
      primary: '#00ff00',
      secondary: '#00cc00',
      background: '#1a1a2e',
      surface: 'rgba(0, 255, 0, 0.1)',
      text: '#ffffff',
      accent: '#39ff14',
      success: '#32cd32',
      error: '#ff0033'
    }
  },
  {
    id: 'deep-purple',
    name: 'Deep Purple',
    colors: {
      primary: '#800080',
      secondary: '#660066',
      background: '#1a1a2e',
      surface: 'rgba(128, 0, 128, 0.1)',
      text: '#ffffff',
      accent: '#9400d3',
      success: '#8a2be2',
      error: '#ff0033'
    }
  },
  {
    id: 'bright-yellow',
    name: 'Bright Yellow',
    colors: {
      primary: '#ffff00',
      secondary: '#cccc00',
      background: '#1a1a2e',
      surface: 'rgba(255, 255, 0, 0.1)',
      text: '#ffffff',
      accent: '#ffd700',
      success: '#ffd700',
      error: '#ff0033'
    }
  },
  {
    id: 'neon-orange',
    name: 'Neon Orange',
    colors: {
      primary: '#ff6600',
      secondary: '#cc4400',
      background: '#1a1a2e',
      surface: 'rgba(255, 102, 0, 0.1)',
      text: '#ffffff',
      accent: '#ff8833',
      success: '#ff9900',
      error: '#ff0033'
    }
  },
  {
    id: 'cyan-wave',
    name: 'Cyan Wave',
    colors: {
      primary: '#00ffff',
      secondary: '#0099cc',
      background: '#0a0e27',
      surface: 'rgba(0, 255, 255, 0.15)',
      text: '#ffffff',
      accent: '#33ffff',
      success: '#00ffcc',
      error: '#ff0033'
    }
  },
  {
    id: 'magenta-storm',
    name: 'Magenta Storm',
    colors: {
      primary: '#ff00ff',
      secondary: '#cc00cc',
      background: '#1a0a2e',
      surface: 'rgba(255, 0, 255, 0.1)',
      text: '#ffffff',
      accent: '#ff33ff',
      success: '#ff66ff',
      error: '#ff0033'
    }
  }
];

/**
 * Get theme by ID
 */
export const getThemeById = (id: string): ThemeOption => {
  return themeOptions.find(theme => theme.id === id) || themeOptions[0];
};

/**
 * Get theme by level number (1-8)
 */
export const getThemeByLevel = (level: number): ThemeOption => {
  // Direct mapping to avoid circular dependency with game.ts
  const themeMapping: Record<number, string> = {
    1: 'neon-blue',
    2: 'hot-pink',
    3: 'electric-green',
    4: 'deep-purple',
    5: 'bright-yellow',
    6: 'neon-orange',
    7: 'cyan-wave',
    8: 'magenta-storm',
  };
  
  const themeId = themeMapping[level] || 'neon-blue';
  return getThemeById(themeId);
};

/**
 * Apply theme colors to document CSS variables
 */
export const applyThemeToDocument = (colors: ThemeColors): void => {
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
  });
};
