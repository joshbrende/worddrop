# Power-Ups and Scoring System Documentation

Complete guide to power-ups implementation and scoring logic.

## Power-Up System Overview

### Available Power-Ups

The game has **5 power-ups**, each with specific mechanics:

1. **💣 Bomb** - Clears a cross pattern
2. **⚡ Lightning** - Clears entire column
3. **❄️ Freeze** - Slows falling speed
4. **🌬️ Wind** - Clears bottom row
5. **🔠 Blank** - Player chooses next letter

### Power-Up Management

**Component**: `src/components/PowerUps.tsx`

**State**:
```typescript
const [powerUps, setPowerUps] = useState([
  { name: 'bomb', icon: '💣', uses: 3, isAvailable: true },
  { name: 'lightning', icon: '⚡', uses: 3, isAvailable: true },
  { name: 'freeze', icon: '❄️', uses: 3, isAvailable: true },
  { name: 'wind', icon: '🌬️', uses: 3, isAvailable: true },
  { name: 'blank', icon: '🔠', uses: 3, isAvailable: true }
]);
```

**Initial Uses**: 3 uses per power-up per game

**Availability Logic**:
- `isAvailable: true` when `uses > 0`
- Button disabled when `uses === 0`
- Uses decrement when power-up is used

## Power-Up Implementations

### 1. Bomb (💣)

**Location**: `src/components/BombLogic.ts` + `src/components/BombTile.tsx`

**Implementation**: `handleBombExplosion()` in `GameBoard.tsx`

**Mechanics**:
1. **Activation**: Click bomb power-up button
2. **Effect**: Current falling letter becomes 💣 bomb tile
3. **Explosion Trigger**: Bomb explodes when it lands (collides)
4. **Pattern**: Cross pattern (T-shape)
   - Bomb position (center)
   - 2 cells left of bomb
   - 2 cells right of bomb  
   - 2 cells below bomb
   - Total: 7 cells cleared

**Code**:
```typescript
// Mark cells for removal
markCellForRemoval(row, col); // Bomb position

// Mark cells to the left (2 cells)
for (let c = Math.max(0, col - 2); c < col; c++) {
  markCellForRemoval(row, c);
}

// Mark cells to the right (2 cells)
for (let c = col + 1; c <= Math.min(BOARD_WIDTH - 1, col + 2); c++) {
  markCellForRemoval(row, c);
}

// Mark cells downward (2 cells)
for (let r = row + 1; r <= Math.min(BOARD_HEIGHT - 1, row + 2); r++) {
  markCellForRemoval(r, col);
}
```

**Animation**:
- Uses `BombTile` component for visual
- Explosion particles (12 particles)
- Shockwave effect
- 600ms animation duration

**Score**: 100 points (fixed)

**Sound**: `explosion.mp3`

**Vibration**: `[50, 25, 100, 25, 50]` pattern

**After Explosion**:
1. Clear marked cells
2. Apply gravity
3. Spawn new letter
4. Check for cascading words

### 2. Lightning (⚡)

**Implementation**: `handlePowerUp('lightning')` in `GameBoard.tsx`

**Mechanics**:
1. **Activation**: Click lightning power-up button
2. **Effect**: Clears entire column where current letter is located
3. **Column**: Uses `gameState.position.x` (current letter's column)
4. **Animation**: Lightning effect down the column

**Code Flow**:
```typescript
1. Mark all cells in column as `isLightning: true` and `removing: true`
2. Check if cells exist to clear (if empty column, no effect)
3. Play lightning sound + vibration
4. Show lightning animation
5. After 600ms delay:
   - Clear all marked cells in column
   - Apply gravity
   - Award 100 points
   - Show score popup
   - Spawn new letter if needed
```

**Edge Cases**:
- If column is empty: No effect, power-up not consumed
- Handles gracefully, continues game

**Score**: 100 points (fixed, regardless of cells cleared)

**Sound**: `lightning.mp3`

**Vibration**: `[50, 30, 100]` pattern

**Animation Duration**: 600ms

### 3. Freeze (❄️)

**Implementation**: `handlePowerUp('freeze')` in `GameBoard.tsx`

**Mechanics**:
1. **Activation**: Click freeze power-up button
2. **Effect**: Slows falling speed for 10 seconds
3. **Speed Reduction**: Drop interval multiplied by 1.5 (50% slower)
4. **Visual**: All cells marked as `isFrozen: true` (for styling)

**Code**:
```typescript
// Mark all cells as frozen (visual only)
const frozenBoard = gameState.board.map(row =>
  row.map(cell => ({ ...cell, isFrozen: true }))
);

// Slow down drop speed by 50%
setGameState(prev => ({
  ...prev,
  board: frozenBoard,
  dropInterval: prev.dropInterval * 1.5
}));

// Remove freeze after 10 seconds
setTimeout(() => {
  // Remove frozen flag
  // Restore normal drop speed
}, 10000);
```

**Duration**: 10 seconds (10000ms)

**Score**: No direct points (utility power-up)

**Sound**: `move.mp3` (generic sound)

**Vibration**: `[30, 50, 30]` pattern

**Restoration**: Automatically restores normal speed after duration

### 4. Wind (🌬️)

**Implementation**: `handlePowerUp('wind')` in `GameBoard.tsx`

**Mechanics**:
1. **Activation**: Click wind power-up button
2. **Effect**: Clears entire bottom row (row 11, index `BOARD_HEIGHT - 1`)
3. **Animation**: Wind sweep animation across bottom row

**Code Flow**:
```typescript
1. Mark all cells in bottom row as `removing: true`
2. Show wind sweep animation (`WindSweep` component)
3. After 700ms delay:
   - Clear all cells in bottom row
   - Apply gravity
   - Spawn new letter if needed
```

**Row**: Always bottom row (`BOARD_HEIGHT - 1`)

**Score**: 100 points (implied, though not explicitly shown in code)

**Sound**: `wind.mp3`

**Animation Duration**: 700ms

**Animation Component**: `WindSweep` with keyframes animation

### 5. Blank / Letter Choice (🔠)

**Implementation**: `handlePowerUp('blank', selectedLetter)` in `GameBoard.tsx`

**Mechanics**:
1. **Activation**: Click blank power-up button
2. **UI**: Shows alphabet grid modal (26 letters A-Z)
3. **Selection**: Player clicks a letter from grid
4. **Effect**: Sets `nextLetter` to selected letter

**Code**:
```typescript
case 'blank':
  if (selectedLetter) {
    setGameState(prev => ({
      ...prev,
      nextLetter: {
        letter: selectedLetter,
        isActive: false,
        active: false,
        removing: false
      }
    }));
    SoundService.play('move');
  }
  break;
```

**Alphabet Grid**:
- 6 columns layout (responsive: 5 columns on mobile, 4 on small screens)
- 26 letter buttons (A-Z)
- Close button (✕) to cancel

**Score**: No direct points (utility power-up)

**Sound**: `move.mp3`

**Usage**: Strategic - player can pick needed letter for word formation

## Power-Up Usage Tracking

**State**: `gameState.bombsRemaining` (tracks remaining bomb uses, starts at 4)

**Note**: Currently only bombs are tracked in game state, other power-ups tracked in `PowerUps` component local state

**Power-Up Drop**:
- Random chance: 10% (`POWER_UP_DROP_CHANCE = 0.1`)
- Can drop after words are found
- Types: 💣, ⚡, ❄️
- Animated drop with sparkles

## Scoring System Details

### Scoring Functions

#### 1. `calculateSpecialWordScore()` (GameBoard.tsx)

**Purpose**: Calculate score for words with special multipliers

**Parameters**:
- `word: string` - The word found
- `specialWordType: 'wordOfDay' | 'sponsorTrivia' | null` - Special word type
- `isVertical: boolean` - Whether word is vertical
- `comboCount: number` - Current combo count
- `level: number` - Current level

**Calculation Steps**:
1. **Letter Scores**: Sum of individual letter scores (Scrabble-like)
2. **Base Points**: Add word length base points
3. **Special Multiplier**: Apply if word of day (3x) or sponsor trivia (2.5x)
4. **Vertical Bonus**: Multiply by 1.5x if vertical
5. **Combo Multiplier**: Calculate from combo count
6. **Level Bonus**: 10% increase per level
7. **Final**: Multiply all together, round to integer

**Formula**:
```typescript
score = (
  (sumOfLetterScores + basePoints[wordLength]) *
  specialMultiplier *
  verticalBonus *
  comboMultiplier *
  levelBonus
)
```

#### 2. `calculateWordScore()` (GameBoard.tsx)

**Purpose**: Alternative scoring function (used in some contexts)

**Differences**:
- Uses `lengthMultiplier` (basePoints / 100) instead of adding basePoints
- Slightly different calculation approach
- Same multipliers applied

#### 3. `processWordScore()` (useGameScoring.ts hook)

**Purpose**: Process word score with combo calculation

**Returns**:
```typescript
{
  score: number;
  comboText: string | null; // "x3 COMBO!" or null
}
```

**Combo Calculation**:
```typescript
const comboBase = 1.0;
const comboIncrement = 0.2; // 20% per combo
const comboMultiplier = Math.min(3.0, comboBase + (comboCount * comboIncrement));
```

### Score Components

#### Base Score Components

**1. Letter Scores** (Scrabble-like):
```typescript
A=1, E=1, I=1, O=1, R=1, S=1, T=1, U=1, L=1, N=1  // Common letters
D=2, G=2                                           // Less common
B=3, C=3, M=3, P=3                                // Medium
F=4, H=4, V=4, W=4, Y=4                           // Harder
K=5                                                // Rare
J=8, X=8                                           // Very rare
Q=10, Z=10                                         // Rarest
```

**2. Word Length Base Points**:
- 3 letters: 100 points
- 4 letters: 200 points
- 5 letters: 400 points
- 6 letters: 800 points
- 7 letters: 1600 points
- 8+ letters: 3200 points

**3. Multipliers**:

**Combo Multiplier**:
- Base: 1.0x
- Increment: +0.2x per combo
- Maximum: 3.0x
- Timeout: 5 seconds (resets if no word in 5s)

**Vertical Bonus**:
- Horizontal: 1.0x
- Vertical: 1.5x

**Level Bonus**:
- Formula: `1.0 + ((level - 1) * 0.1)`
- Level 1: 1.0x (no bonus)
- Level 2: 1.1x (+10%)
- Level 3: 1.2x (+20%)
- Level 9: 1.8x (+80%)

**Special Word Multipliers**:
- Word of Day: 3.0x
- Sponsor Trivia: 2.5x
- Regular Trivia: 2.0x

### Double Scoring (Intersection Bonus)

**When**: Letter cell forms multiple words simultaneously

**Calculation**:
```typescript
// Count how many words this cell is part of
let wordCount = 0;
if (cell is in vertical word) wordCount++;
if (cell is in horizontal word) wordCount++;

// Add letter score again for each additional word
if (wordCount > 1) {
  bonus += letterScore; // Add letter score for each extra word
}
```

**Example**:
- Letter "T" in both "CAT" (horizontal) and "TO" (vertical)
- Gets base letter score (1 point) + intersection bonus (1 point again)
- Total letter contribution: 2 points (instead of 1)

### Word Count Milestones

**Bonus Points for Word Count**:
- 50 words: 500 points
- 100 words: 1000 points
- 150 words: 1500 points
- 200 words: 2000 points
- 250 words: 2500 points
- 300 words: 3000 points
- 400 words: 4000 points
- 500 words: 5000 points

**Tracking**: Based on `gameState.wordsFound.length` or calculated from score

## ScorePopup Component

**Location**: `src/components/ScorePopup.tsx`

**Purpose**: Animated score display at word location

**Props**:
```typescript
interface ScorePopupProps {
  score: number;
  combo: number;
  position: { x: number; y: number };
  onComplete: () => void;
}
```

**Features**:
- Shows score value: `+{score}`
- Shows combo text if combo > 1: `{combo}x COMBO!`
- Shows multiplier percentage: `+{percentage}%`
- Positioned at word location
- Auto-removes after 1200ms

**Visual Classes**:
- `high`: Score >= 100 (larger, brighter)
- `combo`: Combo > 1 (special styling)

**Animation**:
- Fade in
- Float upward
- Fade out
- CSS keyframes animation

**Styling**: Defined in `GameBoard.css` (score-popup classes)

## Power-Up Drop System

**Random Drop**:
- Chance: 10% (`POWER_UP_DROP_CHANCE = 0.1`)
- Trigger: After words are found
- Types: 💣, ⚡, ❄️ (bomb, lightning, freeze)
- Animation: `PowerUpDropOverlay` component

**Animation**:
- Power-ups drop from top
- Sparkle effects on landing
- 1.2s animation duration
- Staggered delays (0.15s between each)

## Power-Up Integration with Game Loop

### Activation Flow

```
User clicks power-up button
  ↓
PowerUps component: handlePowerUpClick()
  ↓
Checks uses > 0
  ↓
Decrements uses count
  ↓
Calls onUsePowerUp(powerUpName, selectedLetter?)
  ↓
GameBoard: handlePowerUp()
  ↓
Switch statement based on power-up type
  ↓
Apply effect (clear cells, change speed, etc.)
  ↓
Animation + Sound + Vibration
  ↓
Update game state
  ↓
Apply gravity (if cells cleared)
  ↓
Continue game loop
```

### Power-Up State Management

**Game State Fields**:
- `bombsRemaining: number` - Bomb uses (starts at 4)
- `powerUpEffect: PowerUpEffect | null` - Active power-up effect
- `activeEffect: PowerUpEffect | null` - Currently active effect

**PowerUpEffect Type**:
```typescript
type PowerUpEffect = 
  | { type: 'letter_frequency'; config: { letters: string[]; duration: number } }
  | { type: 'speed_boost'; config: { multiplier: number; duration: number } }
  | { type: 'clear_effect'; config: { pattern: 'random' | 'row' | 'column'; duration: number } }
  | { type: 'letter_color'; config: { letters: string[]; color: string; duration: number } };
```

**Note**: Some power-up effects use this type system, others are handled directly in `handlePowerUp`

## Scoring Integration Points

### When Scores are Calculated

1. **Word Found**: 
   - `handleWordFound()` called
   - `calculateSpecialWordScore()` or `calculateWordScore()` used
   - Score added to total
   - Score popup shown

2. **Power-Up Used**:
   - Bomb: 100 points (after explosion)
   - Lightning: 100 points (after clearing)
   - Wind: 100 points (implied, after clearing)
   - Freeze: No points
   - Blank: No points

3. **Milestone Reached**:
   - Word count milestones trigger bonus points
   - Shown via `WordMilestoneAnimation`

4. **Trivia Correct**:
   - Bonus points added when trivia answered correctly
   - Amount varies by trivia type

### Score Display

**Components**:
- `ScorePopup` - Individual word scores
- `GameHUD` - Total score display
- `GameOverMenu` - Final score display

**Score Popup Management**:
```typescript
const [scorePopups, setScorePopups] = useState<ScorePopupType[]>([]);

const addScorePopup = (score: number, x: number, y: number, text?: string) => {
  const newPopup: ScorePopupType = {
    id: Date.now(),
    score,
    position: { x, y },
    comboText: text
  };
  setScorePopups(prev => [...prev, newPopup]);
};

const removeScorePopup = (id: number) => {
  setScorePopups(prev => prev.filter(popup => popup.id !== id));
};
```

## BombTile Component

**Location**: `src/components/BombTile.tsx`

**Purpose**: Visual representation of bomb tile

**Features**:
- Bomb body with fuse
- Spark animation on fuse
- Explosion particles (12 particles)
- Shockwave effect
- 600ms explosion animation

**States**:
- `isExploding: boolean` - Animation state
- `isActive: boolean` - Whether bomb should explode

**CSS**: Bomb styling in `BombTile.css` (referenced but file location not found in structure)

## PowerUps Component Styling

**Location**: `src/components/PowerUps.css`

**Key Styles**:
- `.power-up-button`: 40x40px buttons (responsive)
- `.power-up-icon`: Emoji/icon display (20px)
- `.power-up-count`: Badge showing remaining uses
- `.alphabet-selector`: Modal overlay for letter selection
- `.alphabet-grid`: 6-column grid (responsive)
- `.letter-button`: Individual letter buttons

**Responsive Breakpoints**:
- Desktop: 40px buttons, 6-column grid
- Mobile (< 600px): 36px buttons, 5-column grid
- Small (< 320px): 32px buttons, 4-column grid

## Implementation Notes

### Power-Up Usage Logic

**Important**: Power-ups can be used even when column/row is empty, but should show "no effect" message or not consume use

**Current Implementation**: 
- Lightning checks if column has cells before clearing
- Wind always clears bottom row (may be empty)
- Bomb only explodes when it lands (collision)

### Power-Up Reset

**On New Game**: Power-ups reset to 3 uses each

**On Game Over**: Power-ups reset (new game)

### Power-Up Persistence

**Storage**: Not persisted between games (starts fresh each game)

**For CrazyGames**: This is fine, no need to persist power-up uses

## For CrazyGames Adaptation

### Keep As-Is
- ✅ All power-up mechanics (well-implemented)
- ✅ Scoring system (core game logic)
- ✅ ScorePopup animations (good UX)

### Optimize
- ⚠️ PowerUps.css: Already optimized, responsive
- ⚠️ BombTile: CSS animations are good (no Framer Motion)

### Considerations
- Power-up drop animation uses inline styles (good, no extra dependencies)
- All power-ups use relative paths for sounds ✅
- Power-up effects are self-contained in GameBoard ✅

## Code References

### Key Files
- `src/components/GameBoard.tsx` (lines 2481-2678): `handlePowerUp()` function
- `src/components/GameBoard.tsx` (lines 1553-1649): `handleBombExplosion()` function
- `src/components/PowerUps.tsx`: Power-up UI component
- `src/components/BombLogic.ts`: Bomb logic utilities
- `src/components/BombTile.tsx`: Bomb visual component
- `src/components/ScorePopup.tsx`: Score display component
- `src/hooks/useGameScoring.ts`: Scoring calculations hook
- `src/components/GameBoard.tsx` (lines 760-842): Scoring functions

### Constants
- `src/constants/game.ts`: `SCORING_CONFIG` with all scoring constants
- `POWER_UP_DROP_CHANCE = 0.1`: 10% drop chance
- `MAX_COMBO = 5`: Maximum combo count
