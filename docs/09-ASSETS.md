# Assets Documentation

Complete inventory and optimization guide for all game assets.

## Asset Categories

### 1. Sound Effects (`public/sounds/`)

#### Current Sound Files

**Game Sounds (12 files):**
- `move.mp3` - Movement sound effect
- `word.mp3` - Word completion sound
- `combo.mp3` - Combo/sponsor word celebration
- `level-up.mp3` - Level advancement sound
- `game-over.mp3` - Game over sound
- `drop.mp3` - Hard drop sound
- `music.mp3` - Background music (looping)
- `bomb.mp3` - Bomb explosion sound
- `lightning.mp3` - Lightning power-up sound
- `wind.mp3` - Wind power-up sound
- `click.mp3` - UI click sound (may not be used)
- `loop-menu.mp3` - Menu music (may not be used)

#### Sound Optimization

**Target Size**: < 2MB total (for initial download < 20MB)

**Optimization Strategies:**

1. **Compress Audio Files:**
   - **Music**: 128kbps → 64kbps (saves ~50% size)
   - **Effects**: 96kbps → 48kbps (saves ~50% size)
   - **Format**: MP3 (widely supported) or OGG Vorbis (smaller, good browser support)

2. **Trim Duration:**
   - **Music**: Keep looping segment to 15-30 seconds max
   - **Effects**: Keep under 2 seconds each
   - **Remove silence**: Trim leading/trailing silence

3. **Remove Unused:**
   - Check if `click.mp3` is actually used
   - Check if `loop-menu.mp3` is used (remove if not)
   - Remove any other unused sound files

4. **Tool Recommendations:**
   - **Audacity**: Free audio editor for compression/trimming
   - **FFmpeg**: Command-line tool for batch processing
   - **Online tools**: CloudConvert, etc.

**Estimated Size After Optimization:**
- Current: ~5-10MB (estimated)
- Optimized: ~1.5MB ✅

#### Sound Usage in Code

**Service**: `src/services/SoundService.ts`

**Sound Mapping**:
```typescript
const SOUND_EFFECTS_OBJ = {
  move: '/sounds/move.mp3',
  wordComplete: '/sounds/word.mp3',
  combo: '/sounds/combo.mp3',
  levelUp: '/sounds/level-up.mp3',
  gameOver: '/sounds/game-over.mp3',
  drop: '/sounds/drop.mp3',
  music: '/sounds/music.mp3',
  explosion: '/sounds/bomb.mp3',
  lightning: '/sounds/lightning.mp3',
  wind: '/sounds/wind.mp3',
};
```

**Important**: All paths are relative (`/sounds/...`) ✅ Good for CrazyGames!

### 2. Images (`public/images/`)

#### Avatar Images (`public/images/avatars/`)

**8 SVG Avatar Files:**
- `cyber-agent.svg`
- `cyber-hacker.svg`
- `cyber-ninja.svg`
- `cyber-punk.svg`
- `cyber-samurai.svg`
- `ninja.svg`
- `robot-avatar.svg`
- `robot.svg`

**Optimization:**
- SVGs are already vector (scalable, small size)
- Can optimize by removing unnecessary metadata
- **For CrazyGames**: Keep 2-3 most used, remove others
- **Size**: ~5-10KB each (very small)

#### Logo Images

- `Logo-dark.png` - Dark theme logo (PNG)
- `Logo-light.png` - Light theme logo (PNG)
- `logo-small.svg` - Small logo (SVG)
- `logo.svg` - Main logo (SVG)

**Optimization:**
- Convert PNGs to WebP (smaller size)
- Or use SVG versions (preferred for scalability)
- **For CrazyGames**: Use SVG only (remove PNGs if not needed)
- Compress SVGs (remove metadata, optimize paths)

#### Power-Up Icons (`public/images/power-ups/`)

**5 SVG Icons:**
- `bomb.svg` - Bomb power-up icon
- `freeze.svg` - Freeze power-up icon
- `lightning.svg` - Lightning power-up icon
- `shuffle.svg` - Shuffle icon (may not be used)
- `wind.svg` - Wind power-up icon

**Optimization:**
- SVGs are already optimal
- Remove unused icons (`shuffle.svg` if not used)
- Optimize SVG code (remove unnecessary elements)

**Estimated Total Image Size:**
- Current: ~500KB-1MB (estimated)
- Optimized: ~200KB ✅

### 3. Icons (`public/icons/`)

#### Android Icons
- Multiple sizes: 48x48, 72x72, 96x96, 144x144, 192x192, 512x512

#### iOS Icons
- Multiple sizes: 16x16 to 1024x1024 (many sizes)

**For CrazyGames:**
- Keep only essential sizes: 192x192 and 512x512
- Remove all other sizes (saves significant space)
- **Estimated savings**: ~500KB-1MB

### 4. Dictionary (`public/dictionary.csv`)

**Current**: Large CSV file (likely several MB)

**Purpose**: Word validation dictionary

**Optimization Options:**

1. **Reduce Dictionary Size:**
   - Keep only common words (3-8 letters)
   - Remove obscure/rare words
   - Target: < 500KB

2. **Embed in Code:**
   - Convert to TypeScript array: `src/data/words.ts`
   - Include only 1000-2000 most common words
   - Size: < 50KB
   - **Recommended for CrazyGames**: Use embedded dictionary

3. **Lazy Load:**
   - Load dictionary after gameplay starts
   - But must load before `gameplayStart` event for size measurement

**Example Embedded Dictionary:**
```typescript
// src/data/words.ts
export const WORDS = [
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all',
  // ... 1000-2000 common words
] as const;

export function isValidWord(word: string): boolean {
  return WORDS.includes(word.toLowerCase());
}
```

**Estimated Size:**
- Current CSV: ~2-5MB
- Optimized CSV: ~500KB
- Embedded array: ~50KB ✅ (Recommended)

### 5. Lottie Animations (`src/assets/animations/`)

**Files:**
- `robot.json` - Robot animation
- `robot2.json` - Alternative robot animation

**For CrazyGames:**
- Remove if not essential (saves bundle size)
- Or keep if animations are important for UX
- Size: ~50-100KB each

**Usage**: `@lottiefiles/react-lottie-player` package (adds ~30KB to bundle)

### 6. Other Assets

#### Favicon
- `public/favicon.svg` - SVG favicon (optimal)

#### Manifest
- `public/manifest.json` - PWA manifest (can remove for CrazyGames)

## Asset Size Summary

### Current (Estimated)
- Sounds: ~5-10MB
- Images: ~1MB
- Icons: ~1-2MB
- Dictionary: ~2-5MB
- **Total: ~10-20MB** ❌ (Too large for initial download)

### Optimized (Target)
- Sounds: ~1.5MB (compressed)
- Images: ~200KB (optimized)
- Icons: ~200KB (essential sizes only)
- Dictionary: ~50KB (embedded)
- **Total: ~2MB** ✅ (Well under 20MB limit)

## Asset Optimization Checklist

### Phase 1: Audio
- [ ] Compress all MP3 files (64kbps music, 48kbps effects)
- [ ] Trim music to 15-30 second loops
- [ ] Trim effects to < 2 seconds
- [ ] Remove unused sound files (`click.mp3`, `loop-menu.mp3` if unused)
- [ ] Verify all sounds still work after compression

### Phase 2: Images
- [ ] Convert PNG logos to WebP or use SVG
- [ ] Optimize SVG files (remove metadata)
- [ ] Remove unused avatars (keep 2-3)
- [ ] Remove unused power-up icons
- [ ] Compress all images

### Phase 3: Icons
- [ ] Keep only 192x192 and 512x512 sizes
- [ ] Remove all other icon sizes
- [ ] Optimize remaining icons

### Phase 4: Dictionary
- [ ] Create embedded word list (`src/data/words.ts`)
- [ ] Include 1000-2000 most common words
- [ ] Remove `dictionary.csv` file
- [ ] Update DictionaryService to use embedded list

### Phase 5: Other
- [ ] Remove unused Lottie animations (if not essential)
- [ ] Remove PWA manifest (for CrazyGames)
- [ ] Keep favicon (small, essential)

## Asset Loading Strategy

### Critical Assets (Load First)
- Essential sounds (move, word, combo, music)
- Game board graphics
- Power-up icons (if displayed immediately)

### Non-Critical Assets (Lazy Load)
- Background music (can load after gameplay starts)
- Menu sounds
- Additional animations

### Implementation:
```typescript
// Lazy load non-critical assets
const loadBackgroundMusic = async () => {
  if (!isPlaying) return; // Only load when needed
  const audio = new Audio('/sounds/music.mp3');
  await audio.load();
};
```

## Path Configuration

**Important**: All asset paths must be relative for CrazyGames!

**Current (Good):**
- `/sounds/music.mp3` ✅
- `/images/logo.svg` ✅
- `./assets/animations/robot.json` ✅

**Bad (Absolute URLs):**
- `https://example.com/sounds/music.mp3` ❌
- `//cdn.example.com/assets/logo.svg` ❌

## Asset Management Best Practices

1. **Use Relative Paths**: Always use paths relative to public folder
2. **Optimize Before Adding**: Compress assets before adding to project
3. **Use Appropriate Formats**: SVG for vectors, WebP for photos, MP3 for audio
4. **Remove Unused**: Delete any assets not referenced in code
5. **Version Control**: Use Git LFS for large binary files (if needed)
6. **CDN Consideration**: For CrazyGames, assets are served from their CDN (still use relative paths)

## Tools for Asset Optimization

### Audio
- **Audacity** (free): https://www.audacityteam.org/
- **FFmpeg** (command-line): https://ffmpeg.org/
- **CloudConvert** (online): https://cloudconvert.com/

### Images
- **TinyPNG** (online): https://tinypng.com/
- **Squoosh** (online): https://squoosh.app/
- **SVGO** (SVG optimizer): https://github.com/svg/svgo

### Icons
- **ImageOptim** (Mac): https://imageoptim.com/
- **Squoosh** (online): https://squoosh.app/

## Notes

- All assets in `public/` are copied to `dist/` during build
- Vite automatically handles asset optimization (limited)
- Manual optimization before build is recommended
- Test all assets after optimization to ensure quality is acceptable
- Keep backup of original assets before optimization
