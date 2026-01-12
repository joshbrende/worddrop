# Quick Start Guide

## Documentation Overview

This documentation repository contains everything needed to rebuild WordDROP optimized for CrazyGames.

## Essential Documents

1. **[00-INDEX.md](./00-INDEX.md)** - Start here for overview
2. **[10-CRAZYGAMES-PLAN.md](./10-CRAZYGAMES-PLAN.md)** - Step-by-step implementation plan
3. **[03-GAME-MECHANICS.md](./03-GAME-MECHANICS.md)** - How the game actually works
4. **[02-FILE-STRUCTURE.md](./02-FILE-STRUCTURE.md)** - Complete file structure

## Quick Reference

### Game Type
Falling-block word puzzle game (like Tetris + Scrabble)

### Core Mechanics
- Letters (A-Z) fall one at a time
- Player moves/drops letters to form words
- Words can be horizontal or vertical (3+ letters)
- Words are cleared, gravity applies, score increases
- Power-ups available (Bomb, Lightning, Freeze, Wind, Blank)
- Trivia system (Word of Day, Sponsor Trivia)
- Progressive difficulty (faster falling, higher scores)

### Tech Stack
- React 18 + TypeScript
- Vite 6 (build tool)
- CSS Modules + Emotion (styling)
- Material-UI (optional, can be removed)
- No backend required (can use localStorage only)

### Key Files to Understand

**Game Core:**
- `src/components/GameBoard.tsx` - Main game component (2957 lines)
- `src/services/DictionaryService.ts` - Word validation
- `src/services/SoundService.ts` - Audio playback
- `src/utils/gameRules.ts` - Game rules and scoring
- `src/constants/game.ts` - Game constants

**Game Flow:**
1. Game initializes → Dictionary loads
2. First letter spawns → `gameplayStart` event (for CrazyGames)
3. Letter falls → User moves/drops
4. Letter lands → Word detection
5. Words found → Scoring + animations
6. Gravity applies → New letter spawns
7. Repeat until game over

### Critical Points for CrazyGames

1. **Gameplay Start Event**: Trigger when first letter starts falling (not on component mount)
2. **Initial Download Size**: Must be < 20MB for mobile homepage eligibility
3. **All Paths Relative**: No absolute URLs
4. **Mobile CSS**: Add user-select: none to body
5. **Sitelock**: Whitelist CrazyGames domains
6. **Make Supabase Optional**: Use localStorage fallback

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Check bundle size
npm run build
du -sh dist/
```

### Estimated Sizes (After Optimization)

- **Initial Download**: ~4MB (target < 20MB) ✅
- **Total Build**: ~12MB (target < 250MB) ✅
- **File Count**: ~300 files (target < 1500) ✅

### Implementation Priority

**Must Have (Critical):**
1. SDK integration (`gameplayStart` event)
2. Relative paths only
3. Initial bundle < 20MB
4. Mobile CSS fixes

**Should Have:**
1. Asset optimization
2. Sitelock implementation
3. Privacy notice

**Nice to Have:**
1. Full SDK features (Data, User modules)
2. Advanced optimizations
3. Additional features

## Next Steps

1. Read [10-CRAZYGAMES-PLAN.md](./10-CRAZYGAMES-PLAN.md) for detailed implementation
2. Create new project directory: `C:\wamp64\www\words\crazygames-build\`
3. Follow the step-by-step plan
4. Test on target browsers/devices
5. Submit to CrazyGames

## Getting Help

Refer to specific documentation files:
- Game mechanics → `03-GAME-MECHANICS.md`
- File structure → `02-FILE-STRUCTURE.md`
- Architecture → `01-GAME-ARCHITECTURE.md`
- Implementation plan → `10-CRAZYGAMES-PLAN.md`
