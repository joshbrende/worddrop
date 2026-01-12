# Components Documentation

Complete guide to all React components, their structure, and relationships.

## Component Architecture Overview

### Two GameBoard Implementations

The project contains **TWO different GameBoard implementations**:

1. **Main Implementation** (`src/components/GameBoard.tsx`) - **ACTIVE**
   - Large monolithic component (~2957 lines)
   - Contains all game logic in one file
   - Currently used in `App.tsx` routes
   - **This is the working game**

2. **Alternative Modular Implementation** (`src/components/game/GameBoard.tsx`) - **NOT ACTIVE**
   - Modular component structure (~250 lines)
   - Split into separate sub-components
   - Used in `Game.tsx` wrapper (if that route is used)
   - Appears to be a refactoring attempt

## Main Implementation Components

### Core Game Component

#### GameBoard (`src/components/GameBoard.tsx`)

**Size**: 2957 lines (large monolithic component)

**Purpose**: Main game component containing all game logic

**Key Responsibilities**:
- Falling letter mechanics
- Word detection (horizontal + vertical)
- Scoring system
- Power-up effects
- Trivia system integration
- Gravity application
- Game state management
- Animations and effects

**State Management**:
- Uses `useState` for local game state
- Accesses context providers (Settings, Auth)
- Uses services (Dictionary, Sound, Analytics, Leaderboard)

**Key Functions**:
- `generateLetter()`: Creates new falling letters
- `processWords()`: Detects and validates words
- `applyGravity()`: Drops letters after word removal
- `handleWordFound()`: Processes found words and scoring
- `handleBombExplosion()`: Bomb power-up logic
- `checkForHorizontalWords()`: Horizontal word detection
- `checkForVerticalWords()`: Vertical word detection
- `checkGameOver()`: Game over condition checking

**Props**:
```typescript
interface GameBoardProps {
  width?: number;
  height?: number;
  level: number;
  onWordFound: (word: string) => Promise<void>;
  onGameOver: () => Promise<void>;
  onLevelUp: (newLevel: number) => void;
  onPause: () => void;
  onResume: () => void;
  isPaused: boolean;
}
```

**Child Components Used**:
- `GameOverMenu`
- `ScorePopup`
- `PauseMenu`
- `SponsorTrivia`
- `PowerUps`
- `GameControls`
- `WordOfDayAnimation`
- `SponsorWordAnimation`
- `WordMilestoneAnimation`
- `ScoreAchievement`
- `BombTile`
- `LoadingScreen`

**For CrazyGames**: Keep this implementation (it's the working one)

## Alternative Modular Implementation (`src/components/game/`)

### Structure Overview

This is a **modular refactoring** that splits the game into smaller components:

```
game/
├── GameBoard.tsx          - Main container (orchestrator)
├── GameBoardGrid.tsx      - Board grid display
├── GameLetters.tsx        - Letter rendering and dragging
├── GameHUD.tsx            - Score, level, combo display
├── GameControls.tsx       - Control buttons
├── GameMenus.tsx          - Pause/game over menus
├── GameEffects.tsx        - Visual effects
├── GameAnimations.tsx     - Animation coordinator
└── index.ts               - Exports
```

### Component Details

#### GameBoard (`src/components/game/GameBoard.tsx`)

**Size**: ~250 lines

**Purpose**: Modular game container component

**Architecture**:
- Uses hooks: `useGameState`, `useGameControls`, `useGameEffects`
- Uses context: `AnimationContext`
- Orchestrates sub-components

**Key Features**:
- Modular design (separated concerns)
- Uses Framer Motion for animations
- Handles letter dragging/rotating
- Animation coordination

**For CrazyGames**: Consider using this as reference for modularization, but the main implementation is more complete

#### GameBoardGrid (`src/components/game/GameBoardGrid.tsx`)

**Purpose**: Renders the game board grid

**Features**:
- Displays board cells
- Word detection (horizontal, vertical, **and diagonal**)
- Triggers `onWordFound` callback when words detected

**Key Difference**: This version checks for **diagonal words** (unlike main implementation)

**Word Detection**:
- Horizontal (left-to-right)
- Vertical (top-to-bottom)
- Diagonal (top-left to bottom-right)
- Diagonal (top-right to bottom-left)

**For CrazyGames**: Use main implementation's word detection (no diagonals)

#### GameLetters (`src/components/game/GameLetters.tsx`)

**Purpose**: Renders draggable letter tiles

**Features**:
- Letter dragging with pointer events
- Letter rotation (double-click)
- Visual feedback (selected, dragged states)
- Uses Framer Motion for animations

**Data Structure**:
- Uses `Letter` interface with `id`, `value`, `points`, `x`, `y`, `rotation`
- Different from main implementation's `Cell` structure

**For CrazyGames**: Main implementation uses falling letters, not draggable letters

#### GameHUD (`src/components/game/GameHUD.tsx`)

**Purpose**: Displays game information overlay

**Displays**:
- Score
- Level
- Combo count
- Remaining bombs

**For CrazyGames**: Simple component, can be used as reference

#### GameControls (`src/components/game/GameControls.tsx`)

**Purpose**: On-screen control buttons

**Buttons**:
- Left/Right/Down arrows
- Rotate button
- Fast drop button
- Power-up buttons (Bomb, Lightning, Freeze)

**For CrazyGames**: Main implementation handles controls via keyboard, but this UI component is useful for mobile

#### GameMenus (`src/components/game/GameMenus.tsx`)

**Purpose**: Modal menus (pause, game over, trivia)

**Menus**:
- Pause menu (Resume, Restart, Quit)
- Game Over menu (Score, Play Again, Quit)
- Trivia menu (Answer True/False)

**For CrazyGames**: Can be used as reference, but main implementation has more features

#### GameEffects (`src/components/game/GameEffects.tsx`)

**Purpose**: Renders visual effects at positions

**For CrazyGames**: Simple component, can be used

#### GameAnimations (`src/components/game/GameAnimations.tsx`)

**Purpose**: Coordinates and renders game animations

**Animations Managed**:
- Word of Day animation
- Sponsor Challenge animation
- Level Up animation
- Word Milestone animation

**Uses**: Framer Motion's `AnimatePresence`

**For CrazyGames**: Uses Framer Motion (adds bundle size), main implementation uses custom animations

## Other UI Components

### Game Wrapper Components

#### Game (`src/components/Game.tsx`)

**Purpose**: Wrapper component that uses the modular GameBoard

**Features**:
- Uses `GameBoard` from `./game/GameBoard`
- Handles game stats tracking
- Manages loading state
- User profile integration

**Note**: Not currently used in main routes (App.tsx uses GameBoard directly)

### Menu Components

#### BreadcrumbsMenu (`src/components/menu/BreadcrumbsMenu.tsx`)

**Purpose**: Main navigation menu

**Features**:
- Game start button
- Navigation links
- Profile display
- Responsive design

#### PauseMenu (`src/components/menu/PauseMenu.tsx`)

**Purpose**: Pause screen menu

**Options**:
- Resume
- Restart
- Quit
- Settings

#### StartMenu (`src/components/menu/StartMenu.tsx`)

**Purpose**: Game start screen

### Animation Components

#### WordOfDayAnimation (`src/components/WordOfDayAnimation.tsx`)

**Purpose**: Celebrates finding the Word of the Day

**Features**:
- Special animation
- Displays word and points
- Pauses game during animation

#### SponsorWordAnimation (`src/components/SponsorWordAnimation.tsx`)

**Purpose**: Celebrates finding sponsor words

**Features**:
- Sponsor branding
- Points display
- Challenge completion

#### LevelUpAnimation (`src/components/LevelUpAnimation.tsx`)

**Purpose**: Level up celebration

#### WordMilestoneAnimation (`src/components/WordMilestoneAnimation.tsx`)

**Purpose**: Milestone celebrations (50, 100, 150 words, etc.)

### Game UI Components

#### ScorePopup (`src/components/ScorePopup.tsx`)

**Purpose**: Animated score popups at word locations

**Features**:
- Fade in/out animation
- Float upward
- Shows score value
- Combo text display

#### PowerUps (`src/components/PowerUps.tsx`)

**Purpose**: Power-up button panel

**Features**:
- Bomb button
- Lightning button
- Freeze button
- Wind button
- Blank (letter choice) button
- Use count display
- Alphabet selector (for blank power-up)

#### GameControls (`src/components/GameControls.tsx`)

**Purpose**: Touch/keyboard input handler

**Features**:
- Keyboard event handling
- Touch event handling
- Movement controls
- Power-up shortcuts

**Note**: Different from `game/GameControls.tsx` (which is UI buttons)

#### BombTile (`src/components/BombTile.tsx`)

**Purpose**: Special bomb tile rendering

**Features**:
- Bomb emoji display
- Explosion animation trigger
- Special styling

### Overlay Components

#### GameOverMenu (`src/components/GameOverMenu.tsx`)

**Purpose**: Game over screen

**Features**:
- Final score display
- High scores list
- Play again button
- Leaderboard submission
- Share functionality

#### LoadingScreen (`src/components/LoadingScreen.tsx`)

**Purpose**: Initial loading screen

**Features**:
- Loading animation
- Progress indicator
- Customizable message

### Profile Components

#### Profile (`src/components/Profile.tsx`)

**Purpose**: User profile page

**Features**:
- User stats display
- Achievement badges
- Game history
- Settings link

#### UserProfile (`src/components/UserProfile.tsx`)

**Purpose**: Profile display component

#### SimplifiedUserProfile (`src/components/SimplifiedUserProfile.tsx`)

**Purpose**: Simplified profile view

### Leaderboard Components

#### Leaderboard (`src/components/sections/Leaderboard.tsx`)

**Purpose**: Global leaderboard display

**Features**:
- Top scores list
- User ranking
- Time-based filtering
- Pagination

#### SimpleLeaderboard (`src/components/SimpleLeaderboard.tsx`)

**Purpose**: Simplified leaderboard

### Achievement Components

#### Achievements (`src/components/Achievements.tsx`)

**Purpose**: Achievement display page

#### AchievementBadge (`src/components/AchievementBadge.tsx`)

**Purpose**: Individual achievement badge

#### AchievementsDisplay (`src/components/AchievementsDisplay.tsx`)

**Purpose**: Achievement list component

### Settings Components

#### Settings (`src/components/Settings.tsx`)

**Purpose**: Settings page

**Features**:
- Sound/music toggles
- Vibration toggle
- Theme selection
- Display preferences

#### GameSettings (`src/components/GameSettings.tsx`)

**Purpose**: In-game settings overlay

### Page Components

#### HowToPlay (`src/components/HowToPlay.tsx`)

**Purpose**: Game instructions page

#### AboutWordDrop (`src/components/AboutWordDrop.tsx`)

**Purpose**: About page

#### PrivacyPolicy (`src/components/PrivacyPolicy.tsx`)

**Purpose**: Privacy policy page

#### Features (`src/components/Features.tsx`)

**Purpose**: Feature showcase

#### Hero (`src/components/Hero.tsx`)

**Purpose**: Hero section on homepage

## Component Relationships

### Main Game Flow

```
App
  └── AppRoutes
      └── GameBoard (main implementation)
          ├── GameControls (input handler)
          ├── PowerUps (power-up UI)
          ├── PauseMenu (pause overlay)
          ├── SponsorTrivia (trivia modal)
          ├── GameOverMenu (game over screen)
          ├── ScorePopup (score animations)
          ├── WordOfDayAnimation (special animation)
          ├── SponsorWordAnimation (special animation)
          ├── WordMilestoneAnimation (milestone animation)
          └── ScoreAchievement (achievement display)
```

### Alternative Modular Flow

```
Game (wrapper)
  └── GameBoard (modular)
      ├── GameBoardGrid (board display)
      ├── GameLetters (letter rendering)
      ├── GameHUD (info overlay)
      ├── GameControls (UI buttons)
      ├── GameMenus (modals)
      ├── GameEffects (visual effects)
      └── GameAnimations (animation coordinator)
```

## Component Size Analysis

### Largest Components

1. **GameBoard.tsx** (main): 2957 lines - Contains all game logic
2. **Game.tsx**: ~254 lines - Game wrapper
3. **Profile.tsx**: Various sizes - User profile pages

### Smallest Components

- **GameHUD.tsx**: ~30 lines - Simple display
- **GameMenus.tsx**: ~49 lines - Simple modals
- **GameEffects.tsx**: ~22 lines - Simple effects

## Component Dependencies

### External Dependencies

**Framer Motion**:
- Used in: `game/GameBoard.tsx`, `game/GameLetters.tsx`, `game/GameAnimations.tsx`
- Purpose: Animations
- **For CrazyGames**: Consider removing to reduce bundle size

**Material-UI**:
- Used in: Multiple components (styled components, dialogs, buttons)
- Purpose: UI components
- **For CrazyGames**: Remove, use CSS instead

**Emotion**:
- Used in: Styled components
- Purpose: CSS-in-JS
- **For CrazyGames**: Remove if removing MUI

### Internal Dependencies

**Hooks**:
- `useGameState` - Game state management
- `useGameControls` - Input handling
- `useGameScoring` - Score calculations
- `useGameEffects` - Effect management
- `useSponsorTrivia` - Trivia logic
- `useAuth` - Authentication
- `useSettings` - Settings management

**Services**:
- `DictionaryService` - Word validation
- `SoundService` - Audio playback
- `AnalyticsService` - Analytics tracking
- `LeaderboardService` - Score submission
- `AchievementService` - Achievement tracking

**Context**:
- `AuthContext` - User authentication
- `SettingsContext` - Game settings
- `DisplayContext` - Theme/display
- `AnimationContext` - Animation state

## For CrazyGames Adaptation

### Keep (Essential)

- ✅ `GameBoard.tsx` (main implementation) - Core game
- ✅ `GameOverMenu.tsx` - Game over screen
- ✅ `ScorePopup.tsx` - Score animations
- ✅ `PowerUps.tsx` - Power-up UI
- ✅ `GameControls.tsx` - Input handling
- ✅ `LoadingScreen.tsx` - Loading state
- ✅ `HowToPlay.tsx` - Instructions
- ✅ `PrivacyPolicy.tsx` - Required for data collection

### Simplify/Modify

- ⚠️ `PauseMenu.tsx` - Simplify (remove some options)
- ⚠️ Animation components - Replace Framer Motion with CSS animations
- ⚠️ Profile components - Simplify (remove Supabase integration)

### Remove (Not Needed)

- ❌ `Profile.tsx` - Remove (or simplify to localStorage only)
- ❌ `Leaderboard.tsx` - Remove (or use localStorage only)
- ❌ Admin components - Remove entirely
- ❌ Debug components - Remove entirely
- ❌ Alternative `game/` directory - Not used, can remove as reference

### Reference for Modularization

The `game/` subdirectory provides a good example of:
- Component separation
- Modular architecture
- Clean interfaces

**Consider**: Using this structure as reference when refactoring, but keep the main implementation's logic (it's more complete).

## Component Communication Patterns

### Props Down, Events Up
- Parent passes data via props
- Child triggers events via callbacks

### Context for Shared State
- Settings, Auth, Display use context
- Accessible from any component

### Services for Side Effects
- Dictionary, Sound, Analytics accessed via services
- Singleton pattern

## Notes

- Main GameBoard is monolithic but functional
- Modular version is cleaner but less complete
- For CrazyGames, use main implementation (it's the working one)
- Can use modular structure as reference for future refactoring
- Most components are well-structured and can be adapted easily
