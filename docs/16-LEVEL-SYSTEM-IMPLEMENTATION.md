# Level System Implementation Plan

## Overview
This document outlines the complete implementation plan for the 8-level progression system with level-up mechanics, theme changes, and achievement integration.

---

## 1. Level Structure & Progression

### 1.1 Level Definitions (8 Levels Total)
- **Level 1**: Neon Blue (Current - `neon-blue`)
- **Level 2**: Hot Pink (`hot-pink`)
- **Level 3**: Electric Green (`electric-green`)
- **Level 4**: Deep Purple (`deep-purple`)
- **Level 5**: Bright Yellow (`bright-yellow`)
- **Level 6**: Neon Orange (NEW - `neon-orange`)
- **Level 7**: Cyan Wave (NEW - `cyan-wave`)
- **Level 8**: Magenta Storm (NEW - `magenta-storm`)

### 1.2 Points Required for Level Progression
**Recommendation: Use POINTS (not XP)** - The game already uses a point-based scoring system, so we'll continue with points for consistency.

**Progressive Point Thresholds:**
- **Level 1 → 2**: 1,000 points
- **Level 2 → 3**: 2,500 points (cumulative: 3,500)
- **Level 3 → 4**: 5,000 points (cumulative: 8,500)
- **Level 4 → 5**: 7,500 points (cumulative: 16,000)
- **Level 5 → 6**: 10,000 points (cumulative: 26,000)
- **Level 6 → 7**: 15,000 points (cumulative: 41,000)
- **Level 7 → 8**: 20,000 points (cumulative: 61,000)

**Total points to reach Level 8**: 61,000 points

**Rationale**: 
- Early levels are easier to reach (quick gratification)
- Later levels require more skill and time investment
- Progressive difficulty encourages continued play

### 1.3 Drop Speed Increase per Level
**CRITICAL**: Drop speed **increases** (letters fall faster) as you progress to higher levels.

**Drop Speed Formula:**
- Base drop interval: 1,000ms (Level 1)
- Speed increase: -100ms per level (faster = lower interval)
- Minimum interval: 100ms (fastest possible speed)

**Drop Speed by Level:**
- **Level 1**: 1,000ms (slowest - easiest)
- **Level 2**: 900ms
- **Level 3**: 800ms
- **Level 4**: 700ms
- **Level 5**: 600ms
- **Level 6**: 500ms
- **Level 7**: 400ms
- **Level 8**: 300ms (fastest - most challenging)

**Note**: The drop speed increases automatically when `checkLevelUp()` is called. The formula ensures the game becomes progressively more challenging, requiring faster reflexes and better planning as players advance.

---

## 2. Level-Up Flow

### 2.1 Level-Up Trigger
When player reaches the required points threshold:
1. **Pause the game** immediately
2. **Show Level-Up Banner** (animated)
3. **Display score/points** achieved
4. **Clear the board** completely
5. **Change theme/color** to next level's theme
6. **Resume game** with new level settings

### 2.2 Level-Up Banner Component
**Banner Content:**
- **Title**: "LEVEL UP!"
- **New Level Number**: Large display (e.g., "LEVEL 2")
- **Points Earned**: Total points reached (e.g., "1,234 Points")
- **Theme Name**: Display new theme name (e.g., "Hot Pink")
- **Duration**: 3-4 seconds display time
- **Animation**: Cyberpunk-style with glow effects, particle effects

**Visual Design:**
- Full-screen overlay (modal-style)
- Cyberpunk neon border glow
- Animated particles/confetti
- Theme-colored accents matching the new level
- Smooth fade-in/fade-out transitions

---

## 2.3 Level Transition Effects (Per Level)

Each level transition has **unique visual and audio effects** that escalate in intensity, making higher levels feel more significant and rewarding. Effects are **theme-aware** and match the new level's color scheme.

### **Level 1 → 2: "Neon Blue to Hot Pink"**
**Theme**: Hot Pink (`#ff007f`)

**Visual Effects:**
1. **Screen Flash**: Bright pink flash (0.2s) with fade
2. **Particle Burst**: 20-30 pink particles explode from center, spread outward
3. **Banner Animation**: 
   - "LEVEL 2" text appears with scale + rotation animation
   - Pink neon glow pulsing around text
   - Pink particles falling around banner
4. **Board Clearing**: 
   - Cells fade out with pink glow (0.5s)
   - Smooth wipe transition from blue to pink
5. **Color Transition**: 
   - Background gradient transitions: blue → pink (1s)
   - Border colors animate to pink theme

**Audio Effects:**
- Sound: `level_up.mp3` (standard, 1.5s)
- Pitch: Normal (100%)
- Vibration: `[100, 50, 100]` (short pulse pattern)

**Duration**: 3.5 seconds total

---

### **Level 2 → 3: "Hot Pink to Electric Green"**
**Theme**: Electric Green (`#00ff00`)

**Visual Effects:**
1. **Screen Flash**: Electric green flash with lens flare effect (0.3s)
2. **Particle Burst**: 40-50 green particles with trails, spreading in star pattern
3. **Banner Animation**:
   - "LEVEL 3" text appears with green lightning effect
   - Green neon glow with pulsing intensity
   - Electric green particles with motion trails
   - Small lightning bolts around banner edges
4. **Board Clearing**:
   - Cells flash green before disappearing (0.4s)
   - Wave effect across board (left-to-right)
5. **Color Transition**:
   - Pink → Green color sweep (1.2s)
   - More dramatic contrast (pink/green are complementary colors)

**Audio Effects:**
- Sound: `level_up.mp3` + `lightning.mp3` (layered, 2s)
- Pitch: Slightly higher (110%)
- Vibration: `[150, 50, 150, 50, 100]` (double pulse)

**Duration**: 4.0 seconds total

---

### **Level 3 → 4: "Electric Green to Deep Purple"**
**Theme**: Deep Purple (`#800080`)

**Visual Effects:**
1. **Screen Flash**: Deep purple flash with radial blur (0.3s)
2. **Particle Burst**: 60-70 purple particles with purple/blue gradient
3. **Banner Animation**:
   - "LEVEL 4" text appears with purple energy wave
   - Purple neon glow with rotating rings
   - Purple particles with spiral motion
   - Purple energy orbs orbiting banner
4. **Board Clearing**:
   - Cells dissolve with purple particle effect (0.5s)
   - Spiral clear pattern (center-outward)
5. **Color Transition**:
   - Green → Purple smooth transition (1.3s)
   - Deep space/purple nebula effect

**Audio Effects:**
- Sound: `level_up.mp3` (lower pitch variant, 2.5s)
- Pitch: Lower (90%) - more dramatic
- Vibration: `[200, 100, 200, 100, 150]` (stronger, longer)

**Duration**: 4.5 seconds total

---

### **Level 4 → 5: "Deep Purple to Bright Yellow"**
**Theme**: Bright Yellow (`#ffff00`)

**Visual Effects:**
1. **Screen Flash**: Bright yellow flash (like camera flash) with bloom effect (0.4s)
2. **Particle Burst**: 80-90 yellow/gold particles with sparkle effects
3. **Banner Animation**:
   - "LEVEL 5" text appears with golden shine animation
   - Yellow neon glow with intense brightness pulsing
   - Gold particles with twinkle effect
   - Golden rays emanating from banner
   - **Special**: "HALFWAY HERO" achievement badge (if implemented)
4. **Board Clearing**:
   - Cells explode outward with yellow particles (0.6s)
   - Radial burst clear pattern
5. **Color Transition**:
   - Purple → Yellow dramatic contrast transition (1.5s)
   - Gold overlay during transition

**Audio Effects:**
- Sound: `level_up.mp3` + `combo.mp3` (layered, triumphant, 3s)
- Pitch: Higher (115%) - celebratory
- Vibration: `[250, 50, 250, 50, 250, 50, 200]` (triumphant pattern)

**Duration**: 5.0 seconds total

---

### **Level 5 → 6: "Bright Yellow to Neon Orange"**
**Theme**: Neon Orange (`#ff6600`)

**Visual Effects:**
1. **Screen Flash**: Orange fire-like flash with heat wave distortion (0.4s)
2. **Particle Burst**: 100-120 orange/red particles with fire trail effects
3. **Banner Animation**:
   - "LEVEL 6" text appears with fire/explosion effect
   - Orange neon glow with intense heat shimmer
   - Orange particles with flame animations
   - Fire rings rotating around banner
4. **Board Clearing**:
   - Cells burst into flames/particles (0.7s)
   - Top-to-bottom fire sweep
5. **Color Transition**:
   - Yellow → Orange warm color transition (1.5s)
   - Fire/heat visual effect overlay

**Audio Effects:**
- Sound: `level_up.mp3` + `bomb.mp3` (explosive, 3s)
- Pitch: Mid-high (105%) with reverb
- Vibration: `[300, 100, 300, 100, 250]` (strong, explosive)

**Duration**: 5.5 seconds total

---

### **Level 6 → 7: "Neon Orange to Cyan Wave"**
**Theme**: Cyan Wave (`#00ffff`)

**Visual Effects:**
1. **Screen Flash**: Cyan flash with water/wave ripple effect (0.5s)
2. **Particle Burst**: 120-150 cyan particles with wave motion
3. **Banner Animation**:
   - "LEVEL 7" text appears with water/wave animation
   - Cyan neon glow with flowing wave pattern
   - Cyan particles with fluid motion trails
   - Wave rings expanding from banner center
   - **Special**: Ocean/wave background effect
4. **Board Clearing**:
   - Cells wash away like waves (0.8s)
   - Wave sweep pattern (multiple waves)
5. **Color Transition**:
   - Orange → Cyan dramatic contrast (1.8s)
   - Wave/f water effect overlay during transition

**Audio Effects:**
- Sound: `level_up.mp3` + `wind.mp3` (layered, 3.5s)
- Pitch: High (120%) - ethereal
- Vibration: `[350, 80, 350, 80, 350, 80, 300]` (wave-like pattern)

**Duration**: 6.0 seconds total

---

### **Level 7 → 8: "Cyan Wave to Magenta Storm" (FINAL LEVEL)**
**Theme**: Magenta Storm (`#ff00ff`)

**Visual Effects:**
1. **Screen Flash**: Intense magenta flash with screen shake (0.6s)
2. **Particle Burst**: 150-200 magenta/purple particles with chaotic motion
3. **Banner Animation**:
   - "LEVEL 8" text appears with **STORM/EXPLOSION** effect
   - Intense magenta neon glow with pulsing chaos
   - Magenta particles with lightning and storm effects
   - Rotating energy rings with multiple colors
   - **Special**: "LEGEND" achievement badge (if implemented)
   - **Special**: Screen shake during animation
   - **Special**: Multiple particle layers (foreground, midground, background)
4. **Board Clearing**:
   - Epic explosion clear - cells explode in all directions (1.0s)
   - Multiple clearing patterns combined (wave + spiral + radial)
5. **Color Transition**:
   - Cyan → Magenta epic final transition (2.0s)
   - Storm/chaos visual effects
   - Rainbow color flash during transition

**Audio Effects:**
- Sound: `level_up.mp3` + `combo.mp3` + `bomb.mp3` (all layered, EPIC, 4s)
- Pitch: Dynamic (90% → 130% sweep) - dramatic finale
- Vibration: `[400, 100, 400, 100, 400, 100, 400, 100, 350]` (intense, celebratory)

**Duration**: 7.0 seconds total (longest - final level deserves epic treatment!)

---

### **Effect Intensity Progression Summary:**

| Level | Particles | Duration | Audio Layers | Screen Effects | Special Features |
|-------|-----------|----------|--------------|----------------|------------------|
| 1→2   | 20-30     | 3.5s     | 1            | Flash          | Basic            |
| 2→3   | 40-50     | 4.0s     | 2            | Flash + Lens   | Lightning        |
| 3→4   | 60-70     | 4.5s     | 1            | Flash + Blur   | Energy Orbs      |
| 4→5   | 80-90     | 5.0s     | 2            | Flash + Bloom  | Achievement Badge|
| 5→6   | 100-120   | 5.5s     | 2            | Flash + Heat   | Fire Effects     |
| 6→7   | 120-150   | 6.0s     | 2            | Flash + Waves  | Water Effects    |
| 7→8   | 150-200   | 7.0s     | 3            | Flash + Shake  | Epic Storm + Badge|

**Progression Philosophy**: Each level feels more significant and rewarding than the last, culminating in an epic finale for Level 8!

---

## 3. Level Configuration

### 3.1 Update Constants (`src/constants/game.ts`)

```typescript
export const LEVEL_CONFIG = {
  MAX_LEVEL: 8,  // Changed from 50
  LEVEL_THEMES: {
    1: 'neon-blue',
    2: 'hot-pink',
    3: 'electric-green',
    4: 'deep-purple',
    5: 'bright-yellow',
    6: 'neon-orange',
    7: 'cyan-wave',
    8: 'magenta-storm',
  },
  POINTS_THRESHOLDS: {
    1: 0,        // Start at level 1
    2: 1000,     // 1,000 points to reach level 2
    3: 3500,     // 2,500 more (total 3,500) to reach level 3
    4: 8500,     // 5,000 more (total 8,500) to reach level 4
    5: 16000,    // 7,500 more (total 16,000) to reach level 5
    6: 26000,    // 10,000 more (total 26,000) to reach level 6
    7: 41000,    // 15,000 more (total 41,000) to reach level 7
    8: 61000,    // 20,000 more (total 61,000) to reach level 8
  },
  SPEED_INCREASE_PER_LEVEL: 100, // ms - decrease drop interval per level (makes letters fall faster)
  MIN_DROP_INTERVAL: 100,        // ms - fastest possible speed (safety limit)
} as const;

/**
 * Calculate drop speed for a given level
 * Lower interval = faster drop speed
 * Level 1: 1000ms, Level 2: 900ms, Level 3: 800ms, etc.
 */
export const calculateDropSpeed = (level: number): number => {
  return Math.max(
    DROP_CONFIG.BASE_INTERVAL - ((level - 1) * DROP_CONFIG.SPEED_INCREASE_PER_LEVEL),
    DROP_CONFIG.MIN_INTERVAL
  );
};
```

### 3.2 Add New Theme Colors (`src/constants/themes.ts` - NEW FILE)

Add 3 new themes to complement existing 5 themes:

**Level 6: Neon Orange**
```typescript
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
}
```

**Level 7: Cyan Wave**
```typescript
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
}
```

**Level 8: Magenta Storm**
```typescript
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
```

---

## 4. Implementation Steps

### Phase 1: Core Level System Updates

#### Step 1.1: Update Level Configuration
**File**: `src/constants/game.ts`
- Update `LEVEL_CONFIG` with new thresholds and MAX_LEVEL = 8
- Add `LEVEL_THEMES` mapping

#### Step 1.2: Create Theme Constants
**File**: `src/constants/themes.ts` (NEW)
- Move theme definitions from `example/src/theme/colors.ts` 
- Add 3 new themes (neon-orange, cyan-wave, magenta-storm)
- Export `getThemeByLevel(level: number)` function

#### Step 1.3: Update Level-Up Check Logic
**File**: `src/core/GameEngine.ts`
- Modify `checkLevelUp()` method:
  - Use cumulative point thresholds from `LEVEL_CONFIG.POINTS_THRESHOLDS`
  - Check if `score >= LEVEL_CONFIG.POINTS_THRESHOLDS[this.level + 1]`
  - Trigger level-up event (not just increment level)
  - Store level-up state for UI
  - **IMPORTANT**: Drop speed increase is already implemented and will work automatically

**Current Implementation (lines 775-786):**
The drop speed increase is already correctly implemented:
```typescript
private checkLevelUp(): void {
  const pointsNeeded = this.level * LEVEL_CONFIG.POINTS_PER_LEVEL;
  if (this.score >= pointsNeeded && this.level < LEVEL_CONFIG.MAX_LEVEL) {
    this.level++;
    // Increase drop speed (decrease interval) - ALREADY IMPLEMENTED
    this.dropInterval = Math.max(
      DROP_CONFIG.BASE_INTERVAL - ((this.level - 1) * DROP_CONFIG.SPEED_INCREASE_PER_LEVEL),
      DROP_CONFIG.MIN_INTERVAL
    );
  }
}
```

**Updated Method Needed:**
```typescript
private triggerLevelUp(newLevel: number): void {
  // Store level-up info for UI
  this.isLevelingUp = true;
  this.levelUpData = {
    newLevel,
    points: this.score,
    themeId: LEVEL_CONFIG.LEVEL_THEMES[newLevel],
  };
  
  // Update level
  this.level = newLevel;
  
  // Update drop speed (INCREASE SPEED = DECREASE INTERVAL)
  // This is already correctly implemented - letters fall faster at higher levels
  this.dropInterval = Math.max(
    DROP_CONFIG.BASE_INTERVAL - ((this.level - 1) * DROP_CONFIG.SPEED_INCREASE_PER_LEVEL),
    DROP_CONFIG.MIN_INTERVAL
  );
  
  debugLog(`🚀 Level Up! New level: ${newLevel}, Drop speed: ${this.dropInterval}ms (${((DROP_CONFIG.BASE_INTERVAL - this.dropInterval) / 10).toFixed(0)}% faster)`);
  
  // Clear board completely
  this.clearBoard();
  
  // Reset position
  this.resetGamePosition();
  
  // Notify UI
  this.notifyStateChange();
}
```

#### Step 1.4: Add Board Clearing Method
**File**: `src/core/GameEngine.ts`
- Implement `clearBoard()` method:
  - Remove all letters from board
  - Keep board structure intact
  - Reset all cell states

### Phase 2: Level-Up Banner Component & Effects

#### Step 2.0: Create Level Effects Configuration
**File**: `src/utils/levelEffects.ts` (NEW)
- Define `LevelEffectConfig` interface
- Implement `getLevelEffectConfig(level: number)` function
- Maps each level (2-8) to its specific effect configuration
- Returns duration, particle count, audio layers, screen effects, etc.

#### Step 2.1: Create Level-Up Banner Component
**File**: `src/components/LevelUpBanner.tsx` (NEW)
- Props: `{ level: number, points: number, theme: ThemeOption, onComplete: () => void }`
- Display animated banner with:
  - "LEVEL UP!" title
  - New level number (large, animated)
  - Points earned
  - Theme name
- **Level-specific effects** based on level number (see Section 2.3)
- Theme-aware colors (use theme.colors for all visual elements)
- Auto-hide after level-appropriate duration (3.5s - 7.0s)
- Call `onComplete()` when animation finishes

**Component Structure:**
```typescript
interface LevelUpBannerProps {
  level: number;
  points: number;
  theme: ThemeOption;  // Full theme object with colors
  onComplete: () => void;
}

export const LevelUpBanner: React.FC<LevelUpBannerProps> = ({ 
  level, 
  points, 
  theme, 
  onComplete 
}) => {
  // Get level-specific effect configuration
  const effectConfig = getLevelEffectConfig(level);
  
  // Apply theme colors to CSS variables dynamically
  // Render particles, animations, etc. based on level
  // Auto-dismiss after effectConfig.duration
  
  return (
    <div className="level-up-overlay" style={{ 
      '--theme-primary': theme.colors.primary,
      '--theme-accent': theme.colors.accent,
      // ... other theme colors
    }}>
      {/* Level-specific particle effects */}
      {/* Banner content */}
      {/* Achievement badges (for levels 5, 8) */}
    </div>
  );
};
```

**Helper Function Needed:**
```typescript
// src/utils/levelEffects.ts (NEW)
export interface LevelEffectConfig {
  duration: number;
  particleCount: number;
  audioLayers: string[];
  screenEffect: 'flash' | 'flash-lens' | 'flash-blur' | 'flash-bloom' | 'flash-heat' | 'flash-waves' | 'flash-shake';
  specialFeatures: string[];
  vibrationPattern: number[];
  audioPitch: number | [number, number]; // single pitch or pitch sweep
}

export const getLevelEffectConfig = (level: number): LevelEffectConfig => {
  // Return configuration based on level (see Section 2.3)
  // Maps level 2-8 to their specific effect configs
};
```

#### Step 2.2: Create Level-Up Banner Styles
**File**: `src/components/LevelUpBanner.css` (NEW)
- Cyberpunk neon styling
- **Level-specific particle/confetti effects** (different counts and patterns per level)
- **Theme-color-aware styling** (uses CSS variables for dynamic theming)
- **Multiple animation types**:
  - `@keyframes level-up-flash` (basic)
  - `@keyframes level-up-lens-flare` (level 3)
  - `@keyframes level-up-bloom` (level 5)
  - `@keyframes level-up-heat-wave` (level 6)
  - `@keyframes level-up-water-ripple` (level 7)
  - `@keyframes level-up-storm-shake` (level 8)
- Smooth animations (fade, scale, glow, rotate, shake)
- **Particle system CSS classes** (20-200 particles based on level)
- **Screen effect overlays** (lens flare, heat wave, water, storm)

**CSS Variable System:**
```css
.level-up-overlay {
  --theme-primary: #00d9ff;  /* Dynamically set from theme */
  --theme-accent: #00ffff;
  --theme-secondary: #0066cc;
  /* Use these throughout animations for theme consistency */
}

.level-up-banner {
  color: var(--theme-primary);
  text-shadow: 0 0 20px var(--theme-primary);
  border-color: var(--theme-accent);
  box-shadow: 0 0 40px var(--theme-primary);
}
```

**Reference**: Use `example/src/components/LevelUpAnimation.tsx` and `example/src/styles/LevelUpAnimation.css` as inspiration, but enhance with level-specific variations

#### Step 2.3: Integrate Banner into GameBoard
**File**: `src/components/GameBoard.tsx`
- Add state for `showLevelUpBanner`
- Show banner when `gameState.isLevelingUp === true`
- Pass level, points, and theme data to banner
- Handle banner completion:
  - Hide banner
  - Resume game
  - Apply theme change (already handled, but ensure smooth transition)

#### Step 2.4: Implement Audio Effects System
**File**: `src/services/SoundService.ts` (UPDATE or create if missing)
- Add `playLevelUp(level: number)` method:
  - Loads appropriate sound layers based on level
  - Adjusts pitch dynamically
  - Handles layered audio (multiple sounds playing simultaneously)
  - Example: Level 8 plays `level_up.mp3` + `combo.mp3` + `bomb.mp3` together

**File**: `src/utils/vibration.ts` (NEW if missing)
- Add `vibrateLevelUp(level: number)` function
- Maps level to vibration pattern (from levelEffects config)
- Uses Web Vibration API if available
- Graceful fallback if vibration not supported

#### Step 2.5: Implement Screen Effects
**File**: `src/utils/screenEffects.ts` (NEW)
- Functions for different screen effects:
  - `applyScreenFlash(color: string, duration: number, type: 'basic' | 'lens' | 'blur' | 'bloom' | 'heat' | 'waves' | 'shake')`
  - Creates temporary overlay elements for screen effects
  - Uses CSS animations for performance
  - Auto-removes after animation completes

#### Step 2.6: Implement Particle System
**File**: `src/components/ParticleSystem.tsx` (NEW)
- React component for rendering particles
- Props: `{ count: number, color: string, pattern: 'burst' | 'star' | 'spiral' | 'wave' | 'storm', duration: number }`
- Uses CSS animations for performance (no canvas needed for most effects)
- For Level 8: May need canvas for complex storm effects (optional enhancement)

### Phase 3: Theme Integration

#### Step 3.1: Theme Context/Hook
**File**: `src/hooks/useTheme.ts` (NEW) or update existing
- Manage current theme based on level
- Apply theme CSS variables to document
- Provide `setTheme(themeId: string)` function

#### Step 3.2: Apply Theme on Level Up
**File**: `src/components/GameBoard.tsx`
- On level-up completion:
  - Get theme from `LEVEL_CONFIG.LEVEL_THEMES[newLevel]`
  - Apply theme using `applyThemeToDocument()` or theme hook
  - Update CSS variables

#### Step 3.3: Update Game Styles
**File**: `src/components/GameCell.css`, `src/App.css`
- Ensure all colors use CSS variables (e.g., `var(--theme-primary)`)
- Update hardcoded colors to use theme variables

### Phase 4: Game Engine Integration

#### Step 4.1: Update GameEngineState
**File**: `src/core/GameEngine.ts`
- Add to `GameEngineState` interface:
  ```typescript
  isLevelingUp: boolean;
  levelUpData: {
    newLevel: number;
    points: number;
    themeId: string;
  } | null;
  ```

#### Step 4.2: Update Game State Type
**File**: `src/types/game.ts`
- Add level-up fields to `GameState` interface

#### Step 4.3: Handle Level-Up Completion
**File**: `src/core/GameEngine.ts`
- Add `completeLevelUp()` method:
  - Reset `isLevelingUp` flag
  - Clear `levelUpData`
  - Resume game loop
  - Notify state change

#### Step 4.4: Update useGameState Hook
**File**: `src/hooks/useGameState.ts`
- Add method: `completeLevelUp()`
- Expose level-up state to UI

---

## 5. Achievements System (Optional Enhancement)

### 5.1 Level-Based Achievements
**Suggested Achievements:**
- **"Rising Star"**: Reach Level 2 (50 bonus points)
- **"Color Changer"**: Reach Level 3 (100 bonus points)
- **"Halfway Hero"**: Reach Level 4 (200 bonus points)
- **"Level Master"**: Reach Level 5 (500 bonus points)
- **"Elite Player"**: Reach Level 6 (1,000 bonus points)
- **"Veteran"**: Reach Level 7 (2,000 bonus points)
- **"Legend"**: Reach Level 8 (5,000 bonus points)

### 5.2 Achievement Integration Points
- Check achievements on level-up
- Show achievement notification after level-up banner (sequential)
- Award bonus points to player's score
- Store achievements in localStorage or game state

### 5.3 Achievement Service
**File**: `src/services/AchievementService.ts` (NEW or update existing)
- Check level-based achievements
- Return unlocked achievements
- Award bonus points
- Store achievement progress

**Reference**: Use `example/src/services/AchievementService.ts` as reference

---

## 6. Testing Checklist

### Level Progression
- [ ] Level 1 starts correctly (neon blue theme)
- [ ] Level 1 → 2 triggers at 1,000 points
- [ ] Level 2 → 3 triggers at 3,500 points (cumulative)
- [ ] All 8 levels progress correctly
- [ ] Cannot exceed Level 8

### Level-Up Banner & Effects
- [ ] Banner appears when level increases
- [ ] Banner shows correct level number
- [ ] Banner shows correct points
- [ ] Banner shows correct theme name
- [ ] Banner auto-dismisses after level-appropriate duration
- [ ] Banner animations are smooth

**Level-Specific Effects:**
- [ ] Level 2: Basic flash + 20-30 particles (3.5s)
- [ ] Level 3: Lens flare + lightning + 40-50 particles (4.0s)
- [ ] Level 4: Blur effect + energy orbs + 60-70 particles (4.5s)
- [ ] Level 5: Bloom effect + achievement badge + 80-90 particles (5.0s)
- [ ] Level 6: Heat wave + fire effects + 100-120 particles (5.5s)
- [ ] Level 7: Water ripple + wave effects + 120-150 particles (6.0s)
- [ ] Level 8: Screen shake + storm effects + 150-200 particles + achievement badge (7.0s)

**Audio & Haptic:**
- [ ] Audio plays correctly for each level
- [ ] Audio layers work (multiple sounds for higher levels)
- [ ] Pitch adjustments work (higher/lower based on level)
- [ ] Vibration patterns work on supported devices
- [ ] Effects respect user's sound/vibration settings

### Theme Changes
- [ ] Theme changes when level up completes
- [ ] All 8 themes apply correctly
- [ ] Colors update throughout UI (cells, borders, text)
- [ ] Theme persists during gameplay

### Board Clearing
- [ ] Board clears completely on level up
- [ ] All letters removed
- [ ] Board structure remains intact
- [ ] Game resumes with fresh board

### Game Continuity
- [ ] Game pauses during level-up banner
- [ ] Game resumes after banner dismissal
- [ ] Score persists across level-ups
- [ ] **Drop speed increases with level (letters fall faster)**
  - [ ] Level 1: 1000ms interval
  - [ ] Level 2: 900ms interval (10% faster)
  - [ ] Level 3: 800ms interval (20% faster)
  - [ ] Level 4: 700ms interval (30% faster)
  - [ ] Level 5: 600ms interval (40% faster)
  - [ ] Level 6: 500ms interval (50% faster)
  - [ ] Level 7: 400ms interval (60% faster)
  - [ ] Level 8: 300ms interval (70% faster - maximum challenge)
- [ ] Next letter generates correctly after level-up
- [ ] Players notice the increased difficulty/speed immediately after level-up

### Achievements (if implemented)
- [ ] Achievements unlock on level milestones
- [ ] Achievement notifications appear
- [ ] Bonus points awarded correctly
- [ ] Achievement progress tracked

---

## 7. File Structure Changes

### New Files
```
src/
  components/
    LevelUpBanner.tsx      # Level-up banner component (level-specific effects)
    LevelUpBanner.css      # Banner styling (theme-aware, level variations)
    ParticleSystem.tsx     # Particle effects component
  constants/
    themes.ts              # Theme definitions and utilities
  utils/
    levelEffects.ts        # Level-specific effect configurations
    screenEffects.ts       # Screen flash/effect utilities
    vibration.ts           # Vibration patterns (if missing)
  services/
    AchievementService.ts  # Achievement logic (optional)
    SoundService.ts        # Audio service (update if exists, create if missing)
```

### Modified Files
```
src/
  constants/
    game.ts                # Update LEVEL_CONFIG
  core/
    GameEngine.ts          # Level-up logic, board clearing
  types/
    game.ts                # Add level-up state fields
  hooks/
    useGameState.ts        # Expose level-up completion
  components/
    GameBoard.tsx          # Integrate banner, theme changes
    GameCell.css           # Use theme CSS variables
  App.css                  # Theme variable support
```

---

## 8. Implementation Priority

### Priority 1 (Core Functionality)
1. Update level configuration constants
2. Add 3 new themes
3. Update `checkLevelUp()` logic
4. Implement board clearing
5. Create level-up banner component

### Priority 2 (Polish & UX)
1. Theme integration and CSS variable updates
2. Smooth animations and transitions
3. Sound effects (optional)
4. Achievement system (optional)

### Priority 3 (Enhancements)
1. Achievement notifications
2. Level-up statistics tracking
3. Level progression analytics
4. Save/load level progress (future)

---

## 9. Design Decisions

### Points vs XP
**Decision**: Use **POINTS** (not XP)
- Consistency with existing scoring system
- Players already familiar with point-based progression
- Simpler implementation (no separate XP system needed)

### Level-Up Timing
**Decision**: Immediate level-up when threshold reached
- Clear, predictable progression
- Immediate feedback for players
- Pause game during banner display

### Board Clearing
**Decision**: Complete board clear on level-up
- Fresh start for each level
- Prevents level-up from occurring mid-game
- Cleaner visual transition
- Fairer difficulty progression

### Drop Speed Increase
**Decision**: Automatic speed increase on level-up (ALREADY IMPLEMENTED)
- Drop interval decreases by 100ms per level
- Makes game progressively more challenging
- Encourages skill improvement
- Provides clear sense of progression and difficulty scaling
- Speed change is immediate and noticeable to players

### Achievement Integration
**Decision**: Optional for Phase 1, Recommended for Phase 2
- Level system should work without achievements first
- Achievements can be added incrementally
- Provides future engagement opportunities

---

## 10. Success Metrics

- All 8 levels unlock correctly at point thresholds
- Level-up banner displays smoothly and dismisses properly
- Themes apply correctly and persist during gameplay
- Board clears completely on level-up
- **Drop speed increases correctly (letters fall faster at higher levels)**
  - Players can feel the increased challenge
  - Speed progression is smooth and balanced
  - No sudden jumps or jarring speed changes
- Game resumes seamlessly after level-up
- No performance degradation with level system
- Achievements unlock as intended (if implemented)

---

## Next Steps

1. Review and approve this implementation plan
2. Start with Priority 1 items (core functionality)
3. Test each phase before moving to next
4. Iterate based on feedback and testing
5. Add achievements in Phase 2 if desired

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Ready for Implementation