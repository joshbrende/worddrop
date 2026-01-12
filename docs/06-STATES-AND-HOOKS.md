# State Management and Hooks Documentation

Complete guide to state management patterns, hooks, and context providers.

## State Management Architecture

### Overview

WordDROP uses a **hybrid state management approach**:
- **React Context** for global/shared state
- **useState/useReducer** for local component state
- **Custom Hooks** for reusable state logic
- **Services** for side effects and external data

### State Layers

```
Global State (Context)
  ├── AuthContext (user authentication)
  ├── SettingsContext (game settings)
  ├── DisplayContext (theme/display)
  └── AnimationContext (animations)

Component State (useState/useReducer)
  └── GameBoard (main game state)

Custom Hooks (reusable logic)
  ├── useGameState
  ├── useGameScoring
  ├── useGameControls
  └── useSponsorTrivia
```

## Context Providers

### 1. AuthContext (`src/context/AuthContext.tsx`)

**Purpose**: Manage user authentication state

**State:**
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

**For CrazyGames**: 
- **Option A**: Remove entirely (no authentication needed)
- **Option B**: Create mock/guest auth context
```typescript
// Mock auth for CrazyGames
const AuthContext = createContext({
  user: { id: 'guest', username: 'Guest' },
  session: null,
  loading: false,
  signIn: async () => {},
  signOut: async () => {},
});
```

**Usage:**
```typescript
const { user, loading } = useAuth();
```

### 2. SettingsContext (`src/context/SettingsContext.tsx`)

**Purpose**: Manage game settings (sound, music, vibration, etc.)

**State:**
```typescript
interface Settings {
  showShadow: boolean;
  playMusic: boolean;
  playEffects: boolean;
  touchSensitivity: number;
  vibrationEnabled: boolean;
}
```

**Storage**: localStorage (persists across sessions)

**For CrazyGames**: Keep as-is (essential for user preferences)

**Usage:**
```typescript
const { settings, updateSettings } = useSettings();
updateSettings({ playMusic: false });
```

### 3. DisplayContext (`src/context/DisplayContext.tsx`)

**Purpose**: Manage theme and display preferences

**State:**
- Current theme (colors, mode)
- Display settings

**For CrazyGames**: Keep if themes are used, simplify if not

**Usage:**
```typescript
const { currentTheme } = useDisplay();
```

### 4. AnimationContext (`src/contexts/AnimationContext.tsx`)

**Purpose**: Manage animation state and effects

**State:**
- Active animations
- Animation queue

**For CrazyGames**: Keep if animations are important, remove if not

## Game State Management

### GameBoard Component State

**Main State Object** (`GameBoard.tsx`):
```typescript
interface GameState {
  board: Cell[][];              // 8x12 game board
  currentLetter: Cell | null;   // Currently falling letter
  nextLetter: Cell | null;      // Preview next letter
  position: Position;            // Current letter position
  score: number;                 // Current score
  isGameOver: boolean;           // Game over flag
  wordsFound: string[];          // List of words found
  dropInterval: number;          // Fall speed (ms)
  scorePopups: ScorePopupType[]; // Active score popups
  powerUpEffect: PowerUpEffect | null;
  comboCount: number;            // Current combo multiplier
  lastWordTime: number;          // Timestamp of last word
  // ... many more fields
}
```

**State Updates**: Uses `useState` with functional updates
```typescript
setGameState(prev => ({
  ...prev,
  score: prev.score + newScore
}));
```

### State Initialization

**Game Initialization Flow:**
1. Dictionary loads (async)
2. Board created (empty)
3. First letter spawned
4. Game loop starts
5. `gameplayStart` event triggered (for CrazyGames)

**Code Location**: `GameBoard.tsx` - `useEffect` hooks

## Custom Hooks

### 1. useGameState (`src/hooks/useGameState.tsx`)

**Purpose**: Manage game session state

**Returns:**
```typescript
{
  board: BoardCell[][];
  currentWord: string | null;
  score: number;
  level: number;
  comboCount: number;
  remainingBombs: number;
  isPaused: boolean;
  isGameOver: boolean;
  updateGameState: (updates: Partial<GameState>) => void;
  handlePause: () => void;
  handleResume: () => void;
  handleWordFound: (word: string) => void;
}
```

**Usage:**
```typescript
const {
  score,
  level,
  handleWordFound,
  updateGameState
} = useGameState();
```

**For CrazyGames**: Keep, essential for game logic

### 2. useGameScoring (`src/hooks/useGameScoring.ts`)

**Purpose**: Calculate word scores with multipliers

**Functions:**
- `calculateScore(word, specialWordType)`: Base score calculation
- `updateCombo(lastWordTime, currentCombo)`: Combo multiplier logic
- `processWordScore(word, specialWordType, comboCount)`: Final score with all multipliers

**Usage:**
```typescript
const { processWordScore } = useGameScoring();
const { score, comboText } = processWordScore(word, 'wordOfDay', 3);
```

**For CrazyGames**: Keep, core game logic

### 3. useGameControls (`src/hooks/useGameControls.tsx`)

**Purpose**: Handle keyboard and touch input

**Returns:**
```typescript
{
  handleKeyDown: (e: KeyboardEvent) => void;
  handleMove: (direction) => void;
  handleRotate: () => void;
  handleFastDrop: () => void;
  handlePowerUp: (type) => void;
  handleTouchStart: (e: TouchEvent) => void;
  handleTouchMove: (e: TouchEvent) => void;
  handleTouchEnd: (e: TouchEvent) => void;
}
```

**Keyboard Mappings:**
- `ArrowLeft`: Move left
- `ArrowRight`: Move right
- `ArrowDown`: Soft drop
- `Space`: Hard drop
- `ArrowUp`: Rotate (if implemented)
- `b`: Bomb power-up
- `l`: Lightning power-up
- `f`: Freeze power-up

**For CrazyGames**: Keep, essential for gameplay

### 4. useGameEffects (`src/hooks/useGameEffects.tsx`)

**Purpose**: Manage visual effects and animations

**Returns:**
- Active effects
- Effect queue
- Functions to add/remove effects

**For CrazyGames**: Keep if effects are important

### 5. useSponsorTrivia (`src/hooks/useSponsorTrivia.ts`)

**Purpose**: Manage sponsor trivia questions and answers

**State:**
- Current trivia question
- Unanswered trivia queue
- Answered trivia history

**For CrazyGames**: Keep, part of game mechanics

### 6. useGameAnimations (`src/hooks/useGameAnimations.tsx`)

**Purpose**: Coordinate game animations

**For CrazyGames**: Optional, keep if animations are important

## State Persistence

### localStorage Usage

**Settings** (`SettingsContext`):
```typescript
localStorage.setItem('gameSettings', JSON.stringify(settings));
```

**High Scores**:
```typescript
localStorage.setItem('highScores', JSON.stringify(scores));
```

**Game Progress** (if implemented):
```typescript
localStorage.setItem('gameProgress', JSON.stringify(progress));
```

**Dictionary Cache** (`DictionaryService`):
```typescript
localStorage.setItem('wordDrop_dictionary', JSON.stringify({
  timestamp: Date.now(),
  words: Array.from(words)
}));
```

**For CrazyGames**: Keep localStorage usage (works offline, no backend needed)

## State Update Patterns

### 1. Functional Updates

**Pattern**: Use functional updates for state that depends on previous state
```typescript
setGameState(prev => ({
  ...prev,
  score: prev.score + newScore
}));
```

**Why**: Ensures state updates are based on latest state (prevents stale closures)

### 2. Batch Updates

**Pattern**: Group related state updates
```typescript
setGameState(prev => ({
  ...prev,
  board: newBoard,
  score: prev.score + score,
  comboCount: prev.comboCount + 1
}));
```

**Why**: Single re-render instead of multiple

### 3. Callback Pattern

**Pattern**: Use callbacks for async state updates
```typescript
const handleWordFound = useCallback(async (word: string) => {
  const isValid = await dictionaryService.isValidWord(word);
  if (isValid) {
    setGameState(prev => ({
      ...prev,
      wordsFound: [...prev.wordsFound, word]
    }));
  }
}, []);
```

**Why**: Properly handles async operations

## Performance Optimizations

### 1. Memoization

**useMemo**: Memoize expensive calculations
```typescript
const sortedScores = useMemo(() => {
  return scores.sort((a, b) => b - a);
}, [scores]);
```

**useCallback**: Memoize callback functions
```typescript
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

### 2. Context Optimization

**Split Contexts**: Don't put everything in one context
- AuthContext (changes rarely)
- SettingsContext (changes occasionally)
- GameBoard state (changes frequently - keep local)

**Why**: Prevents unnecessary re-renders

### 3. State Lifting

**Pattern**: Lift state only as high as needed
- Local state in component if only used there
- Context if shared across components
- Service if needs persistence

## State Flow Examples

### Word Found Flow

```
User forms word
  ↓
Letter lands on board
  ↓
processWords() detects word
  ↓
DictionaryService validates word
  ↓
useGameScoring calculates score
  ↓
GameState updated (score, combo, wordsFound)
  ↓
Animations triggered
  ↓
Gravity applied
  ↓
New letter spawned
```

### Settings Update Flow

```
User changes setting (e.g., mute music)
  ↓
SettingsContext.updateSettings()
  ↓
localStorage updated
  ↓
SoundService.setSoundEnabled()
  ↓
Music stops/starts
  ↓
UI reflects change
```

## State Management for CrazyGames

### Recommended Changes

1. **Remove AuthContext**: Replace with mock/guest context
2. **Keep SettingsContext**: Essential for user preferences
3. **Simplify DisplayContext**: Remove if themes not used
4. **Keep Game State**: All game-related state is essential
5. **Keep Custom Hooks**: All hooks are game logic (essential)

### Mock Auth Implementation

```typescript
// src/context/AuthContext.tsx (CrazyGames version)
export const AuthProvider = ({ children }) => {
  const value = {
    user: { id: 'guest', username: 'Guest' },
    session: null,
    loading: false,
    signIn: async () => {},
    signOut: async () => {},
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## Best Practices

1. **Single Source of Truth**: Each piece of state lives in one place
2. **Immutable Updates**: Always create new objects/arrays, don't mutate
3. **Minimize State**: Only store what's necessary
4. **Derive State**: Calculate derived values in render, don't store
5. **Clean Up**: Remove listeners, clear timeouts in useEffect cleanup

## Common Patterns

### Controlled Components
```typescript
const [value, setValue] = useState('');
<input value={value} onChange={e => setValue(e.target.value)} />
```

### Uncontrolled Components (for forms)
```typescript
const inputRef = useRef<HTMLInputElement>(null);
<input ref={inputRef} />
// Access value: inputRef.current?.value
```

### Debounced Updates
```typescript
const debouncedValue = useMemo(
  () => debounce(value, 500),
  [value]
);
```

## Notes

- State management is already well-structured
- No need for Redux or other state management libraries
- Context + hooks pattern works well for this game's complexity
- localStorage provides persistence without backend
- All state updates are synchronous except async service calls
