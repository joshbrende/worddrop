# Complete File Structure

## Root Directory Structure

```
words/
├── example/                    # Reference implementation
│   ├── src/                   # Source code
│   ├── public/                # Public assets
│   ├── dist/                  # Build output
│   ├── node_modules/          # Dependencies
│   ├── package.json           # Dependencies and scripts
│   ├── vite.config.ts         # Vite configuration
│   ├── tsconfig.json          # TypeScript configuration
│   └── index.html             # Entry HTML
├── docs/                      # This documentation
└── Assets/                    # Shared assets folder
```

## Source Directory (`src/`)

### Core Application Files
```
src/
├── main.tsx                   # Application entry point
├── App.tsx                    # Main app component with routing
├── App.css                    # Global app styles
├── index.css                  # Base styles
└── vite-env.d.ts             # Vite type definitions
```

### Components (`src/components/`)

**Game Components:**
- `GameBoard.tsx` - Main game component (2957 lines - core game logic)
- `Game.tsx` - Game wrapper component
- `GameControls.tsx` - Input controls (keyboard/touch)
- `GameOverMenu.tsx` - Game over screen
- `PowerUps.tsx` - Power-up UI and logic
- `BombTile.tsx` - Bomb power-up tile
- `ScorePopup.tsx` - Animated score popups
- `ScoreAchievement.tsx` - Achievement display
- `LevelUpAnimation.tsx` - Level up celebration
- `WordOfDayAnimation.tsx` - Word of day celebration
- `SponsorWordAnimation.tsx` - Sponsor word celebration
- `WordMilestoneAnimation.tsx` - Word count milestone

**UI Components:**
- `LoadingScreen.tsx` - Initial loading screen
- `SplashScreen.tsx` - Splash screen
- `BreadcrumbsMenu.tsx` - Main navigation menu
- `NavMenu.tsx` - Navigation menu
- `Settings.tsx` - Settings page
- `Profile.tsx` - User profile page
- `Leaderboard.tsx` - Leaderboard display
- `HowToPlay.tsx` - Instructions page
- `AboutWordDrop.tsx` - About page
- `PrivacyPolicy.tsx` - Privacy policy
- `Features.tsx` - Feature showcase
- `Hero.tsx` - Hero section
- `Achievements.tsx` - Achievements display
- `AchievementBadge.tsx` - Achievement badge component
- `AchievementsDisplay.tsx` - Achievement list
- `StatsBoard.tsx` - Statistics display
- `UserProfile.tsx` - User profile component
- `SimplifiedUserProfile.tsx` - Simplified profile view
- `BreadcrumbProfile.tsx` - Profile in breadcrumbs

**Menu Components (`src/components/menu/`):**
- `StartMenu.tsx` - Game start menu
- `PauseMenu.tsx` - Pause menu

**Admin Components (`src/components/admin/`):**
- `AdminDashboard.tsx` - Admin dashboard
- `AdminPanel.tsx` - Admin panel
- Various admin-specific components

**Layout Components (`src/components/layout/`):**
- `Layout.tsx` - Main layout wrapper

**Shared Components (`src/components/shared/`):**
- Shared reusable components

**Debug Components (`src/components/debug/`):**
- `SupabaseDebug.tsx` - Supabase debugging
- `ProfileFixer.tsx` - Profile fix utility
- `DatabaseStatus.tsx` - Database status

**Auth Components (`src/components/auth/`):**
- Authentication-related components

**Avatar Components (`src/components/avatars/`):**
- Avatar display components

**Animation Components:**
- `RobotAnimation.tsx` - Robot animation
- `RobotGuide.tsx` - Robot guide animation
- `FallingBackground.tsx` - Animated background
- `GemRenderer.tsx` - Gem rendering

**Other UI:**
- `ErrorBoundary.tsx` - Error boundary component
- `PageNotFound.tsx` - 404 page
- `NotificationTest.tsx` - Notification testing
- `OfflineIndicator.tsx` - Offline status indicator
- `PWAPrompt.tsx` - PWA installation prompt
- `LevelSystem.tsx` - Level system display
- `GameSettings.tsx` - Game settings
- `SponsorQuestion.tsx` - Sponsor trivia question
- `SponsorTrivia.tsx` - Sponsor trivia modal
- `SimpleLeaderboard.tsx` - Simplified leaderboard
- `BombLogic.ts` - Bomb explosion logic

### Pages (`src/pages/`)

- `WordOfTheDay.tsx` - Word of the day page
- `SponsorChallenge.tsx` - Sponsor challenge page
- `HowToPlay.tsx` - How to play page
- `About.tsx` - About page
- `privacy-policy.tsx` - Privacy policy page
- `terms-of-service.tsx` - Terms of service page
- `SignIn.tsx` - Sign in page
- `EmailConfirmed.tsx` - Email confirmation page
- `SupabaseTestPage.tsx` - Supabase test page
- Admin pages (`src/pages/admin/`):
  - `Login.tsx` - Admin login
  - `WordOfTheDay.tsx` - Admin word of day management
  - `SponsorTrivia.tsx` - Admin sponsor trivia management

### Services (`src/services/`)

- `DictionaryService.ts` - Word dictionary and validation
- `SoundService.ts` - Audio playback (effects + music)
- `AnalyticsService.ts` - Analytics tracking
- `LeaderboardService.ts` - Leaderboard operations
- `UserService.ts` - User profile operations
- `UserProfileService.ts` - User profile management
- `AchievementService.ts` - Achievement tracking
- `NotificationService.ts` - Push notifications
- `DatabaseService.ts` - Database operations
- `CacheService.ts` - Caching utilities
- `WordService.ts` - Word-related operations
- `sponsorTrivia.ts` - Sponsor trivia service
- `sounds/` - Sound effect files (MP3)

### Hooks (`src/hooks/`)

- `useGameState.ts` - Game state management hook
- `useGameState.tsx` - Alternative game state hook
- `useGameScoring.ts` - Scoring calculations
- `useGameControls.ts` - Input controls hook
- `useGameControls.tsx` - Alternative controls hook
- `useGameEffects.ts` - Game effects hook
- `useGameEffects.tsx` - Alternative effects hook
- `useGameAnimations.tsx` - Animation management
- `useSponsorTrivia.ts` - Sponsor trivia hook
- `useAuth.ts` - Authentication hook

### Context (`src/context/` and `src/contexts/`)

- `AuthContext.tsx` - Authentication state
- `SettingsContext.tsx` - Game settings (sound, music, vibration)
- `DisplayContext.tsx` - Display preferences
- `ThemeContext.tsx` - Theme management
- `AnimationContext.tsx` - Animation state
- `UserContext.tsx` - User state

### Utils (`src/utils/`)

- `board.ts` - Board utilities (createEmptyBoard, etc.)
- `gameRules.ts` - Game rules and constants
- `scoring.ts` - Scoring calculations
- `letterGeneration.ts` - Letter generation logic
- `wordOfTheDay.ts` - Word of day utilities
- `sponsorQuestions.ts` - Sponsor question data
- `sponsorWords.ts` - Sponsor word utilities
- `colors.ts` - Color utilities
- `encoding.ts` - Encoding utilities
- `gameOver.ts` - Game over logic
- `db-setup.js` - Database setup script
- `dbCheck.ts` - Database check utility

### Constants (`src/constants/`)

- `game.ts` - Game constants (BOARD_WIDTH, BOARD_HEIGHT, SCORING_CONFIG, etc.)
- `sounds.ts` - Sound effect definitions
- `avatars.ts` - Avatar definitions

### Types (`src/types/`)

- `game.ts` - Game-related types (Cell, Position, GameState, etc.)
- `database.ts` - Database types
- `UserProfile.ts` - User profile types
- `trivia.ts` - Trivia types
- `animations.ts` - Animation types
- `notifications.ts` - Notification types
- `supabase.ts` - Supabase types
- `supabase.d.ts` - Supabase declarations
- `supabase.generated.types.ts` - Auto-generated Supabase types

### Styles (`src/styles/`)

- `global.css` - Global styles
- `GameBoard.css` - Game board styles
- Various component-specific CSS files

### Configuration (`src/lib/`, `src/config/`)

- `supabase.ts` - Supabase client setup
- `supabaseClient.ts` - Supabase client instance
- `supabaseTypes.ts` - Supabase type helpers
- `adminQueries.ts` - Admin database queries

### Other Directories

- `data/` - Static data files
  - `sponsorQuestions.ts` - Sponsor question data
  - `wordoftheday.ts` - Word of day data
- `migrations/` - Database migrations
- `scripts/` - Utility scripts
- `test/` - Test files
- `testing/` - Testing utilities
- `theme/` - Theme configuration
- `assets/` - Source assets (animations, etc.)

## Public Directory (`public/`)

```
public/
├── dictionary.csv             # Word dictionary (large file)
├── config.js                  # Configuration file
├── manifest.json              # PWA manifest
├── offline.html               # Offline fallback page
├── favicon.svg                # Favicon
├── sounds/                    # Sound effects (12 MP3 files)
│   ├── move.mp3
│   ├── word.mp3
│   ├── combo.mp3
│   ├── level-up.mp3
│   ├── game-over.mp3
│   ├── drop.mp3
│   ├── music.mp3
│   ├── bomb.mp3
│   ├── lightning.mp3
│   ├── wind.mp3
│   ├── click.mp3
│   └── loop-menu.mp3
├── icons/                     # App icons
│   ├── android/               # Android icons (various sizes)
│   ├── ios/                   # iOS icons (various sizes)
│   └── *.svg                  # Social media icons
└── images/                    # Image assets
    ├── avatars/               # Avatar SVGs (8 files)
    ├── power-ups/             # Power-up icons (5 SVG files)
    └── *.png, *.svg           # Logos and other images
```

## Configuration Files

### Root Level
- `package.json` - Dependencies and scripts
- `package-lock.json` - Locked dependencies
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `tsconfig.app.json` - App-specific TypeScript config
- `tsconfig.node.json` - Node-specific TypeScript config
- `eslint.config.js` - ESLint configuration
- `tailwind.config.ts` - Tailwind CSS configuration (if used)
- `vercel.json` - Vercel deployment config
- `index.html` - HTML entry point

### Backend/Server (`backend/`)
- Node.js backend for API endpoints
- TypeScript source files
- Configuration files

### Database (`supabase/`)
- SQL migration files
- Database schema definitions
- Supabase configuration

## Key File Sizes (Important for CrazyGames)

### Large Files to Optimize:
- `dictionary.csv` - Word dictionary (likely several MB)
- Sound files in `public/sounds/` - 12 MP3 files
- Image assets in `public/images/`
- Icon files (multiple sizes)

### Build Output:
- `dist/` - Built files (should be <50MB initial, <20MB for mobile)

## File Count Considerations

Current structure has:
- ~247 source files (ts/tsx/css)
- ~76 public files (images, sounds, icons)
- Total: ~323 files (well under 1500 limit)

However, build output may have more files due to:
- Code splitting
- Asset optimization
- Source maps (in dev)

## Notes for CrazyGames Adaptation

1. **Remove Unnecessary Files:**
   - Admin components and routes
   - Debug components and routes
   - Supabase-specific files (or make optional)
   - Backend directory (not needed for static hosting)

2. **Optimize Assets:**
   - Compress dictionary.csv or use a smaller version
   - Optimize sound files (lower bitrate, shorter loops)
   - Optimize images (WebP format, smaller sizes)
   - Remove unused icons (keep only essential sizes)

3. **Bundle Optimization:**
   - Code splitting to reduce initial bundle
   - Lazy load non-critical components
   - Tree shaking unused code
   - Remove unused dependencies
