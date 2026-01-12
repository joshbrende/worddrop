# Complete Implementation Guide

This guide provides specific instructions for building the clean fresh WordDROP game with all assets and design specifications.

## Visual Design: CYBERPUNK STYLE

### Color Palette

**Primary Colors:**
- **Background**: Deep dark blue/black (`#0a0e27`, `#0d1117`)
- **Primary Accent**: Neon cyan/blue (`#00d9ff`, `#00b8ff`)
- **Secondary Accent**: Hot pink/magenta (`#ff006e`, `#ff0080`)
- **Tertiary Accent**: Electric purple (`#b300ff`, `#8b00cc`)

**Text Colors:**
- **Primary Text**: Neon cyan (`#00d9ff`)
- **Secondary Text**: White/off-white (`#ffffff`, `#e0e0e0`)
- **Accent Text**: Hot pink (`#ff006e`)
- **Warning/Danger**: Bright red (`#ff1744`)

**UI Elements:**
- **Buttons**: Dark with neon borders (`rgba(0, 217, 255, 0.3)`)
- **Active States**: Glowing neon borders with shadow (`0 0 15px rgba(0, 217, 255, 0.4)`)
- **Hover Effects**: Scale + glow animation
- **Background Gradient**: `linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)`

### Typography

**Font Stack:**
```css
font-family: 'Orbitron', 'Rajdhani', 'Exo 2', 'Roboto Mono', 'Courier New', monospace;
```

**Font Weights:**
- Headings: 700-900 (bold, extra-bold)
- Body: 400-600 (regular, medium)
- UI Labels: 500-600 (medium, semi-bold)

**Font Sizes:**
- Game Title: 48-64px (desktop), 32-40px (mobile)
- Headings: 24-32px
- Body: 16-18px
- UI Buttons: 14-16px
- Score/Stats: 20-24px

### Visual Effects

**Glow Effects:**
```css
box-shadow: 
  0 0 10px rgba(0, 217, 255, 0.5),
  0 0 20px rgba(0, 217, 255, 0.3),
  0 0 30px rgba(0, 217, 255, 0.1);
```

**Grid Lines:**
- Subtle neon grid overlay on game board
- Color: `rgba(0, 217, 255, 0.1)`
- Dashed lines for cyberpunk aesthetic

**Particles:**
- Animated particles for power-up effects
- Neon-colored (cyan, pink, purple)
- Fast, energetic animations

**Scanlines:**
- Optional subtle scanline overlay for retro-futuristic feel
- `background-image: repeating-linear-gradient(...)`

### UI Components

**Buttons:**
- Dark background: `rgba(30, 30, 40, 0.9)`
- Neon border: `1px solid rgba(0, 157, 255, 0.3)`
- Hover: Scale 1.1, glow effect
- Active: Scale 0.95, brighter glow

**Game Board:**
- Dark grid background
- Neon cell borders when active
- Glowing letters
- Particle effects on word clears

**Power-Up Icons:**
- Use provided SVG icons or emoji with neon glow
- Animated pulse on hover
- Count badge in bright accent color

## Asset Locations and Usage

### Sound Assets

**Location**: `C:\wamp64\www\words\Assets\sounds\`

**Available Files (21 files):**
- `bomb.mp3` - Bomb explosion sound
- `button_press.mp3` - Button click sound
- `button.mp3` - Button interaction
- `career-mode.mp3` - Career mode music (if used)
- `career-timer.mp3` - Timer sound
- `combo.mp3` - Combo/sponsor word celebration
- `error.mp3` - Error/invalid action sound
- `freeze.mp3` - Freeze power-up sound
- `game_over.mp3` - Game over sound
- `letter_drop.mp3` - Letter landing sound
- `level_up.mp3` - Level up celebration
- `lightning.mp3` - Lightning power-up sound
- `loop_menu.mp3` - Menu background music
- `menu.mp3` - Menu sound effect
- `move.mp3` - Movement/rotation sound
- `music.mp3` - Main game background music
- `red.mp3` - Unknown (check usage)
- `time-trial.mp3` - Time trial music (if used)
- `timer.mp3` - Timer tick sound
- `wind.mp3` - Wind power-up sound
- `word_clear.mp3` - Word cleared sound
- `word.mp3` - Word completion sound

**Usage in Code:**
```typescript
// src/services/SoundService.ts
const SOUND_EFFECTS = {
  move: '/sounds/move.mp3',
  wordComplete: '/sounds/word.mp3',
  wordClear: '/sounds/word_clear.mp3',
  combo: '/sounds/combo.mp3',
  levelUp: '/sounds/level_up.mp3',
  gameOver: '/sounds/game_over.mp3',
  letterDrop: '/sounds/letter_drop.mp3',
  bomb: '/sounds/bomb.mp3',
  lightning: '/sounds/lightning.mp3',
  freeze: '/sounds/freeze.mp3',
  wind: '/sounds/wind.mp3',
  button: '/sounds/button_press.mp3',
  error: '/sounds/error.mp3',
  music: '/sounds/music.mp3',
  menuMusic: '/sounds/loop_menu.mp3',
} as const;
```

**Copy to Project:**
```bash
# Copy sounds to public/sounds/ directory
cp -r C:\wamp64\www\words\Assets\sounds\* public/sounds/
```

**Optimization:**
- Compress all MP3s to 48-64kbps (saves ~50% size)
- Trim silence from beginning/end
- Keep music loops to 15-30 seconds
- Target total size: < 2MB

### Dictionary Asset

**Location**: `C:\wamp64\www\words\Assets\dictionary.csv`

**Format**: One word per line, lowercase

**Size**: ~172,000+ words (very large!)

**For CrazyGames**: Must optimize this!

**Option 1: Filter to Common Words (Recommended)**
```typescript
// Process dictionary.csv to keep only:
// - 3-8 letter words (game rules)
// - Common English words (top 5000-10000)
// - Remove proper nouns, abbreviations, rare words
```

**Option 2: Embedded TypeScript Array**
```typescript
// src/data/words.ts
export const WORDS = [
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all',
  'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day',
  // ... 2000-5000 most common words
] as const;

export function isValidWord(word: string): boolean {
  return WORDS.includes(word.toLowerCase());
}
```

**Recommended Approach:**
1. Extract top 2000-5000 most common 3-8 letter words
2. Embed as TypeScript constant array
3. Size: ~50-100KB (vs 2-5MB CSV)
4. Faster validation (O(1) lookup)

**Dictionary Processing Script:**
```typescript
// scripts/processDictionary.ts
import fs from 'fs';

const dictionary = fs.readFileSync('C:\\wamp64\\www\\words\\Assets\\dictionary.csv', 'utf-8');
const words = dictionary.split('\n')
  .map(w => w.trim().toLowerCase())
  .filter(w => w.length >= 3 && w.length <= 8)
  .filter(w => /^[a-z]+$/.test(w)) // Only letters
  .slice(0, 5000); // Top 5000

const output = `export const WORDS = [\n  '${words.join("',\n  '")}'\n] as const;\n\nexport function isValidWord(word: string): boolean {\n  return WORDS.includes(word.toLowerCase());\n}`;

fs.writeFileSync('src/data/words.ts', output);
```

### Lottie Animations

**Location**: `C:\wamp64\www\words\Assets\lottie\`

**Available Files:**
- `bomb.json` - Bomb explosion animation
- `burst.json` - Burst/explosion effect
- `LAqbdLQA4S.json` - Unknown animation (check usage)
- `OsIIVMHZMH.json` - Unknown animation (check usage)
- `sSbEJRZ7yP.json` - Unknown animation (check usage)
- `WU6BFwtsTX.json` - Unknown animation (check usage)
- `WU6BFwtsTX.lottie` - Lottie format version

**Usage:**
```typescript
// Install Lottie player
npm install @lottiefiles/react-lottie-player

// Or use lottie-web
npm install lottie-web
```

**Integration:**
```typescript
import Lottie from 'lottie-web';
import bombAnimation from '../assets/lottie/bomb.json';

// Use in BombTile component
useEffect(() => {
  const anim = Lottie.loadAnimation({
    container: containerRef.current,
    renderer: 'svg',
    loop: false,
    autoplay: false,
    animationData: bombAnimation
  });
  
  return () => anim.destroy();
}, []);
```

**For CrazyGames:**
- Lottie adds ~30KB to bundle
- Consider replacing with CSS animations if size is critical
- Or use only essential animations (bomb, burst)
- Remove unused animations

**Copy to Project:**
```bash
# Copy lottie files to src/assets/lottie/
mkdir -p src/assets/lottie
cp C:\wamp64\www\words\Assets\lottie\*.json src/assets/lottie/
```

### Additional Assets

**Background Images:**
- `bg.jpg` - Main background
- `bg2.png` - Alternative background
- `menu_bg.png` - Menu background

**Logos:**
- `logo.png` - Main logo
- `logo-dark.png` - Dark theme logo
- `logo-light.png` - Light theme logo

**Avatars:**
- `avatars/` - Cyber-themed avatars (already documented)

**Copy to Project:**
```bash
# Copy to public/images/
cp C:\wamp64\www\words\Assets\bg*.{jpg,png} public/images/
cp C:\wamp64\www\words\Assets\menu_bg.png public/images/
cp C:\wamp64\www\words\Assets\logo*.png public/images/
cp -r C:\wamp64\www\words\Assets\avatars public/images/
```

## CrazyGames SDK Integration

**Reference**: [CrazyGames Gameplay Requirements](https://docs.crazygames.com/requirements/gameplay/)

### Full Gameplay Requirements

**Critical Requirement**: Games must land new users in gameplay immediately. Maximum 1 click allowed if immediate gameplay is not feasible.

**Implementation Strategy:**
1. **Skip Main Menu**: Land directly in game
2. **Quick Tutorial**: In-game overlay (can be dismissed)
3. **One-Click Start**: If menu needed, "Play" button immediately visible

### SDK Installation

**Option 1: CDN (Recommended)**
```html
<!-- index.html -->
<script src="https://sdk.crazygames.com/crazygames-sdk-v2.js"></script>
```

**Option 2: NPM**
```bash
npm install @crazygames/crazy-sdk
```

### SDK Service Implementation

**File**: `src/services/CrazyGamesService.ts`

```typescript
interface CrazyGamesSDK {
  init(): void;
  game: {
    gameplayStart(): void;
    gameplayStop(): void;
  };
  user: {
    getSession(): Promise<{ id: string }>;
  };
  ad: {
    requestAd(type: 'midgame' | 'rewarded'): Promise<void>;
  };
}

declare global {
  interface Window {
    CrazyGames?: {
      SDK: CrazyGamesSDK;
    };
    crazygames?: CrazyGamesSDK;
  }
}

class CrazyGamesService {
  private sdk: CrazyGamesSDK | null = null;
  private initialized: boolean = false;
  private gameplayStarted: boolean = false;

  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    // Check for SDK (CDN loaded)
    if (window.CrazyGames?.SDK) {
      this.sdk = window.CrazyGames.SDK;
      this.sdk.init();
      this.initialized = true;
      console.log('CrazyGames SDK initialized');
    } else if (window.crazygames) {
      this.sdk = window.crazygames;
      this.sdk.init();
      this.initialized = true;
      console.log('CrazyGames SDK initialized (alternative)');
    } else {
      console.warn('CrazyGames SDK not found');
    }
  }

  gameplayStart(): void {
    if (!this.initialized || !this.sdk || this.gameplayStarted) return;
    
    try {
      this.sdk.game.gameplayStart();
      this.gameplayStarted = true;
      console.log('Gameplay start event triggered');
    } catch (error) {
      console.warn('CrazyGames SDK gameplayStart failed:', error);
    }
  }

  gameplayStop(): void {
    if (!this.initialized || !this.sdk || !this.gameplayStarted) return;
    
    try {
      this.sdk.game.gameplayStop();
      this.gameplayStarted = false;
      console.log('Gameplay stop event triggered');
    } catch (error) {
      console.warn('CrazyGames SDK gameplayStop failed:', error);
    }
  }

  async getUserSession(): Promise<{ id: string } | null> {
    if (!this.initialized || !this.sdk?.user) return null;
    
    try {
      return await this.sdk.user.getSession();
    } catch (error) {
      console.warn('Failed to get user session:', error);
      return null;
    }
  }
}

export default new CrazyGamesService();
```

### Integration in GameBoard

**File**: `src/components/GameBoard.tsx`

```typescript
import crazyGamesService from '../services/CrazyGamesService';

export default function GameBoard() {
  // ... existing code ...

  // Initialize SDK on mount
  useEffect(() => {
    crazyGamesService.initialize();
  }, []);

  // Trigger gameplayStart when player actually starts playing
  useEffect(() => {
    // Conditions for gameplay start:
    // 1. Dictionary loaded
    // 2. Board initialized
    // 3. First letter spawned and falling
    // 4. Game not paused/over
    
    if (
      dictionaryReady &&
      gameState.board.length > 0 &&
      gameState.currentLetter &&
      !gameState.isPaused &&
      !gameState.isGameOver
    ) {
      // This is the playable state - trigger gameplay start
      crazyGamesService.gameplayStart();
    }
  }, [dictionaryReady, gameState.currentLetter, gameState.isPaused, gameState.isGameOver]);

  // Trigger gameplayStop on game over
  useEffect(() => {
    if (gameState.isGameOver) {
      crazyGamesService.gameplayStop();
    }
  }, [gameState.isGameOver]);

  // ... rest of component ...
}
```

### Landing Directly in Gameplay

**Implementation Strategy:**

**Option 1: Remove Menu Completely**
```typescript
// App.tsx - Skip routes, go straight to game
function App() {
  return <GameBoard />;
}
```

**Option 2: Quick Start Button (1 Click Max)**
```typescript
// Landing component with immediate "Play" button
function Landing() {
  const [started, setStarted] = useState(false);
  
  if (started) {
    return <GameBoard />;
  }
  
  return (
    <div className="landing-screen">
      <h1>WordDROP</h1>
      <button onClick={() => setStarted(true)}>Play</button>
      {/* Tutorial overlay appears after button click, dismissible */}
    </div>
  );
}
```

**Recommended: Option 1 (Direct Gameplay)**
- No menu, no clicks
- In-game tutorial overlay (dismissible)
- Meets "immediate gameplay" requirement perfectly

### Responsive Sizing Requirements

**Critical Iframe Sizes** (must be readable):
- `907 x 510 px` (desktop - non-fullscreen)
- `1216 x 684 px` (desktop - non-fullscreen)
- `1077 x 606 px` (desktop - non-fullscreen)
- `821 x 462 px` (desktop - non-fullscreen)
- `1366 x 768 px` (desktop - fullscreen)
- `1920 x 1080 px` (desktop - fullscreen)
- `1536 x 864 px` (desktop - fullscreen)
- `1280 x 720 px` (desktop - fullscreen)
- `800 x 450 px` (mobile)
- `1080 x 607 px` (tablet)

**CSS Implementation:**
```css
/* Ensure readability at all sizes */
.game-board {
  font-size: clamp(12px, 2vw, 24px);
  min-width: 320px;
  max-width: 100%;
}

.cell {
  width: clamp(24px, 4vw, 48px);
  height: clamp(24px, 4vw, 48px);
  font-size: clamp(16px, 3vw, 32px);
}

/* Responsive text */
h1 { font-size: clamp(24px, 5vw, 64px); }
p { font-size: clamp(14px, 2vw, 18px); }
```

## Build Configuration Updates

### Vite Config for Assets

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // Relative paths for CrazyGames
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'game-core': ['./src/components/GameBoard.tsx'],
        },
      },
    },
  },
  publicDir: 'public', // Assets copied from Assets/ folder
});
```

### Asset Copy Script

```json
// package.json
{
  "scripts": {
    "copy-assets": "node scripts/copyAssets.js",
    "process-dictionary": "ts-node scripts/processDictionary.ts",
    "prebuild": "npm run copy-assets && npm run process-dictionary"
  }
}
```

```javascript
// scripts/copyAssets.js
const fs = require('fs');
const path = require('path');

const assetsDir = 'C:\\wamp64\\www\\words\\Assets';
const publicDir = 'public';

// Copy sounds
fs.cpSync(path.join(assetsDir, 'sounds'), path.join(publicDir, 'sounds'), { recursive: true });

// Copy images
fs.cpSync(path.join(assetsDir, 'avatars'), path.join(publicDir, 'images', 'avatars'), { recursive: true });
fs.copyFileSync(path.join(assetsDir, 'bg.jpg'), path.join(publicDir, 'images', 'bg.jpg'));
fs.copyFileSync(path.join(assetsDir, 'menu_bg.png'), path.join(publicDir, 'images', 'menu_bg.png'));
// ... etc
```

## Complete Implementation Checklist

### Phase 1: Setup
- [ ] Create new project structure
- [ ] Copy all assets from `Assets/` folder
- [ ] Process dictionary CSV to embedded TypeScript array
- [ ] Install dependencies (React, TypeScript, Vite, Lottie)
- [ ] Install CrazyGames SDK (CDN or NPM)

### Phase 2: Core Game
- [ ] Implement GameBoard with cyberpunk styling
- [ ] Implement falling letter mechanics
- [ ] Implement word detection (horizontal + vertical)
- [ ] Implement scoring system with all multipliers
- [ ] Implement all 5 power-ups
- [ ] Integrate sound effects (21 files)
- [ ] Integrate Lottie animations (7 files)

### Phase 3: CrazyGames Integration
- [ ] Integrate CrazyGames SDK
- [ ] Implement `gameplayStart()` trigger (when first letter falls)
- [ ] Implement `gameplayStop()` trigger (on game over)
- [ ] Remove menu, land directly in gameplay
- [ ] Implement responsive sizing for all iframe sizes
- [ ] Test on all required screen sizes

### Phase 4: Optimization
- [ ] Optimize sounds (compress to 48-64kbps)
- [ ] Optimize images (compress, convert formats)
- [ ] Minimize dictionary (2000-5000 words max)
- [ ] Optimize bundle size (target < 20MB initial download)
- [ ] Remove unused Lottie animations if needed
- [ ] Test performance on Chromebook (4GB RAM)

### Phase 5: Quality Assurance
- [ ] Test on Chrome, Edge, Safari
- [ ] Test mobile responsiveness
- [ ] Test keyboard controls (avoid restricted keys)
- [ ] Test touch controls
- [ ] Verify PEGI 12 compliance
- [ ] Test fullscreen functionality
- [ ] Verify no cross-promotion
- [ ] Test English language support

### Phase 6: Polish
- [ ] Apply cyberpunk color palette throughout
- [ ] Add glow effects and particles
- [ ] Implement responsive typography
- [ ] Add scanlines overlay (optional)
- [ ] Polish animations and transitions
- [ ] Add visual feedback for all actions

## Notes

- **Dictionary Size**: The CSV has 172k+ words - MUST be reduced to 2000-5000 for bundle size
- **Lottie Size**: Adds ~30KB per animation - use only essential ones
- **Sounds**: 21 files need compression - target < 2MB total
- **Responsive**: Must work perfectly at all CrazyGames iframe sizes
- **Gameplay Start**: Critical - must trigger when first letter falls, not on component mount
- **No Menu**: Direct gameplay landing is required for "Full Implementation" status

## References

- [CrazyGames Gameplay Requirements](https://docs.crazygames.com/requirements/gameplay/)
- [CrazyGames Quality Guidelines](https://docs.crazygames.com/requirements/quality/)
- [CrazyGames Technical Requirements](https://docs.crazygames.com/requirements/technical/)
- [CrazyGames SDK Documentation](https://docs.crazygames.com/sdk/)
