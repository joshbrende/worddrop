# Rebuild Phases & Development Plan

Complete phase-by-phase approach with improvement suggestions, code quality standards, review policies, and game development best practices.

## Development Philosophy

### Core Principles
1. **Quality Over Speed**: Build it right the first time
2. **Incremental Development**: Working game at each phase
3. **Test-Driven Mindset**: Test as you build
4. **Performance First**: Optimize from the start
5. **Maintainability**: Clean, documented, extensible code
6. **User Experience**: Smooth, intuitive, engaging gameplay

### Game Development Best Practices
- **60 FPS Target**: Smooth animations and interactions
- **Frame-Rate Independent**: Use deltaTime for physics
- **Responsive Controls**: Immediate feedback (< 50ms latency)
- **Clear Visual Feedback**: Player always knows what's happening
- **Progressive Difficulty**: Challenge scales appropriately
- **Forgiving Design**: Mistakes don't feel punishing

## Phase 0: Preparation & Analysis

### Duration: 1-2 days

#### Tasks
1. **Code Review of Example**
   - [ ] Analyze existing GameBoard.tsx (2957 lines) - identify refactoring opportunities
   - [ ] Review state management patterns - identify improvements
   - [ ] Review component structure - identify separation of concerns issues
   - [ ] Review performance bottlenecks - identify optimization opportunities
   - [ ] Document technical debt in example code

2. **Architecture Planning**
   - [ ] Design component hierarchy
   - [ ] Design state management flow
   - [ ] Design service layer architecture
   - [ ] Plan asset loading strategy
   - [ ] Plan build pipeline

3. **Technical Setup**
   - [ ] Set up development environment
   - [ ] Configure TypeScript strict mode
   - [ ] Set up ESLint + Prettier
   - [ ] Set up testing framework (Vitest)
   - [ ] Set up pre-commit hooks (Husky)

4. **Asset Preparation**
   - [ ] Process dictionary CSV to TypeScript array
   - [ ] Optimize sound files (compress, trim)
   - [ ] Optimize images (compress, format conversion)
   - [ ] Review Lottie animations (identify which to use)
   - [ ] Create asset manifest

### Deliverables
- Architecture document
- Asset optimization report
- Development environment setup
- Code quality standards document

---

## Phase 1: Foundation & Core Architecture

### Duration: 3-5 days

### Goals
- Clean project structure
- Core game loop working
- Basic falling letter mechanics
- TypeScript strict mode
- No runtime errors

### Tasks

#### 1.1 Project Structure
```typescript
worddrop-crazygames/
├── src/
│   ├── core/              # Core game logic (framework agnostic)
│   │   ├── GameEngine.ts
│   │   ├── Board.ts
│   │   ├── Letter.ts
│   │   ├── WordDetector.ts
│   │   └── Gravity.ts
│   ├── components/        # React UI components
│   │   ├── GameBoard.tsx
│   │   ├── GameCell.tsx
│   │   ├── FallingLetter.tsx
│   │   └── ScoreDisplay.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useGameLoop.ts
│   │   ├── useGameState.ts
│   │   └── useKeyboard.ts
│   ├── services/         # External services
│   │   ├── DictionaryService.ts
│   │   ├── SoundService.ts
│   │   └── CrazyGamesService.ts
│   ├── utils/            # Pure utility functions
│   │   ├── scoring.ts
│   │   ├── wordValidation.ts
│   │   └── collision.ts
│   ├── constants/        # Game constants
│   │   ├── game.ts
│   │   ├── scoring.ts
│   │   └── board.ts
│   ├── types/            # TypeScript types
│   │   └── game.ts
│   └── styles/           # CSS/styling
│       ├── themes/
│       │   └── cyberpunk.ts
│       └── components/
├── public/
│   ├── sounds/
│   ├── images/
│   └── lottie/
└── tests/
    ├── core/
    ├── components/
    └── utils/
```

**Improvement**: Better separation of concerns - core logic separate from React components

#### 1.2 Core Game Engine (Framework Agnostic)
```typescript
// src/core/GameEngine.ts
export class GameEngine {
  private board: Board;
  private currentLetter: Letter | null;
  private score: number;
  private level: number;
  private lastUpdate: number;
  
  update(deltaTime: number): void {
    // Core game loop - independent of React
  }
  
  moveLetter(direction: Direction): void { }
  dropLetter(): void { }
  processWords(): Word[] { }
  applyGravity(): void { }
}
```

**Improvement**: Extract game logic from React component - easier to test, more maintainable

#### 1.3 TypeScript Types
```typescript
// src/types/game.ts
export type Letter = 'A' | 'B' | 'C' | ... | 'Z';

export interface Cell {
  letter: Letter | null;
  isEmpty: boolean;
  isRemoving: boolean;
  isFrozen: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  board: Cell[][];
  currentLetter: FallingLetter | null;
  nextLetter: FallingLetter | null;
  score: number;
  level: number;
  comboCount: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export interface FallingLetter {
  letter: Letter;
  position: Position;
  id: string;
}
```

**Improvement**: Strict typing throughout - catch errors at compile time

#### 1.4 Constants Configuration
```typescript
// src/constants/game.ts
export const BOARD_CONFIG = {
  WIDTH: 8,
  HEIGHT: 12,
  MIN_WORD_LENGTH: 3,
  MAX_WORD_LENGTH: 8,
} as const;

export const DROP_CONFIG = {
  BASE_INTERVAL: 1000,      // ms
  MIN_INTERVAL: 100,        // ms
  SPEED_INCREASE_PER_LEVEL: 100, // ms
} as const;
```

**Improvement**: All magic numbers extracted to constants - easier to balance

#### 1.5 Basic Game Loop
```typescript
// src/hooks/useGameLoop.ts
export function useGameLoop(engine: GameEngine, isPaused: boolean) {
  useEffect(() => {
    if (isPaused) return;
    
    let animationFrame: number;
    let lastTime = performance.now();
    
    const loop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Frame-rate independent updates
      engine.update(deltaTime);
      
      animationFrame = requestAnimationFrame(loop);
    };
    
    animationFrame = requestAnimationFrame(loop);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [engine, isPaused]);
}
```

**Improvement**: Frame-rate independent game loop using requestAnimationFrame

### Code Quality Standards (Phase 1)

#### TypeScript
- ✅ Strict mode enabled
- ✅ No `any` types (use `unknown` if needed)
- ✅ All functions have explicit return types
- ✅ Use `const` assertions for immutable data
- ✅ Use discriminated unions for state

#### Code Organization
- ✅ Single Responsibility Principle - each function does one thing
- ✅ DRY (Don't Repeat Yourself) - extract common logic
- ✅ Small functions (< 50 lines)
- ✅ Clear naming - functions describe what they do

#### Performance
- ✅ Use `useMemo` for expensive calculations
- ✅ Use `useCallback` for event handlers passed to children
- ✅ Avoid unnecessary re-renders
- ✅ Batch state updates

#### Testing
- ✅ Unit tests for pure functions (scoring, word validation)
- ✅ Integration tests for game engine
- ✅ Test edge cases (empty board, single letter, etc.)

### Review Checklist (Phase 1)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All tests passing
- [ ] Code coverage > 80% for core logic
- [ ] Performance: 60 FPS consistently
- [ ] Memory: No memory leaks (check with DevTools)
- [ ] Letters fall smoothly
- [ ] Basic controls work (move, drop)

### Deliverables
- ✅ Working game loop with falling letters
- ✅ Basic movement controls
- ✅ Clean architecture foundation
- ✅ Test suite foundation
- ✅ Code quality tools configured

---

## Phase 2: Game Mechanics Implementation

### Duration: 5-7 days

### Goals
- Complete word detection
- Scoring system
- Gravity system
- Collision detection
- Game over conditions

### Tasks

#### 2.1 Word Detection System
```typescript
// src/core/WordDetector.ts
export class WordDetector {
  constructor(private dictionary: DictionaryService) {}
  
  /**
   * Finds all valid words on the board
   * Returns words with their positions and orientation
   */
  detectWords(board: Cell[][]): DetectedWord[] {
    const words: DetectedWord[] = [];
    
    // Horizontal words
    words.push(...this.detectHorizontalWords(board));
    
    // Vertical words
    words.push(...this.detectVerticalWords(board));
    
    // Filter to valid dictionary words
    return words.filter(word => 
      this.dictionary.isValidWord(word.text)
    );
  }
  
  private detectHorizontalWords(board: Cell[][]): DetectedWord[] {
    // Improved algorithm: more efficient, handles edge cases
  }
  
  private detectVerticalWords(board: Cell[][]): DetectedWord[] {
    // Improved algorithm: more efficient, handles edge cases
  }
}
```

**Improvements from Example:**
1. **Better Algorithm**: Use sliding window instead of iterating every cell
2. **Performance**: O(n*m) instead of O(n*m*k) where k is word length
3. **Edge Cases**: Handle overlapping words correctly
4. **Validation**: Separate detection from validation (testable)

#### 2.2 Scoring System
```typescript
// src/utils/scoring.ts
export interface ScoreCalculation {
  baseScore: number;
  letterScore: number;
  lengthBonus: number;
  multiplier: number;
  finalScore: number;
}

export function calculateWordScore(
  word: string,
  options: {
    isVertical: boolean;
    comboCount: number;
    level: number;
    specialWordType?: SpecialWordType;
  }
): ScoreCalculation {
  // Calculate each component separately
  const letterScore = calculateLetterScore(word);
  const lengthBonus = calculateLengthBonus(word.length);
  const multiplier = calculateMultiplier(options);
  
  const finalScore = Math.round(
    (letterScore + lengthBonus) * multiplier
  );
  
  return {
    baseScore: letterScore + lengthBonus,
    letterScore,
    lengthBonus,
    multiplier,
    finalScore,
  };
}

// Pure functions - easily testable
function calculateLetterScore(word: string): number {
  return word.split('').reduce((sum, letter) => {
    return sum + LETTER_SCORES[letter.toUpperCase()] || 0;
  }, 0);
}
```

**Improvements:**
1. **Separation**: Scoring logic separate from game state
2. **Testability**: Pure functions, easy to unit test
3. **Transparency**: Return breakdown for debugging
4. **Type Safety**: Explicit return type

#### 2.3 Gravity System
```typescript
// src/core/Gravity.ts
export class Gravity {
  /**
   * Applies gravity to board - letters fall down
   * Returns true if any letters moved
   */
  apply(board: Cell[][]): boolean {
    let moved = false;
    
    // Process from bottom to top
    for (let row = BOARD_CONFIG.HEIGHT - 2; row >= 0; row--) {
      for (let col = 0; col < BOARD_CONFIG.WIDTH; col++) {
        if (this.canFall(board, row, col)) {
          this.fall(board, row, col);
          moved = true;
        }
      }
    }
    
    return moved;
  }
  
  /**
   * Applies gravity until stable (no more moves possible)
   */
  applyUntilStable(board: Cell[][]): void {
    let iterations = 0;
    const MAX_ITERATIONS = 100; // Safety limit
    
    while (this.apply(board) && iterations < MAX_ITERATIONS) {
      iterations++;
    }
    
    if (iterations >= MAX_ITERATIONS) {
      console.error('Gravity application exceeded max iterations');
    }
  }
  
  private canFall(board: Cell[][], row: number, col: number): boolean {
    // Check if cell has letter and space below
    return board[row][col].letter !== null &&
           row + 1 < BOARD_CONFIG.HEIGHT &&
           board[row + 1][col].letter === null;
  }
}
```

**Improvements:**
1. **Safety**: Max iterations to prevent infinite loops
2. **Efficiency**: Batch gravity application
3. **Clarity**: Separate methods for different operations
4. **Testable**: Can test gravity independently

#### 2.4 Collision Detection
```typescript
// src/utils/collision.ts
export function checkCollision(
  letter: FallingLetter,
  board: Cell[][],
  direction: 'down' | 'left' | 'right'
): boolean {
  const nextPosition = getNextPosition(letter.position, direction);
  
  // Boundary check
  if (!isValidPosition(nextPosition)) {
    return true; // Collision with boundary
  }
  
  // Cell check
  const cell = board[nextPosition.y][nextPosition.x];
  return cell.letter !== null; // Collision with existing letter
}

export function isValidPosition(pos: Position): boolean {
  return pos.x >= 0 &&
         pos.x < BOARD_CONFIG.WIDTH &&
         pos.y >= 0 &&
         pos.y < BOARD_CONFIG.HEIGHT;
}
```

**Improvements:**
1. **Reusable**: Works for all movement directions
2. **Clear**: Explicit boundary and cell checks
3. **Testable**: Pure functions

#### 2.5 Game Over Detection
```typescript
// src/core/GameEngine.ts
checkGameOver(): boolean {
  // Game over if top row has any letters
  const topRow = this.board.getRow(0);
  const hasLetters = topRow.some(cell => cell.letter !== null);
  
  if (hasLetters) {
    this.onGameOver();
    return true;
  }
  
  return false;
}
```

### Code Quality Standards (Phase 2)

#### Error Handling
```typescript
// Always handle errors explicitly
try {
  const words = wordDetector.detectWords(board);
  return words;
} catch (error) {
  console.error('Word detection failed:', error);
  // Return safe default instead of crashing
  return [];
}
```

#### Input Validation
```typescript
function calculateWordScore(word: string, options: ScoreOptions): number {
  // Validate input
  if (!word || word.length < BOARD_CONFIG.MIN_WORD_LENGTH) {
    throw new Error(`Invalid word: ${word}`);
  }
  
  if (options.level < 1) {
    throw new Error(`Invalid level: ${options.level}`);
  }
  
  // ... rest of function
}
```

#### Performance Optimization
```typescript
// Use memoization for expensive operations
const detectWordsMemo = useMemo(
  () => wordDetector.detectWords(board),
  [board, wordDetector] // Only recalculate when board changes
);
```

#### Memory Management
```typescript
// Clean up intervals/timeouts
useEffect(() => {
  const interval = setInterval(() => {
    // ...
  }, 1000);
  
  return () => clearInterval(interval); // Always clean up
}, []);
```

### Testing Requirements (Phase 2)

#### Unit Tests
```typescript
// tests/utils/scoring.test.ts
describe('calculateWordScore', () => {
  it('calculates basic score correctly', () => {
    const result = calculateWordScore('CAT', {
      isVertical: false,
      comboCount: 1,
      level: 1,
    });
    
    expect(result.finalScore).toBeGreaterThan(0);
    expect(result.letterScore).toBe(5); // C=3, A=1, T=1
  });
  
  it('applies vertical bonus', () => {
    const horizontal = calculateWordScore('CAT', { /* ... */, isVertical: false });
    const vertical = calculateWordScore('CAT', { /* ... */, isVertical: true });
    
    expect(vertical.finalScore).toBeGreaterThan(horizontal.finalScore);
  });
  
  it('handles empty string', () => {
    expect(() => calculateWordScore('', { /* ... */ })).toThrow();
  });
});
```

#### Integration Tests
```typescript
// tests/core/GameEngine.test.ts
describe('GameEngine', () => {
  let engine: GameEngine;
  
  beforeEach(() => {
    engine = new GameEngine();
  });
  
  it('detects words correctly', () => {
    // Set up board with word "CAT"
    // ...
    
    const words = engine.processWords();
    
    expect(words).toHaveLength(1);
    expect(words[0].text).toBe('CAT');
  });
  
  it('applies gravity correctly', () => {
    // Set up board with floating letter
    // ...
    
    engine.applyGravity();
    
    // Check letter fell down
    // ...
  });
});
```

### Review Checklist (Phase 2)
- [ ] Word detection works correctly (horizontal + vertical)
- [ ] Scoring calculates correctly (all multipliers)
- [ ] Gravity works correctly (letters fall, no floating)
- [ ] Collision detection prevents invalid moves
- [ ] Game over triggers correctly
- [ ] All edge cases handled (empty board, single letter, etc.)
- [ ] Performance: Word detection < 16ms (60 FPS)
- [ ] Tests: > 90% coverage for core logic
- [ ] No memory leaks
- [ ] Error handling for all edge cases

### Deliverables
- ✅ Complete word detection system
- ✅ Full scoring system with all multipliers
- ✅ Gravity system working correctly
- ✅ Collision detection
- ✅ Game over conditions
- ✅ Comprehensive test suite

---

## Phase 3: Power-Ups & Special Features

### Duration: 4-6 days

### Goals
- All 5 power-ups implemented
- Power-up effects working correctly
- Visual feedback for power-ups
- Balanced power-up mechanics

### Tasks

#### 3.1 Power-Up System Architecture
```typescript
// src/core/powerups/PowerUpSystem.ts
export type PowerUpType = 'bomb' | 'lightning' | 'freeze' | 'wind' | 'blank';

export interface PowerUp {
  type: PowerUpType;
  uses: number;
  isAvailable: boolean;
}

export interface PowerUpEffect {
  type: PowerUpType;
  duration?: number; // For timed effects like freeze
  position?: Position; // For position-based effects like bomb
  metadata?: Record<string, unknown>; // Type-specific data
}

export class PowerUpSystem {
  private powerUps: Map<PowerUpType, PowerUp> = new Map();
  private activeEffects: PowerUpEffect[] = [];
  
  constructor() {
    this.initializePowerUps();
  }
  
  canUse(type: PowerUpType): boolean {
    const powerUp = this.powerUps.get(type);
    return powerUp?.isAvailable && powerUp.uses > 0;
  }
  
  use(type: PowerUpType, context: PowerUpContext): PowerUpEffect | null {
    if (!this.canUse(type)) {
      return null;
    }
    
    const powerUp = this.powerUps.get(type)!;
    powerUp.uses--;
    powerUp.isAvailable = powerUp.uses > 0;
    
    return this.createEffect(type, context);
  }
  
  private createEffect(type: PowerUpType, context: PowerUpContext): PowerUpEffect {
    switch (type) {
      case 'bomb':
        return this.createBombEffect(context);
      case 'lightning':
        return this.createLightningEffect(context);
      // ... etc
    }
  }
}
```

**Improvements:**
1. **Centralized**: All power-up logic in one system
2. **Type-Safe**: Discriminated unions for effects
3. **Extensible**: Easy to add new power-ups
4. **Testable**: Can test power-up logic independently

#### 3.2 Individual Power-Up Implementations

**Bomb Power-Up:**
```typescript
// src/core/powerups/BombPowerUp.ts
export class BombPowerUp implements PowerUpEffectHandler {
  execute(board: Cell[][], position: Position): BoardUpdate {
    const cellsToClear: Position[] = [];
    
    // Cross pattern: center + 2 left + 2 right + 2 down
    cellsToClear.push(position);
    
    // Left (2 cells)
    for (let i = 1; i <= 2; i++) {
      const pos = { x: position.x - i, y: position.y };
      if (isValidPosition(pos)) {
        cellsToClear.push(pos);
      }
    }
    
    // Right (2 cells)
    for (let i = 1; i <= 2; i++) {
      const pos = { x: position.x + i, y: position.y };
      if (isValidPosition(pos)) {
        cellsToClear.push(pos);
      }
    }
    
    // Down (2 cells)
    for (let i = 1; i <= 2; i++) {
      const pos = { x: position.x, y: position.y + i };
      if (isValidPosition(pos)) {
        cellsToClear.push(pos);
      }
    }
    
    return {
      cellsToClear,
      score: 100,
      animation: 'bomb-explosion',
    };
  }
}
```

**Lightning Power-Up:**
```typescript
// src/core/powerups/LightningPowerUp.ts
export class LightningPowerUp implements PowerUpEffectHandler {
  execute(board: Cell[][], column: number): BoardUpdate {
    const cellsToClear: Position[] = [];
    
    // Clear entire column
    for (let row = 0; row < BOARD_CONFIG.HEIGHT; row++) {
      if (board[row][column].letter !== null) {
        cellsToClear.push({ x: column, y: row });
      }
    }
    
    return {
      cellsToClear,
      score: 100,
      animation: 'lightning-strike',
    };
  }
}
```

**Freeze Power-Up:**
```typescript
// src/core/powerups/FreezePowerUp.ts
export class FreezePowerUp implements PowerUpEffectHandler {
  execute(board: Cell[][]): BoardUpdate {
    const DURATION_MS = 10000; // 10 seconds
    const SPEED_MULTIPLIER = 1.5; // 50% slower
    
    return {
      cellsToClear: [],
      score: 0,
      animation: 'freeze-effect',
      timedEffect: {
        type: 'slow-down',
        duration: DURATION_MS,
        multiplier: SPEED_MULTIPLIER,
      },
    };
  }
}
```

**Wind Power-Up:**
```typescript
// src/core/powerups/WindPowerUp.ts
export class WindPowerUp implements PowerUpEffectHandler {
  execute(board: Cell[][]): BoardUpdate {
    const bottomRow = BOARD_CONFIG.HEIGHT - 1;
    const cellsToClear: Position[] = [];
    
    // Clear entire bottom row
    for (let col = 0; col < BOARD_CONFIG.WIDTH; col++) {
      cellsToClear.push({ x: col, y: bottomRow });
    }
    
    return {
      cellsToClear,
      score: 100,
      animation: 'wind-sweep',
    };
  }
}
```

**Blank/Letter Choice Power-Up:**
```typescript
// src/core/powerups/BlankPowerUp.ts
export class BlankPowerUp implements PowerUpEffectHandler {
  execute(selectedLetter: Letter): BoardUpdate {
    return {
      cellsToClear: [],
      score: 0,
      nextLetterOverride: selectedLetter,
      animation: null,
    };
  }
}
```

### Code Quality Standards (Phase 3)

#### Design Patterns
```typescript
// Strategy Pattern for power-ups
interface PowerUpStrategy {
  execute(context: PowerUpContext): BoardUpdate;
}

class BombStrategy implements PowerUpStrategy { }
class LightningStrategy implements PowerUpStrategy { }
// ... etc

// Factory Pattern for creating power-ups
class PowerUpFactory {
  create(type: PowerUpType): PowerUpStrategy {
    switch (type) {
      case 'bomb': return new BombStrategy();
      case 'lightning': return new LightningStrategy();
      // ...
    }
  }
}
```

#### State Management
```typescript
// Immutable updates for power-up effects
function applyPowerUpEffect(
  board: Cell[][],
  effect: PowerUpEffect
): Cell[][] {
  // Create new board instead of mutating
  const newBoard = board.map(row => [...row]);
  
  // Apply effect to new board
  // ...
  
  return newBoard;
}
```

### Testing Requirements (Phase 3)

#### Power-Up Tests
```typescript
describe('BombPowerUp', () => {
  it('clears correct pattern', () => {
    const bomb = new BombPowerUp();
    const board = createTestBoard();
    const position = { x: 4, y: 4 };
    
    const update = bomb.execute(board, position);
    
    expect(update.cellsToClear).toHaveLength(7); // Center + 6 around
    expect(update.score).toBe(100);
  });
  
  it('respects board boundaries', () => {
    const bomb = new BombPowerUp();
    const board = createTestBoard();
    const position = { x: 0, y: 0 }; // Top-left corner
    
    const update = bomb.execute(board, position);
    
    // Should not clear cells outside board
    update.cellsToClear.forEach(pos => {
      expect(isValidPosition(pos)).toBe(true);
    });
  });
});
```

### Review Checklist (Phase 3)
- [ ] All 5 power-ups work correctly
- [ ] Power-up effects visually clear
- [ ] Power-up usage tracking accurate
- [ ] Power-ups balanced (not too powerful/weak)
- [ ] Animations smooth (60 FPS)
- [ ] Sound effects play correctly
- [ ] No bugs when using power-ups
- [ ] Edge cases handled (empty board, full board, etc.)
- [ ] Tests: All power-ups have unit tests
- [ ] Performance: Power-up effects < 16ms

### Deliverables
- ✅ All 5 power-ups implemented
- ✅ Power-up system architecture
- ✅ Visual effects for each power-up
- ✅ Sound integration
- ✅ Test coverage for power-ups

---

## Phase 4: UI/UX & Visual Polish

### Duration: 5-7 days

### Goals
- Cyberpunk visual design implemented
- Smooth animations (60 FPS)
- Responsive design (all iframe sizes)
- Clear visual feedback
- Accessible UI

### Tasks

#### 4.1 Cyberpunk Theme Implementation
```typescript
// src/styles/themes/cyberpunk.ts
export const cyberpunkTheme = {
  colors: {
    background: {
      primary: '#0a0e27',
      secondary: '#0d1117',
      accent: '#1a1a2e',
    },
    neon: {
      cyan: '#00d9ff',
      pink: '#ff006e',
      purple: '#b300ff',
    },
    text: {
      primary: '#00d9ff',
      secondary: '#ffffff',
      accent: '#ff006e',
    },
  },
  effects: {
    glow: {
      small: '0 0 10px rgba(0, 217, 255, 0.5)',
      medium: '0 0 20px rgba(0, 217, 255, 0.3)',
      large: '0 0 30px rgba(0, 217, 255, 0.1)',
    },
  },
  typography: {
    fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', monospace",
    sizes: {
      title: 'clamp(32px, 6vw, 64px)',
      heading: 'clamp(24px, 4vw, 32px)',
      body: 'clamp(14px, 2vw, 18px)',
    },
  },
} as const;
```

#### 4.2 Responsive Design
```css
/* Base styles work at all sizes */
.game-board {
  /* Use clamp() for responsive sizing */
  width: clamp(320px, 90vw, 800px);
  height: clamp(480px, 90vh, 1200px);
  
  /* Grid scales proportionally */
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(12, 1fr);
}

.cell {
  /* Responsive cell size */
  width: clamp(24px, 4vw, 48px);
  height: clamp(24px, 4vw, 48px);
  font-size: clamp(16px, 3vw, 32px);
}

/* Test at all CrazyGames iframe sizes */
@media (max-width: 907px) { /* 907x510 */ }
@media (min-width: 1920px) { /* 1920x1080 fullscreen */ }
```

#### 4.3 Animation System
```typescript
// src/components/animations/AnimationSystem.tsx
export interface AnimationConfig {
  type: 'fade' | 'slide' | 'scale' | 'glow';
  duration: number;
  easing: string;
  delay?: number;
}

export function useAnimation(config: AnimationConfig) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const start = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), config.duration);
  }, [config]);
  
  return { isAnimating, start };
}

// Use CSS transforms for smooth animations (GPU accelerated)
.cell-removing {
  animation: fadeOut 400ms ease-out;
  transform: scale(0.8);
  opacity: 0;
}

@keyframes fadeOut {
  to {
    transform: scale(0);
    opacity: 0;
  }
}
```

#### 4.4 Visual Feedback
```typescript
// Immediate feedback for all player actions
const handleMove = useCallback(() => {
  // Visual: Letter moves instantly
  moveLetter();
  
  // Audio: Play sound immediately (< 50ms latency)
  soundService.play('move');
  
  // Haptic: Vibrate if available
  if (supportsVibration) {
    navigator.vibrate(50);
  }
  
  // Animation: Smooth transition
  // (handled by CSS transitions)
}, []);
```

### Code Quality Standards (Phase 4)

#### Performance
```typescript
// Use CSS transforms instead of changing position (GPU accelerated)
// ❌ BAD: Changes layout
style={{ left: `${x}px`, top: `${y}px` }}

// ✅ GOOD: Uses transform (GPU accelerated)
style={{ transform: `translate(${x}px, ${y}px)` }}

// Use will-change for animated elements
.animated-element {
  will-change: transform, opacity;
}
```

#### Accessibility
```typescript
// Keyboard navigation
<button
  aria-label="Use Bomb Power-Up"
  aria-disabled={!canUseBomb}
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleBombClick();
    }
  }}
>
  💣
</button>

// Screen reader support
<div role="status" aria-live="polite">
  {announcements}
</div>
```

### Review Checklist (Phase 4)
- [ ] Visual design matches cyberpunk theme
- [ ] All animations run at 60 FPS
- [ ] Responsive at all iframe sizes (907x510 to 1920x1080)
- [ ] Text readable at devicePixelRatio:1
- [ ] Colors have sufficient contrast (WCAG AA)
- [ ] Visual feedback for all actions (< 50ms)
- [ ] No layout shifts (CLS = 0)
- [ ] Smooth scrolling/animations
- [ ] Mobile-friendly (touch targets > 44px)
- [ ] Accessibility: Keyboard navigation works

### Deliverables
- ✅ Complete cyberpunk visual design
- ✅ Responsive layout (all sizes)
- ✅ Smooth animations (60 FPS)
- ✅ Visual feedback system
- ✅ Accessible UI

---

## Phase 5: Integration & Optimization

### Duration: 4-6 days

### Goals
- CrazyGames SDK integrated
- Assets optimized
- Bundle size < 20MB
- Performance optimized
- All requirements met

### Tasks

#### 5.1 CrazyGames SDK Integration
```typescript
// src/services/CrazyGamesService.ts
// (See 11-IMPLEMENTATION-GUIDE.md for full implementation)

// Key integration points:
// 1. Initialize on mount
// 2. gameplayStart() when first letter falls
// 3. gameplayStop() on game over
// 4. Handle SDK errors gracefully
```

#### 5.2 Asset Optimization

**Sounds:**
- [ ] Compress all MP3s to 48-64kbps
- [ ] Trim silence from start/end
- [ ] Keep music loops to 15-30 seconds
- [ ] Target total: < 2MB

**Images:**
- [ ] Convert PNGs to WebP where possible
- [ ] Optimize SVGs (remove metadata)
- [ ] Use appropriate sizes (not oversized)
- [ ] Target total: < 500KB

**Dictionary:**
- [ ] Reduce to 2000-5000 common words
- [ ] Embed as TypeScript array
- [ ] Target size: < 100KB

**Lottie:**
- [ ] Keep only essential animations
- [ ] Optimize JSON files
- [ ] Consider CSS animations for simple effects
- [ ] Target total: < 200KB

#### 5.3 Bundle Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'game-core': ['./src/core'],
          'powerups': ['./src/core/powerups'],
        },
      },
    },
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    // Asset optimization
    assetsInlineLimit: 4096, // Inline small assets
    chunkSizeWarningLimit: 1000,
  },
});
```

#### 5.4 Performance Optimization
```typescript
// Use React.memo for expensive components
export const GameCell = React.memo(({ cell, position }: Props) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.cell.letter === nextProps.cell.letter &&
         prevProps.cell.isRemoving === nextProps.cell.isRemoving;
});

// Use useMemo for expensive calculations
const detectedWords = useMemo(
  () => wordDetector.detectWords(board),
  [board] // Only recalculate when board changes
);

// Debounce/throttle frequent updates
const debouncedScoreUpdate = useMemo(
  () => debounce(updateScore, 100),
  []
);
```

#### 5.5 Memory Optimization
```typescript
// Clean up resources
useEffect(() => {
  const interval = setInterval(/* ... */);
  const timeout = setTimeout(/* ... */);
  const animationFrame = requestAnimationFrame(/* ... */);
  
  return () => {
    clearInterval(interval);
    clearTimeout(timeout);
    cancelAnimationFrame(animationFrame);
  };
}, []);

// Avoid memory leaks in event listeners
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('resize', handler);
  
  return () => window.removeEventListener('resize', handler);
}, []);
```

### Code Quality Standards (Phase 5)

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer

# Check for large dependencies
npm run analyze
```

#### Performance Testing
```typescript
// Measure FPS
class FPSCounter {
  private frames = 0;
  private lastTime = performance.now();
  
  tick() {
    this.frames++;
    const now = performance.now();
    
    if (now >= this.lastTime + 1000) {
      const fps = this.frames;
      this.frames = 0;
      this.lastTime = now;
      
      if (fps < 60) {
        console.warn(`Low FPS: ${fps}`);
      }
    }
  }
}
```

### Review Checklist (Phase 5)
- [ ] CrazyGames SDK integrated correctly
- [ ] gameplayStart() triggers at correct time
- [ ] gameplayStop() triggers on game over
- [ ] Bundle size < 20MB initial download
- [ ] Total assets < 250MB
- [ ] File count < 1500
- [ ] Performance: 60 FPS consistently
- [ ] Memory: No leaks (test 10+ minutes)
- [ ] All assets optimized
- [ ] Works on Chrome, Edge, Safari
- [ ] Works on mobile (800x450)
- [ ] Works on all iframe sizes

### Deliverables
- ✅ CrazyGames SDK fully integrated
- ✅ Optimized assets
- ✅ Bundle size < 20MB
- ✅ Performance optimized
- ✅ All requirements met

---

## Phase 6: Testing & QA

### Duration: 3-5 days

### Goals
- Comprehensive test coverage
- All bugs fixed
- Performance validated
- Requirements verified
- Ready for submission

### Tasks

#### 6.1 Test Coverage
```typescript
// Unit Tests: > 90% coverage
// Integration Tests: All critical paths
// E2E Tests: Complete game flow
// Performance Tests: FPS, memory, bundle size
// Compatibility Tests: All browsers/devices
```

#### 6.2 Bug Fixing
- [ ] Fix all critical bugs
- [ ] Fix all high-priority bugs
- [ ] Review and fix medium-priority bugs
- [ ] Document known issues (if any)

#### 6.3 Requirements Verification

**Technical Requirements:**
- [ ] File size < 250MB total
- [ ] Initial download < 20MB
- [ ] File count < 1500
- [ ] All paths relative
- [ ] Works on Chrome, Edge, Safari
- [ ] Works on mobile

**Gameplay Requirements:**
- [ ] Lands in gameplay immediately (0 clicks)
- [ ] Readable at all iframe sizes
- [ ] Consistent physics (frame-rate independent)
- [ ] English language support
- [ ] Intuitive controls
- [ ] Smooth performance
- [ ] Original content
- [ ] No custom fullscreen button
- [ ] No cross-promotion
- [ ] PEGI 12 compliant

**Quality Guidelines:**
- [ ] Clear onboarding (skippable)
- [ ] Clear goals
- [ ] Easy to learn
- [ ] Responsive to actions
- [ ] Balanced difficulty
- [ ] High-quality graphics
- [ ] High-quality audio

### Code Quality Standards (Phase 6)

#### Code Review Process
1. **Self-Review**: Developer reviews own code
2. **Automated Checks**: ESLint, TypeScript, tests
3. **Peer Review**: Another developer reviews (if available)
4. **Final Review**: Senior developer/lead reviews

#### Review Criteria
- ✅ Code follows style guide
- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ Tests pass
- ✅ Code coverage meets threshold
- ✅ Performance acceptable
- ✅ No security issues
- ✅ Documentation complete

### Testing Matrix

| Test Category | Coverage Target | Tools |
|--------------|----------------|-------|
| Unit Tests | > 90% | Vitest |
| Integration Tests | Critical paths | Vitest |
| E2E Tests | Complete flows | Playwright |
| Performance | 60 FPS, < 20MB | DevTools, Lighthouse |
| Compatibility | All browsers | BrowserStack |
| Accessibility | WCAG AA | axe DevTools |

### Review Checklist (Phase 6)
- [ ] All tests passing
- [ ] Test coverage > 90%
- [ ] No critical bugs
- [ ] Performance validated (60 FPS)
- [ ] Bundle size verified (< 20MB)
- [ ] All requirements met
- [ ] Code review complete
- [ ] Documentation complete
- [ ] Ready for submission

### Deliverables
- ✅ Comprehensive test suite
- ✅ All bugs fixed
- ✅ Performance validated
- ✅ Requirements verified
- ✅ Code review complete
- ✅ Ready for CrazyGames submission

---

## Phase 7: Polish & Submission

### Duration: 2-3 days

### Goals
- Final polish
- Submission preparation
- Marketing materials
- Documentation

### Tasks

#### 7.1 Final Polish
- [ ] Visual polish (animations, effects)
- [ ] Audio polish (volume balance, mixing)
- [ ] UI polish (spacing, alignment)
- [ ] Performance polish (optimizations)

#### 7.2 Submission Preparation
- [ ] Game cover image (required dimensions)
- [ ] Game description
- [ ] Screenshots (minimum 4)
- [ ] Video trailer (optional but recommended)
- [ ] Tags/categories
- [ ] Age rating confirmation (PEGI 12)

#### 7.3 Documentation
- [ ] README.md
- [ ] CHANGELOG.md
- [ ] API documentation (if needed)
- [ ] Deployment guide

### Deliverables
- ✅ Polished game
- ✅ Submission materials
- ✅ Complete documentation
- ✅ Ready for CrazyGames submission

---

## Code Quality Best Practices

### TypeScript Standards

#### Strict Mode
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### Type Safety
```typescript
// ❌ BAD: Using 'any'
function processData(data: any) { }

// ✅ GOOD: Explicit types
function processData(data: GameState) { }

// ✅ GOOD: Generic types when needed
function processData<T extends GameState>(data: T): T { }
```

#### Discriminated Unions
```typescript
// For state machines, use discriminated unions
type GameState =
  | { type: 'loading'; progress: number }
  | { type: 'playing'; score: number }
  | { type: 'paused'; reason: string }
  | { type: 'gameOver'; finalScore: number };

function handleState(state: GameState) {
  switch (state.type) {
    case 'loading':
      return state.progress; // TypeScript knows state has 'progress'
    case 'playing':
      return state.score; // TypeScript knows state has 'score'
    // ...
  }
}
```

### React Best Practices

#### Component Structure
```typescript
// ✅ GOOD: Small, focused components
export const GameCell: React.FC<CellProps> = ({ cell, position }) => {
  return (
    <div className={cn('cell', { 'has-letter': cell.letter })}>
      {cell.letter}
    </div>
  );
};

// ❌ BAD: Large, complex components
export const GameBoard: React.FC = () => {
  // 500+ lines of logic mixed together
};
```

#### Hooks Best Practices
```typescript
// ✅ GOOD: Custom hooks for reusable logic
function useGameLoop(engine: GameEngine) {
  // Logic here
}

// ✅ GOOD: Memoize expensive calculations
const score = useMemo(() => calculateScore(word, options), [word, options]);

// ✅ GOOD: Memoize callbacks passed to children
const handleClick = useCallback(() => {
  // Handler
}, [dependencies]);

// ❌ BAD: Creating new functions in render
<ChildComponent onClick={() => handleClick()} /> // New function every render

// ✅ GOOD: Memoized callback
<ChildComponent onClick={handleClick} />
```

#### State Management
```typescript
// ✅ GOOD: Lift state only as high as needed
// ✅ GOOD: Use reducer for complex state
const [state, dispatch] = useReducer(gameReducer, initialState);

// ✅ GOOD: Separate concerns (UI state vs game state)
const [isPaused, setIsPaused] = useState(false); // UI state
const [gameState, setGameState] = useState<GameState>(); // Game state
```

### Performance Best Practices

#### Avoid Unnecessary Re-renders
```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // Component
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Batch state updates
// ❌ BAD: Multiple re-renders
setScore(score + 10);
setLevel(level + 1);

// ✅ GOOD: Single re-render
setGameState(prev => ({
  ...prev,
  score: prev.score + 10,
  level: prev.level + 1,
}));
```

#### Optimize Renders
```typescript
// Use keys correctly for lists
{items.map(item => (
  <Item key={item.id} data={item} /> // Stable, unique key
))}

// Avoid inline object/array creation in render
// ❌ BAD: New object every render
<div style={{ color: 'red' }} />

// ✅ GOOD: Stable reference
const style = { color: 'red' };
<div style={style} />
```

### Error Handling

#### Error Boundaries
```typescript
// Catch React errors
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Game error:', error, errorInfo);
    // Log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

#### Graceful Degradation
```typescript
// Handle missing features gracefully
function useVibration() {
  return useCallback((pattern: number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
    // Silently fail if not supported
  }, []);
}
```

### Testing Best Practices

#### Test Structure
```typescript
// Arrange-Act-Assert pattern
describe('calculateScore', () => {
  it('calculates score correctly', () => {
    // Arrange
    const word = 'CAT';
    const options = { level: 1, comboCount: 1 };
    
    // Act
    const result = calculateScore(word, options);
    
    // Assert
    expect(result).toBeGreaterThan(0);
  });
});
```

#### Test Coverage
- Unit tests: Pure functions, utilities
- Integration tests: Component interactions
- E2E tests: Complete user flows
- Performance tests: FPS, memory, bundle size

### Security Best Practices

#### Input Validation
```typescript
// Always validate user input
function processWord(word: string): boolean {
  if (typeof word !== 'string') {
    return false;
  }
  
  if (word.length < MIN_WORD_LENGTH || word.length > MAX_WORD_LENGTH) {
    return false;
  }
  
  if (!/^[a-z]+$/i.test(word)) {
    return false;
  }
  
  return true;
}
```

#### XSS Prevention
```typescript
// React automatically escapes, but be careful with dangerouslySetInnerHTML
// ❌ BAD: Unsafe
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ GOOD: Use React's built-in escaping
<div>{userInput}</div>
```

---

## Review & Check Policy

### Pre-Commit Checks

**Automated:**
```bash
# Husky pre-commit hook
npm run lint        # ESLint
npm run type-check  # TypeScript
npm run test        # Unit tests
npm run format-check # Prettier
```

**Manual:**
- [ ] Code follows style guide
- [ ] No console.logs (use proper logging)
- [ ] No commented-out code
- [ ] No TODOs without tickets

### Code Review Process

#### Self-Review Checklist
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] No ESLint warnings
- [ ] Code is readable and well-commented
- [ ] Performance considerations addressed
- [ ] Edge cases handled

#### Peer Review Checklist
- [ ] Code follows architecture patterns
- [ ] No code smells or anti-patterns
- [ ] Error handling is appropriate
- [ ] Tests cover edge cases
- [ ] Documentation is clear
- [ ] Performance is acceptable

### Testing Policy

#### Before Merging
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual testing on target browsers
- [ ] Performance testing (FPS, memory)
- [ ] Accessibility testing (keyboard navigation)

#### Before Release
- [ ] Full regression test
- [ ] Performance benchmark
- [ ] Compatibility test (all browsers)
- [ ] Load test (if applicable)
- [ ] Security review

### Quality Gates

**Phase Completion Criteria:**
- ✅ All tests passing
- ✅ Code coverage > threshold
- ✅ No critical bugs
- ✅ Performance targets met
- ✅ Code review approved
- ✅ Documentation updated

**Release Criteria:**
- ✅ All phases complete
- ✅ All requirements met
- ✅ Performance validated
- ✅ Compatibility verified
- ✅ Security reviewed
- ✅ Ready for submission

---

## Continuous Improvement

### Metrics to Track
- **Performance**: FPS, load time, bundle size
- **Quality**: Test coverage, bug count, code smells
- **User Experience**: Engagement, completion rate, error rate

### Retrospective Process
After each phase:
1. What went well?
2. What could be improved?
3. What did we learn?
4. Action items for next phase

### Code Refactoring
- Regular refactoring sessions
- Address technical debt
- Improve code quality
- Optimize performance

---

This comprehensive plan ensures a high-quality, maintainable, performant game that meets all CrazyGames requirements while following industry best practices.
