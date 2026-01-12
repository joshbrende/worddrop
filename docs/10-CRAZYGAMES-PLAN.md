# CrazyGames Adaptation Plan

This document outlines the step-by-step plan for adapting WordDROP to meet CrazyGames technical requirements.

Reference: [CrazyGames Technical Requirements](https://docs.crazygames.com/requirements/technical/)

## Requirements Summary

### File Size & Count Limits
- ✅ Maximum total file size: **250MB**
- ✅ Initial download size: **≤ 50MB** (≤ 20MB for mobile homepage eligibility)
- ✅ File count limit: **≤ 1500 files**
- ✅ **Only relative paths** (no absolute paths)

### Device & Browser Compatibility
- ✅ Works on Chrome and Edge
- ✅ Safari compatibility expected
- ✅ Chromebook support (4GB RAM)
- ✅ Mouse, keyboard, and touch support
- ✅ Landscape mode on desktop
- ✅ Mobile CSS fixes (prevent text selection, magnification)

### SDK Integration
- **Basic**: `Gameplay start` event when player reaches playable state
- **Full** (optional): Gameplay start/stop, Data module, User module, Load events

### Other Requirements
- Sitelock/Whitelisting for CrazyGames domains
- User Consent (privacy policy) if collecting data

## Step-by-Step Implementation Plan

### Phase 1: Setup and Configuration

#### Step 1.1: Create New Project Structure
```bash
# Create new directory for CrazyGames version
C:\wamp64\www\words\crazygames-build\
```

**Action Items:**
- Copy essential files from `example/`
- Remove unnecessary features (admin, debug, auth-dependent features)
- Set up new `package.json` with minimal dependencies
- Configure Vite for production build

#### Step 1.2: Install CrazyGames SDK
```bash
npm install @crazygames/crazy-sdk
```

Or use CDN script tag in `index.html`:
```html
<script src="https://sdk.crazygames.com/crazygames-sdk-v2.js"></script>
```

**Reference**: [CrazyGames SDK Docs](https://docs.crazygames.com/sdk/)

#### Step 1.3: Update Build Configuration

**File**: `vite.config.ts`

**Changes Needed:**
1. Ensure `base: '/'` for relative paths
2. Configure build optimization:
   ```typescript
   build: {
     outDir: 'dist',
     assetsInlineLimit: 4096, // Inline small assets
     chunkSizeWarningLimit: 1000, // Warn if chunk > 1MB
     rollupOptions: {
       output: {
         manualChunks: {
           'vendor': ['react', 'react-dom'],
           'game-core': ['./src/components/GameBoard.tsx'],
           // Separate large chunks
         }
       }
     }
   }
   ```
3. Remove PWA plugin (not needed for CrazyGames)
4. Optimize bundle splitting

### Phase 2: Code Adaptations

#### Step 2.1: Create CrazyGames Service

**File**: `src/services/CrazyGamesService.ts`

```typescript
class CrazyGamesService {
  private sdk: any = null;
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    // Check if SDK is available (loaded via script tag or npm)
    if (window.CrazyGames) {
      this.sdk = window.CrazyGames.SDK;
      this.sdk.init();
      this.initialized = true;
    } else if (window.crazygames) {
      // Alternative SDK loading method
      this.sdk = window.crazygames;
      this.initialized = true;
    }
  }

  gameplayStart(): void {
    if (!this.initialized || !this.sdk) return;
    
    try {
      // Trigger gameplay start event
      // This is used to measure initial download size
      this.sdk.game.gameplayStart();
    } catch (error) {
      console.warn('CrazyGames SDK gameplayStart failed:', error);
    }
  }

  gameplayStop(): void {
    if (!this.initialized || !this.sdk) return;
    
    try {
      this.sdk.game.gameplayStop();
    } catch (error) {
      console.warn('CrazyGames SDK gameplayStop failed:', error);
    }
  }

  // Optional: Save game data
  saveData(data: any): void {
    if (!this.initialized || !this.sdk?.data) return;
    this.sdk.data.setItem('gameProgress', data);
  }

  // Optional: Load game data
  loadData(): any {
    if (!this.initialized || !this.sdk?.data) return null;
    return this.sdk.data.getItem('gameProgress');
  }
}

export default new CrazyGamesService();
```

#### Step 2.2: Integrate SDK into GameBoard

**File**: `src/components/GameBoard.tsx`

**Changes:**
1. Import CrazyGamesService:
   ```typescript
   import crazyGamesService from '../services/CrazyGamesService';
   ```

2. Initialize SDK in useEffect:
   ```typescript
   useEffect(() => {
     crazyGamesService.initialize();
   }, []);
   ```

3. Trigger `gameplayStart` when player actually starts playing:
   ```typescript
   // In the game initialization useEffect, after first letter spawns:
   useEffect(() => {
     if (gameState.isInitialized && gameState.currentLetter && !gameState.isGameOver) {
       // Player has reached playable state (first letter is falling)
       crazyGamesService.gameplayStart();
     }
   }, [gameState.isInitialized, gameState.currentLetter]);
   ```

4. Trigger `gameplayStop` on game over:
   ```typescript
   // In handleGameOver or game over detection:
   crazyGamesService.gameplayStop();
   ```

**Important**: `gameplayStart` should trigger when:
- Dictionary is loaded
- Game board is initialized
- First letter is spawned and falling
- **NOT** during loading screens or menus

#### Step 2.3: Make Supabase Optional

**Files**: All files using Supabase

**Strategy**: Create a feature flag and fallback mode

```typescript
// src/config/features.ts
export const FEATURES = {
  ENABLE_SUPABASE: import.meta.env.VITE_ENABLE_SUPABASE === 'true',
  ENABLE_LEADERBOARD: import.meta.env.VITE_ENABLE_LEADERBOARD === 'true',
  ENABLE_AUTH: import.meta.env.VITE_ENABLE_AUTH === 'true',
};
```

**Files to Modify:**
- `src/lib/supabase.ts` - Add conditional initialization
- `src/services/LeaderboardService.ts` - Use localStorage fallback
- `src/services/UserService.ts` - Use localStorage fallback
- `src/context/AuthContext.tsx` - Mock auth for CrazyGames

**Fallback Implementation:**
- Leaderboard: localStorage only (no online leaderboard)
- User Profiles: localStorage only
- Achievements: localStorage only
- High Scores: localStorage only

#### Step 2.4: Fix Absolute Paths

**Search for absolute paths:**
```bash
grep -r "http://\|https://\|//" src/ public/
```

**Common Issues:**
- API endpoints
- Asset URLs
- Supabase URLs
- External resources

**Fix**: Convert all to relative paths:
- `/sounds/music.mp3` ✅ (relative)
- `https://api.example.com/data` ❌ (absolute - remove or make configurable)
- `./assets/image.png` ✅ (relative)

#### Step 2.5: Add Mobile CSS Fixes

**File**: `src/styles/global.css` or `src/index.css`

**Add to body selector:**
```css
body {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  
  /* Prevent touch magnification */
  touch-action: manipulation;
  
  /* Prevent text selection highlighting */
  -webkit-tap-highlight-color: transparent;
}
```

#### Step 2.6: Implement Sitelock/Whitelisting

**File**: `src/utils/sitelock.ts`

```typescript
const ALLOWED_DOMAINS = [
  'crazygames.com',
  'www.crazygames.com',
  'localhost', // For development
  '127.0.0.1', // For local development
];

export function checkDomain(): boolean {
  if (typeof window === 'undefined') return true; // SSR
  
  const hostname = window.location.hostname;
  
  // Allow localhost for development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true;
  }
  
  // Check if hostname matches allowed domains
  const isAllowed = ALLOWED_DOMAINS.some(domain => 
    hostname === domain || hostname.endsWith('.' + domain)
  );
  
  if (!isAllowed) {
    console.error('Game is not authorized to run on this domain');
    // Optionally redirect or show error
    return false;
  }
  
  return true;
}

// Call on app initialization
checkDomain();
```

**Integration**: Call in `src/main.tsx` before rendering app

#### Step 2.7: Add Privacy Policy Notice

**File**: `src/components/PrivacyNotice.tsx`

```typescript
export function PrivacyNotice() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('privacy-notice-dismissed') === 'true';
  });

  if (dismissed) return null;

  return (
    <div className="privacy-notice">
      <p>
        This game collects gameplay data for analytics. 
        <a href="/privacy-policy" target="_blank">Privacy Policy</a>
      </p>
      <button onClick={() => {
        localStorage.setItem('privacy-notice-dismissed', 'true');
        setDismissed(true);
      }}>
        Dismiss
      </button>
    </div>
  );
}
```

**Integration**: Add to `App.tsx` (non-blocking, simple notice)

### Phase 3: Asset Optimization

#### Step 3.1: Optimize Dictionary

**Current**: `public/dictionary.csv` (likely several MB)

**Options:**
1. **Reduce Dictionary Size**:
   - Keep only common words (3-8 letters)
   - Remove rare/obscure words
   - Target: < 500KB

2. **Alternative**: Use a smaller word list embedded in code
   - `src/data/words.ts` - Array of common words
   - ~1000-2000 most common words
   - Size: < 50KB

3. **Lazy Load**: Load dictionary after gameplay starts (but measure before gameplayStart event)

**Recommendation**: Use embedded word list for initial build (< 50KB)

#### Step 3.2: Optimize Sound Files

**Current**: 12 MP3 files in `public/sounds/`

**Optimization:**
1. **Compress Audio**:
   - Reduce bitrate: 128kbps → 64kbps for music
   - Reduce bitrate: 96kbps → 48kbps for effects
   - Use MP3 or consider OGG Vorbis

2. **Trim Length**:
   - Music: Keep looping segment < 30 seconds
   - Effects: Keep < 2 seconds each

3. **Remove Unused**:
   - Remove `click.mp3`, `loop-menu.mp3` if not used

**Target**: Total audio size < 2MB

#### Step 3.3: Optimize Images

**Current**: Multiple PNG/SVG files

**Optimization:**
1. **Convert to WebP**: Smaller file size
2. **Optimize SVGs**: Remove unnecessary metadata
3. **Remove Unused**: Delete unused avatars, icons
4. **Icon Sizes**: Keep only essential sizes (192px, 512px)

**Target**: Total image size < 1MB

#### Step 3.4: Remove Unnecessary Assets

**Remove:**
- Admin panel assets
- Debug assets
- Unused avatars (keep 2-3)
- Unused power-up icons
- Large logo files (keep small versions)

### Phase 4: Code Cleanup

#### Step 4.1: Remove Unnecessary Features

**Remove/Disable:**
- Admin routes and components
- Debug routes and components
- Authentication system (for basic implementation)
- User profiles (use localStorage only)
- Online leaderboard (use localStorage only)
- Push notifications
- Vercel Analytics
- PWA features (Service Worker, manifest)

**Files to Remove:**
- `src/components/admin/` (entire directory)
- `src/components/debug/` (entire directory)
- `src/pages/admin/` (entire directory)
- `src/context/AuthContext.tsx` (or make mock)
- `src/services/NotificationService.ts`

#### Step 4.2: Simplify Routing

**New Routes** (minimal):
```typescript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/game" element={<GameBoard />} />
  <Route path="/how-to-play" element={<HowToPlay />} />
  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
</Routes>
```

#### Step 4.3: Remove Unused Dependencies

**Remove from package.json:**
- `@supabase/*` packages
- `@vercel/analytics`
- `vite-plugin-pwa`
- `workbox-*` packages
- Admin-related packages

**Keep Essential:**
- `react`, `react-dom`
- `react-router-dom`
- `vite`, `@vitejs/plugin-react`
- `typescript`
- Minimal UI library (or remove MUI, use CSS only)

### Phase 5: Build Optimization

#### Step 5.1: Configure Code Splitting

**Goal**: Initial bundle < 20MB (for mobile homepage eligibility)

**Strategy:**
1. **Lazy Load Routes**:
   ```typescript
   const GameBoard = lazy(() => import('./components/GameBoard'));
   ```

2. **Split Large Dependencies**:
   - Separate vendor chunks
   - Separate game logic from UI

3. **Tree Shaking**: Remove unused code
   - Configure Vite for tree shaking
   - Remove unused exports

#### Step 5.2: Optimize Bundle Size

**Tools:**
- `vite-bundle-visualizer` - Analyze bundle size
- Check for duplicate dependencies
- Remove source maps in production

**Target Breakdown:**
- Initial JS bundle: < 500KB (gzipped)
- CSS: < 100KB
- Assets (images, sounds): < 15MB
- **Total initial download: < 20MB**

#### Step 5.3: Test Build Size

```bash
npm run build
du -sh dist/
# Check file count
find dist/ -type f | wc -l
# Check largest files
find dist/ -type f -exec du -h {} + | sort -rh | head -20
```

### Phase 6: Testing

#### Step 6.1: Browser Testing

**Test on:**
- ✅ Chrome (Windows/Mac)
- ✅ Edge (Windows)
- ✅ Safari (Mac/iOS)
- ✅ Chrome on Chromebook (4GB RAM device)
- ✅ Mobile browsers (Chrome, Safari)

#### Step 6.2: Performance Testing

**Check:**
- Initial load time < 20 seconds
- Time to gameplay < 3 seconds after load
- Smooth gameplay (60 FPS)
- Memory usage < 200MB

#### Step 6.3: Functionality Testing

**Verify:**
- ✅ Gameplay start event triggers correctly
- ✅ All game mechanics work
- ✅ No absolute paths
- ✅ Mobile touch controls work
- ✅ Text selection disabled on mobile
- ✅ Sitelock works
- ✅ Privacy notice appears

### Phase 7: Final Checklist

#### Before Submission:

- [ ] Total file size < 250MB
- [ ] Initial download < 50MB (< 20MB for mobile)
- [ ] File count < 1500
- [ ] All paths are relative
- [ ] `gameplayStart` event triggers at correct time
- [ ] Works on Chrome and Edge
- [ ] Works on Safari
- [ ] Works on Chromebook (4GB RAM)
- [ ] Mouse, keyboard, touch controls work
- [ ] Landscape mode on desktop
- [ ] Mobile CSS fixes applied
- [ ] Sitelock implemented
- [ ] Privacy policy notice (if collecting data)
- [ ] No console errors
- [ ] Performance acceptable

## Estimated File Sizes After Optimization

**Initial Download (Target: < 20MB)**:
- JavaScript: ~500KB (gzipped)
- CSS: ~50KB (gzipped)
- Dictionary: ~50KB (embedded)
- Sounds: ~2MB (compressed)
- Images: ~500KB (optimized)
- Other assets: ~500KB
- **Total: ~4MB** ✅ (well under 20MB)

**Total Build Size (Target: < 250MB)**:
- All JavaScript: ~2MB
- All CSS: ~200KB
- All assets: ~10MB
- **Total: ~12MB** ✅ (well under 250MB)

## Implementation Order

1. **Setup** (Steps 1.1 - 1.3)
2. **SDK Integration** (Steps 2.1 - 2.2) - Critical
3. **Path Fixes** (Step 2.4) - Critical
4. **Mobile CSS** (Step 2.5) - Easy
5. **Sitelock** (Step 2.6) - Easy
6. **Asset Optimization** (Phase 3) - Time-consuming but important
7. **Code Cleanup** (Phase 4) - Reduces bundle size
8. **Build Optimization** (Phase 5) - Final polish
9. **Testing** (Phase 6) - Verify everything works
10. **Submission** (Phase 7) - Final checklist

## Timeline Estimate

- **Phase 1-2**: 2-3 hours (Setup + SDK)
- **Phase 3**: 3-4 hours (Asset optimization)
- **Phase 4**: 2-3 hours (Code cleanup)
- **Phase 5**: 1-2 hours (Build optimization)
- **Phase 6**: 2-3 hours (Testing)
- **Total: ~10-15 hours**

## Notes

- Start with basic implementation (gameplayStart event only)
- Can add full SDK features later (Data, User modules)
- Test on actual Chromebook if possible
- Keep backup of original `example/` folder
- Version control all changes
