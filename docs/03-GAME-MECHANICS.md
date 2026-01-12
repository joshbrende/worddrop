# Game Mechanics Documentation

## Core Gameplay

WordDROP is a **falling-block word puzzle game** where players strategically place falling letter tiles to form valid words.

## Game Board

### Dimensions
- **Width**: 8 columns
- **Height**: 12 rows
- **Total Cells**: 96 cells

### Cell Structure
```typescript
interface Cell {
  letter: string;        // A-Z or special character (💣)
  isActive: boolean;     // Currently falling letter
  active: boolean;       // Alternative active flag
  removing: boolean;     // Marked for removal (animation)
  isBomb?: boolean;      // Bomb power-up tile
  type?: 'daily' | 'sponsor' | 'trivia';  // Special tile type
  isLightning?: boolean; // Lightning effect
  isFrozen?: boolean;    // Frozen state
}
```

## Letter Falling System

### Generation
- Letters are randomly generated from **A-Z** alphabet
- **No numbers allowed** (explicitly filtered)
- Special tiles: 💣 (Bomb) can also fall
- One letter falls at a time from top center (x = BOARD_WIDTH/2, y = 0)

### Movement
- **Auto-fall**: Letters automatically fall down at intervals
- **Drop Speed**: Base interval 1000ms, decreases by 100ms per level
  - Level 1: 1000ms
  - Level 2: 900ms
  - Level 3: 800ms
  - ... (minimum 100ms)
- **Manual Controls**:
  - **Left/Right Arrow Keys**: Move letter horizontally
  - **Down Arrow Key**: Force drop (instant)
  - **Space Bar**: Drop instantly
  - **Touch/Mouse**: Drag to move, tap to drop

### Landing Logic
When a letter lands:
1. Check for collision (cell below is occupied or at bottom)
2. Place letter in current position
3. Check for game over (if landed at top row 0)
4. Trigger word detection on the row and column where it landed
5. If no words found, spawn next letter
6. If words found, process words → apply gravity → spawn next letter

## Word Formation

### Rules
- **Minimum Length**: 3 letters
- **Maximum Length**: 15 letters (though scoring caps at 8)
- **Directions**: 
  - **Horizontal**: Left-to-right (primary)
  - **Vertical**: Top-to-bottom
- **No Diagonal**: Only horizontal and vertical words count

### Word Detection Algorithm

After a letter lands, the game checks:

1. **Horizontal Words** (check entire row where letter landed):
   ```typescript
   // Scan row left to right
   // Find contiguous sequences of letters (ignore empty cells and bombs)
   // Check if sequences of 3+ letters form valid words
   ```

2. **Vertical Words** (check entire column where letter landed):
   ```typescript
   // Scan column top to bottom
   // Find contiguous sequences of letters
   // Check if sequences of 3+ letters form valid words
   ```

3. **Word Validation Priority**:
   - **First**: Check if it's a sponsor trivia answer (exact match)
   - **Second**: Check if it's the Word of the Day (exact match)
   - **Third**: Check known sponsor words (ALIPAY, MAYBACH, etc.)
   - **Fourth**: Validate against dictionary (DictionaryService)

4. **Processing**:
   - Mark valid words for removal (set `removing: true`)
   - Calculate scores
   - Show animations
   - After ~400ms delay, clear marked cells
   - Apply gravity
   - Check for cascading words (words formed by gravity)

## Scoring System

### Base Scoring

**Word Length Base Points**:
- 3 letters: 100 points
- 4 letters: 200 points
- 5 letters: 400 points
- 6 letters: 800 points
- 7 letters: 1600 points
- 8+ letters: 3200 points

**Letter Scores** (Scrabble-like, added to base):
```
A=1, B=3, C=3, D=2, E=1, F=4, G=2, H=4, I=1, J=8,
K=5, L=1, M=3, N=1, O=1, P=3, Q=10, R=1, S=1, T=1,
U=1, V=4, W=4, X=8, Y=4, Z=10
```

### Multipliers

1. **Combo Multiplier**:
   - Base: 1.0x
   - Increment: +0.2x per consecutive word
   - Maximum: 3.0x
   - Timeout: 5 seconds (combo resets if no word in 5s)

2. **Vertical Bonus**: 1.5x multiplier for vertical words

3. **Level Bonus**:
   - Base: 1.0x
   - Increment: +0.1x per level
   - Formula: `1.0 + ((level - 1) * 0.1)`

4. **Special Word Multipliers**:
   - Word of the Day: **3.0x**
   - Sponsor Trivia: **2.5x**
   - Regular Trivia: **2.0x**

### Double Scoring

If a letter cell forms **multiple words** (intersection):
- Gets base letter score again for each additional word
- Example: Letter "T" in both "CAT" (horizontal) and "TO" (vertical) = double letter score

### Final Score Calculation

```typescript
score = (
  (basePoints[wordLength] + sumOfLetterScores) *
  comboMultiplier *
  verticalBonus *
  levelBonus *
  specialWordMultiplier
) + doubleScoringBonus
```

### Word Count Milestones

Additional bonus points for word count milestones:
- 50 words: 500 points
- 100 words: 1000 points
- 150 words: 1500 points
- 200 words: 2000 points
- 250 words: 2500 points
- 300 words: 3000 points
- 400 words: 4000 points
- 500 words: 5000 points

## Power-Ups

### Available Power-Ups

1. **💣 Bomb**
   - **Effect**: Clears a cross pattern
   - **Pattern**: 2 cells left, bomb, 2 cells right, 2 cells down
   - **Score**: 100 points
   - **Uses**: 4 per game (starts with 4)

2. **⚡ Lightning**
   - **Effect**: Clears entire column where current piece is located
   - **Score**: 100 points
   - **Uses**: Limited per game

3. **❄️ Freeze**
   - **Effect**: Temporarily slows/stops falling speed for 5 seconds
   - **Duration**: 5000ms
   - **Score**: No direct points

4. **🌬️ Wind**
   - **Effect**: Clears entire bottom row
   - **Score**: 100 points
   - **Uses**: Limited per game

5. **🔠 Blank (Letter Choice)**
   - **Effect**: Player picks the next letter from alphabet grid
   - **Score**: No direct points
   - **Uses**: Limited per game

### Power-Up Activation
- Click power-up button in UI
- Some require selection (blank → pick letter, lightning → pick column)
- Power-ups have limited uses
- Power-ups can drop randomly during gameplay (10% chance)

## Gravity System

After words are cleared:
1. All marked cells (`removing: true`) are cleared (set to empty)
2. **Gravity Loop**:
   - For each column, bottom to top:
     - If cell is empty and cell above has a letter:
       - Move letter down
       - Mark column as "moved"
   - Repeat until no more moves possible
3. After gravity, check for new words formed by cascading letters
4. Process any new words (repeat word detection)
5. Continue until no more words are found

## Trivia System

### Word of the Day
- **Trigger**: Daily word displayed at game start
- **Bonus**: 3x multiplier when found
- **Animation**: Special celebration animation
- **Source**: Fetched from backend/API or generated locally

### Sponsor Trivia
- **Trigger**: 
  - At level start (especially level 1)
  - Every 1000 points scored
  - At certain level milestones
- **Flow**:
  1. Game pauses
  2. Trivia modal appears with question
  3. Player answers (or skips)
  4. If correct: 2.5x multiplier when answer word is formed
  5. Game resumes
- **Queue System**: Multiple trivia questions can be queued
- **Tracking**: Answered vs unanswered trivia tracked

### Known Sponsor Words
- ALIPAY, MAYBACH, BIXBY, GAMEPASS, MUSICALLY, LEXUS, EOS, OSWALD, COCO
- These words are always recognized regardless of dictionary

## Level Progression

### Level Advancement
- **Points per Level**: 500 points needed to advance
- **Maximum Level**: 9
- **Level Effects**:
  - **Drop Speed**: Increases (faster falling) per level
  - **Score Multiplier**: +10% per level
  - **Difficulty**: Harder letter distribution (more rare letters)

### Level Up
- **Animation**: Special level up celebration
- **Sound**: Level up sound effect
- **Notification**: Visual indicator
- **Trivia**: May trigger sponsor trivia at certain levels

## Game Over Conditions

### Primary Condition
- **Top Row Blocked**: If a new letter cannot be placed at row 0 (top row)
- This happens when the board is filled to the top

### Game Over Sequence
1. Stop all game timers
2. Stop all sounds and music
3. Trigger vibration (if enabled)
4. Play game over sound
5. Calculate final stats:
   - Total score
   - Words found
   - Longest word
   - Level reached
   - Duration
6. Show GameOverMenu
7. Update high scores (localStorage)
8. Submit score to leaderboard (if authenticated)

## Input Handling

### Keyboard Controls
- **Arrow Left**: Move left
- **Arrow Right**: Move right
- **Arrow Down**: Soft drop (faster fall)
- **Space**: Hard drop (instant)
- **P / Escape**: Pause
- **Movement Delay**: 100ms between moves (prevents rapid-fire)

### Touch/Mouse Controls
- **Drag**: Move letter horizontally
- **Tap/Click**: Drop letter
- **Swipe**: Move in direction
- **Long Press**: Potentially activate power-up (if implemented)

### Movement Constraints
- Cannot move into occupied cells
- Cannot move outside board boundaries (0 to BOARD_WIDTH-1)
- Movement is immediate (no animation delay for responsiveness)

## Animation System

### Score Popups
- **Position**: Appears at word location
- **Content**: Score value + bonus text (if special word)
- **Animation**: Fade in, float up, fade out
- **Duration**: ~2 seconds

### Word Removal
- **Animation**: Cells marked as `removing: true`
- **Effect**: Fade out or explode animation
- **Duration**: 400ms before clearing

### Power-Up Effects
- **Bomb**: Explosion animation at cross pattern
- **Lightning**: Lightning bolt animation down column
- **Wind**: Wind animation across bottom row
- **Freeze**: Ice/frost overlay on board

### Special Celebrations
- **Word of Day**: Special animation + 3x multiplier indicator
- **Sponsor Word**: Sponsor logo + animation
- **Level Up**: Confetti/celebration animation
- **Achievement**: Badge unlock animation

## Sound System

### Sound Effects
- **move.mp3**: Movement sound
- **word.mp3**: Word completion
- **combo.mp3**: Combo/sponsor word
- **level-up.mp3**: Level advancement
- **game-over.mp3**: Game over
- **drop.mp3**: Hard drop
- **bomb.mp3**: Bomb explosion
- **lightning.mp3**: Lightning effect
- **wind.mp3**: Wind effect

### Background Music
- **music.mp3**: Looping background music
- Volume control: 0-100% (default 50%)
- Pauses on game over
- Respects user settings (can be muted)

### Audio Settings
- **Music Toggle**: On/Off
- **Sound Effects Toggle**: On/Off
- **Volume Control**: Separate for music and effects
- **Auto-play**: Requires user interaction (browser policy)

## Special Features

### Dictionary Validation
- **Source**: `/public/dictionary.csv` (large word list)
- **Caching**: Stored in localStorage for 24 hours
- **Fallback**: Backup dictionary if main dictionary fails to load
- **Validation**: Case-insensitive matching

### Achievement System
- Track various milestones (words found, scores, special words, etc.)
- Badges for achievements
- Progress tracking in localStorage
- Display in profile/achievements page

### High Scores
- **Local Storage**: Top 10 scores saved locally
- **Leaderboard**: Online leaderboard (requires authentication)
- **Stats Tracked**:
  - Highest score
  - Highest level
  - Total words found
  - Longest word
  - Games played

## Performance Considerations

### Optimization Techniques
1. **Debouncing**: Input handlers debounced to prevent excessive updates
2. **Memoization**: React.memo, useMemo, useCallback for expensive calculations
3. **Batch Updates**: State updates batched to prevent multiple re-renders
4. **Lazy Loading**: Dictionary loaded asynchronously
5. **Animation Throttling**: Animations use requestAnimationFrame

### Memory Management
- Dictionary cached in localStorage (not in memory after load)
- Sound files loaded once, reused
- Game state cleaned up on game over
- Event listeners properly cleaned up

## Edge Cases Handled

1. **Empty Board**: Game starts with empty board
2. **No Valid Words**: Game continues, player must clear space
3. **Dictionary Not Ready**: Uses fallback dictionary, continues playing
4. **Sound Failed**: Game continues without sound
5. **Network Failure**: Game works offline (except leaderboard)
6. **Invalid Input**: Input ignored if invalid move
7. **Rapid Input**: Movement delay prevents excessive updates
8. **Multiple Words Simultaneously**: All words processed, scored separately
9. **Cascading Words**: Gravity creates new words, all processed
