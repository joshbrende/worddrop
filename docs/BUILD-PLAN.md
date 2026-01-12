# WordDROP Game - Phase-by-Phase Build Plan

This document outlines the complete build plan for WordDROP, organized into clear, actionable phases.

## Current Status Assessment

### ✅ Already Implemented (Phase 1 - Foundation)
- **Project Structure**: Clean architecture with framework-agnostic core
- **Core Engine**: `GameEngine` class with basic falling letters
- **React Components**: `GameBoard`, `GameCell` components
- **Hooks**: `useGameState`, `useGameLoop`, `useKeyboard`
- **Types**: Complete TypeScript type definitions
- **Constants**: All game constants extracted and configured
- **Basic Mechanics**: Letter falling, movement, landing, game over detection

### 🚧 Partially Implemented
- **Gravity System**: Basic implementation exists, needs testing
- **Word Detection**: Placeholder in `WordDetector`, needs implementation
- **Scoring**: Constants defined, calculation logic needed

### ❌ Not Yet Implemented
- Word validation (dictionary service)
- Complete word detection algorithm
- Scoring system
- Power-ups system
- Visual polish (cyberpunk theme)
- Animations
- Sound system
- CrazyGames SDK integration
- Asset optimization

---

## Phase-by-Phase Implementation Plan

### Phase 1: Foundation ✅ **COMPLETE**

**Duration**: 3-5 days  
**Status**: ✅ Complete

**Completed:**
- [x] Project structure
- [x] Core game engine (framework-agnostic)
- [x] Basic falling letter mechanics
- [x] Movement controls (keyboard)
- [x] Collision detection
- [x] Game over detection
- [x] TypeScript strict mode
- [x] Basic React components

**Next**: Move to Phase 2

---

### Phase 2: Word Detection & Scoring System

**Duration**: 5-7 days  
**Status**: ✅ Complete (Core Features)  
**Priority**: HIGH

#### 2.1 Dictionary Service
- [x] Create `DictionaryService` to load and validate words
- [x] Load dictionary from CSV (convert to TypeScript array)
- [x] Implement word validation function
- [x] Add caching strategy (localStorage)
- [x] Handle edge cases (empty dictionary, network failure)

#### 2.2 Word Detection Algorithm
- [x] Implement horizontal word detection in `WordDetector.ts`
- [x] Implement vertical word detection
- [x] Handle overlapping words correctly
- [x] Optimize performance (O(n*m) algorithm) - targeted detection at landing position
- [x] Test edge cases (single letter, empty board, etc.)

#### 2.3 Scoring System
- [x] Implement `calculateWordScore` function
- [x] Calculate base points by word length
- [x] Calculate letter scores (Scrabble-like)
- [x] Implement combo multiplier system
- [x] Implement vertical bonus (1.5x)
- [x] Implement level bonus
- [ ] Handle special words (Word of Day, Sponsor) - Ready for Phase 3
- [x] Handle intersection scoring (double letter score) - Support in scoring.ts

#### 2.4 Integration with GameEngine
- [x] Connect word detection to landing logic
- [x] Process words after letter lands
- [x] Clear detected words from board
- [x] Update score in game state
- [x] Apply gravity after word removal
- [x] Handle cascading words (words formed by gravity)
- [x] Update combo counter

#### 2.5 Visual Feedback
- [x] Mark cells for removal (`isRemoving: true`)
- [x] Show word removal animation (CSS fade)
- [x] Display score popups at word location (centered on grid)
- [x] Show combo indicator (persistent in game-info + in score popup)
- [x] Animate score updates

**Code Quality Requirements:**
- [ ] Unit tests for word detection (> 90% coverage) - Deferred to Phase 8 (Testing)
- [ ] Unit tests for scoring calculations - Deferred to Phase 8 (Testing)
- [ ] Integration tests for word processing flow - Deferred to Phase 8 (Testing)
- [x] Performance: Word detection < 16ms (60 FPS) - Targeted detection optimized

**Deliverables:**
- ✅ Working word detection (horizontal + vertical) - Targeted detection optimized
- ✅ Complete scoring system with all multipliers (combo, vertical, level, special)
- ✅ Visual feedback for word removal (CSS fade animation - cells remain visible)
- ✅ Cascading word support (gravity creates new words automatically)
- ✅ Score popups with gold stars (3-5 stars based on word length)
- ✅ Persistent combo indicator in game-info UI
- ✅ Level progression and drop speed scaling

**Phase 2 Status:** ✅ **CORE FEATURES COMPLETE** (Testing deferred to Phase 8)

---

### Phase 3: Power-Ups System

**Duration**: 4-6 days  
**Status**: ❌ Not Started  
**Priority**: MEDIUM

#### 3.1 Power-Up System Architecture
- [ ] Create `PowerUpSystem` class
- [ ] Define power-up types (bomb, lightning, freeze, wind, blank)
- [ ] Implement power-up usage tracking
- [ ] Create power-up effect handlers

#### 3.2 Individual Power-Ups
- [ ] **Bomb**: Cross pattern removal (2 left, center, 2 right, 2 down)
- [ ] **Lightning**: Column clearing
- [ ] **Freeze**: Temporary slow-down effect (5 seconds)
- [ ] **Wind**: Bottom row clearing
- [ ] **Blank**: Letter selection modal

#### 3.3 Power-Up UI
- [ ] Create power-up button components
- [ ] Display power-up usage count
- [ ] Visual feedback for power-up activation
- [ ] Disable buttons when no uses remaining

#### 3.4 Power-Up Effects & Animations
- [ ] Bomb explosion animation
- [ ] Lightning strike animation
- [ ] Freeze overlay effect
- [ ] Wind sweep animation
- [ ] Sound effects for each power-up

**Deliverables:**
- ✅ All 5 power-ups working correctly
- ✅ Power-up UI components
- ✅ Visual effects for each power-up
- ✅ Balanced power-up mechanics

---

### Phase 4: Visual Polish & Cyberpunk Theme

**Duration**: 5-7 days  
**Status**: ❌ Not Started  
**Priority**: HIGH

#### 4.1 Cyberpunk Theme Implementation
- [ ] Create cyberpunk color palette
  - Background: `#0a0e27`, `#0d1117`
  - Neon: `#00d9ff` (cyan), `#ff006e` (pink), `#b300ff` (purple)
  - Text: `#00d9ff` (primary), `#ffffff` (secondary)
- [ ] Implement neon glow effects (CSS box-shadow)
- [ ] Add cyberpunk typography (Orbitron, Rajdhani, Exo 2)
- [ ] Create responsive font sizing (clamp())

#### 4.2 Game Board Styling
- [ ] Style game cells with cyberpunk look
- [ ] Add grid lines with neon glow
- [ ] Style falling letters
- [ ] Add hover/active states
- [ ] Responsive sizing (clamp() for all sizes)

#### 4.3 UI Components Styling
- [ ] Style score display (neon glow)
- [ ] Style level indicator
- [ ] Style game over overlay
- [ ] Style pause menu
- [ ] Style power-up buttons
- [ ] Style control buttons

#### 4.4 Animations (CSS-first approach)
- [ ] Letter falling animation (smooth)
- [ ] Word removal animation (fade out + scale)
- [ ] Score popup animation (float up + fade)
- [ ] Level up animation (celebration)
- [ ] Power-up activation animations
- [ ] Combo indicator animation

#### 4.5 Responsive Design
- [ ] Test at all CrazyGames iframe sizes
  - 907x510 (standard)
  - 1920x1080 (fullscreen)
  - 800x450 (mobile)
- [ ] Ensure text readable at all sizes
- [ ] Ensure controls usable at all sizes
- [ ] Mobile CSS fixes (prevent text selection, zoom)

**Deliverables:**
- ✅ Complete cyberpunk visual design
- ✅ Responsive layout (all sizes)
- ✅ Smooth animations (60 FPS)
- ✅ Professional polish

---

### Phase 5: Audio System

**Duration**: 2-3 days  
**Status**: ❌ Not Started  
**Priority**: MEDIUM

#### 5.1 Sound Service
- [ ] Create `SoundService` class
- [ ] Load sound effects (MP3)
- [ ] Load background music
- [ ] Implement volume controls
- [ ] Handle browser autoplay restrictions

#### 5.2 Sound Effects Integration
- [ ] Movement sound (move.mp3)
- [ ] Word completion sound (word.mp3)
- [ ] Combo sound (combo.mp3)
- [ ] Level up sound (level-up.mp3)
- [ ] Game over sound (game-over.mp3)
- [ ] Drop sound (drop.mp3)
- [ ] Power-up sounds (bomb, lightning, wind, freeze)

#### 5.3 Background Music
- [ ] Loop background music
- [ ] Pause on game over
- [ ] Respect user settings (mute toggle)

#### 5.4 Audio Settings UI
- [ ] Music toggle button
- [ ] Sound effects toggle button
- [ ] Volume slider (music)
- [ ] Volume slider (effects)

**Deliverables:**
- ✅ Complete audio system
- ✅ All sound effects integrated
- ✅ Settings UI for audio control

---

### Phase 6: CrazyGames Integration

**Duration**: 3-4 days  
**Status**: ❌ Not Started  
**Priority**: HIGH (Required)

#### 6.1 CrazyGames SDK Setup
- [ ] Install/load CrazyGames SDK
- [ ] Create `CrazyGamesService` class
- [ ] Initialize SDK on app mount
- [ ] Handle SDK errors gracefully

#### 6.2 SDK Integration Points
- [ ] Trigger `gameplayStart()` when:
  - Dictionary is loaded
  - Game board initialized
  - First letter is falling
  - **NOT** during loading/menus
- [ ] Trigger `gameplayStop()` on game over
- [ ] Optional: Implement Data module (save/load progress)
- [ ] Optional: Implement User module (player name)

#### 6.3 Path & Configuration Fixes
- [ ] Ensure all paths are relative (`base: '/'` in Vite)
- [ ] Test all asset loading (images, sounds, fonts)
- [ ] Remove absolute URLs

#### 6.4 Sitelock/Whitelisting
- [ ] Implement domain whitelisting for CrazyGames
- [ ] Test on CrazyGames domains
- [ ] Handle unauthorized domain access

**Deliverables:**
- ✅ CrazyGames SDK fully integrated
- ✅ `gameplayStart()` triggers correctly
- ✅ All paths relative
- ✅ Sitelock implemented

---

### Phase 7: Optimization & Bundle Size

**Duration**: 3-4 days  
**Status**: ❌ Not Started  
**Priority**: HIGH (Required)

#### 7.1 Asset Optimization
- [ ] **Sounds**: Compress MP3s to 48-64kbps
  - Target: < 2MB total
  - Trim silence from start/end
  - Keep music loops to 15-30 seconds
- [ ] **Images**: Convert to WebP where possible
  - Optimize SVGs (remove metadata)
  - Use appropriate sizes (not oversized)
  - Target: < 500KB total
- [ ] **Dictionary**: Reduce to 2000-5000 common words
  - Convert CSV to TypeScript array
  - Target: < 100KB
- [ ] **Lottie**: Keep only essential animations
  - Optimize JSON files
  - Consider CSS animations instead
  - Target: < 200KB total

#### 7.2 Bundle Optimization
- [ ] Configure Vite code splitting
  - Vendor chunk (React, React DOM)
  - Game core chunk
  - Power-ups chunk
- [ ] Enable minification (Terser)
- [ ] Tree-shake unused code
- [ ] Inline small assets (< 4KB)

#### 7.3 Performance Optimization
- [ ] Use `React.memo` for expensive components
- [ ] Use `useMemo` for expensive calculations
- [ ] Use `useCallback` for event handlers
- [ ] Debounce/throttle frequent updates
- [ ] Optimize re-renders (batch state updates)

#### 7.4 Bundle Size Verification
- [ ] Build production bundle
- [ ] Check initial download size (target: < 20MB)
- [ ] Check total assets size (target: < 250MB)
- [ ] Check file count (target: < 1500)
- [ ] Use bundle analyzer if needed

**Deliverables:**
- ✅ Optimized assets
- ✅ Bundle size < 20MB initial download
- ✅ Total assets < 250MB
- ✅ File count < 1500

---

### Phase 8: Testing & QA

**Duration**: 3-5 days  
**Status**: ❌ Not Started  
**Priority**: HIGH

#### 8.1 Unit Testing
- [ ] Core game logic tests (> 90% coverage)
  - Word detection tests
  - Scoring calculation tests
  - Gravity system tests
  - Collision detection tests
- [ ] Power-up system tests
- [ ] Utility function tests

#### 8.2 Integration Testing
- [ ] Game flow tests (complete game loop)
- [ ] Word processing flow tests
- [ ] Power-up activation tests
- [ ] Scoring integration tests

#### 8.3 Performance Testing
- [ ] FPS monitoring (target: 60 FPS)
- [ ] Memory leak testing (10+ minute session)
- [ ] Bundle size verification
- [ ] Load time measurement

#### 8.4 Compatibility Testing
- [ ] Chrome (latest)
- [ ] Edge (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (Chrome, Safari)
- [ ] Different screen sizes (907x510, 1920x1080, 800x450)

#### 8.5 Gameplay Testing
- [ ] Test all game mechanics
- [ ] Test all power-ups
- [ ] Test edge cases
- [ ] Test difficulty progression
- [ ] Balance testing (scoring, speed)

**Deliverables:**
- ✅ Comprehensive test suite
- ✅ > 90% code coverage
- ✅ All tests passing
- ✅ Performance validated (60 FPS)
- ✅ Compatibility verified

---

### Phase 9: Final Polish & Submission

**Duration**: 2-3 days  
**Status**: ❌ Not Started  
**Priority**: MEDIUM

#### 9.1 Final Polish
- [ ] Visual polish pass (animations, effects)
- [ ] Audio polish (volume balance, mixing)
- [ ] UI polish (spacing, alignment)
- [ ] Performance polish (final optimizations)

#### 9.2 Documentation
- [ ] Update README.md
- [ ] Create CHANGELOG.md
- [ ] Document API/services
- [ ] Add code comments where needed

#### 9.3 Submission Preparation
- [ ] Create game cover image (required dimensions)
- [ ] Write game description
- [ ] Prepare screenshots (minimum 4)
- [ ] Create video trailer (optional)
- [ ] Set tags/categories
- [ ] Confirm age rating (PEGI 12)

#### 9.4 Final Checklist
- [ ] All requirements met (bundle size, paths, SDK)
- [ ] No console errors
- [ ] No ESLint warnings
- [ ] All tests passing
- [ ] Performance validated
- [ ] Ready for submission

**Deliverables:**
- ✅ Polished game
- ✅ Complete documentation
- ✅ Submission materials ready
- ✅ Ready for CrazyGames submission

---

## Implementation Order

### Recommended Sequence:

1. **Phase 2** (Word Detection & Scoring) - **START HERE**
   - This is the core game mechanic
   - Needed for playable game
   - Foundation for everything else

2. **Phase 6** (CrazyGames Integration) - **EARLY**
   - Required for submission
   - Easier to integrate early
   - Test throughout development

3. **Phase 4** (Visual Polish) - **PARALLEL WITH PHASE 2**
   - Can work on styling while implementing mechanics
   - Improves development experience

4. **Phase 5** (Audio) - **AFTER PHASE 2**
   - Nice to have, not critical
   - Can be added incrementally

5. **Phase 3** (Power-Ups) - **AFTER PHASE 2**
   - Builds on core mechanics
   - Enhances gameplay

6. **Phase 7** (Optimization) - **BEFORE PHASE 8**
   - Must be done before final testing
   - Ensures requirements are met

7. **Phase 8** (Testing) - **BEFORE PHASE 9**
   - Final validation
   - Bug fixing

8. **Phase 9** (Polish & Submission) - **FINAL**
   - Final touches
   - Submission preparation

---

## Next Steps

**Immediate Action Items:**

1. **Start Phase 2**: Word Detection & Scoring
   - Begin with DictionaryService
   - Then implement WordDetector algorithm
   - Finally, integrate scoring system

2. **Set up testing**: Configure Vitest for Phase 2 tests

3. **Create task tracking**: Use this document or issue tracker

---

## Success Criteria

### Phase 2 Success:
- ✅ Words are detected correctly (horizontal + vertical)
- ✅ Words are validated against dictionary
- ✅ Scoring calculates correctly with all multipliers
- ✅ Words are removed from board
- ✅ Gravity works after word removal
- ✅ Cascading words are detected and scored
- ✅ Visual feedback works (animations, score popups)

### Overall Project Success:
- ✅ Game is fully playable
- ✅ All CrazyGames requirements met
- ✅ Bundle size < 20MB
- ✅ 60 FPS performance
- ✅ Professional polish
- ✅ Ready for submission

---

**Last Updated**: Based on current codebase state and documentation review
**Next Review**: After Phase 2 completion
