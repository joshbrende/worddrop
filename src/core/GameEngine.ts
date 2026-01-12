/**
 * GameEngine - Main game engine
 * Framework-agnostic core game logic
 * Phase 1: Basic falling letters and movement
 */

import { Board } from './Board';
import { Letter } from './Letter';
import { Gravity } from './Gravity';
import { WordDetector } from './WordDetector';
import { PowerUpSystem } from './PowerUpSystem';
import { LetterGenerator, getLetterGenerator } from './LetterGenerator';
import type { Position, DetectedWord, PowerUp, PowerUpType, Letter as LetterType } from '../types/game';
import { BOARD_CONFIG, DROP_CONFIG, SCORING_CONFIG, LEVEL_CONFIG } from '../constants/game';
import { POWER_UP_CONFIG } from '../constants/powerups';
import { ANIMATION_DURATIONS } from '../constants/animations';
import { calculateWordScore, getMilestoneBonus } from '../utils/scoring';
import dictionaryService from '../services/DictionaryService';
import { debugLog, debugWarn, debugError } from '../utils/debug';
import soundService from '../services/SoundService';
import { SOUND_MAPPINGS } from '../constants/sounds';
import { gameApiService, type WordOfTheDay, type SponsorQuestion } from '../services/GameApiService';

export interface ScorePopup {
  id: number;
  score: number;
  position: { x: number; y: number };
  combo?: number;
  word?: string; // Word that was created
}

export interface GameEngineState {
  board: ReturnType<Board['getCells']>;
  currentLetter: Letter | null;
  nextLetter: Letter | null;
  score: number;
  level: number;
  comboCount: number;
  isGameOver: boolean;
  isPaused: boolean;
  wordsFound: string[];
  scorePopups: ScorePopup[];
  powerUps: PowerUp[]; // Power-up state
  isFrozen: boolean; // Freeze effect active
  isLevelingUp?: boolean; // Level-up banner is showing
  levelUpData?: {
    newLevel: number;
    points: number;
    themeId: string;
  } | null;
  // Game modes
  wordOfTheDay: WordOfTheDay | null;
  currentSponsorQuestion: SponsorQuestion | null;
  showTriviaModal: boolean;
  foundWordOfTheDay: boolean; // Track if word of the day was found
  foundSponsorWord: boolean; // Track if sponsor word was found
  pendingSponsorWord: string | null; // Word to find after answering trivia correctly
  sponsorTriviaAnswered: boolean; // Track if sponsor trivia was answered correctly
  achievements: string[]; // Achievements unlocked during this game
  maxCombo: number; // Maximum combo reached during this game
}

export class GameEngine {
  private board: Board;
  private currentLetter: Letter | null = null;
  private nextLetter: Letter | null = null;
  private score: number = 0;
  private level: number = 1;
  private comboCount: number = 0;
  private isGameOver: boolean = false;
  private isPaused: boolean = false;
  private wordsFound: string[] = [];
  private totalWordsFound: number = 0;
  private scorePopups: ScorePopup[] = [];
  private nextPopupId: number = 0;

  private gravity: Gravity;
  private wordDetector: WordDetector;
  private powerUpSystem: PowerUpSystem;
  private letterGenerator: LetterGenerator;

  private lastDropTime: number = 0;
  private dropInterval: number = DROP_CONFIG.BASE_INTERVAL;
  private lastWordTime: number = 0; // For combo timeout
  private wordsBeingRemoved: Set<string> = new Set(); // Track words currently being removed
  private removalTimeoutId: number | null = null; // Timeout for word removal animation
  private cascadeDepth: number = 0; // Track cascade depth to prevent infinite loops
  private maxCascadeDepth: number = 20; // Maximum cascade iterations
  private isFrozen: boolean = false; // Freeze effect active
  private freezeTimeoutId: number | null = null; // Timeout for freeze effect
  private freezeIntervalMultiplier: number = 1.0; // Freeze speed multiplier
  private isLevelingUp: boolean = false; // Level-up banner is showing
  private levelUpData: {
    newLevel: number;
    points: number;
    themeId: string;
  } | null = null;

  // Game modes state
  private wordOfTheDay: WordOfTheDay | null = null;
  private currentSponsorQuestion: SponsorQuestion | null = null;
  private showTriviaModal: boolean = false;
  private foundWordOfTheDay: boolean = false;
  private foundSponsorWord: boolean = false;
  private pendingSponsorWord: string | null = null; // Word to find after answering trivia correctly
  private sponsorTriviaAnswered: boolean = false; // Track if sponsor trivia was answered correctly
  // private sponsorQuestionsQueue: SponsorQuestion[] = []; // Unused
  private achievements: string[] = []; // Achievements unlocked during this game
  private maxCombo: number = 0; // Maximum combo reached during this game // Queue of sponsor questions to show
  private gameStartTime: number = Date.now();
  private lastSponsorQuestionTime: number = 0; // Track when last sponsor question was shown
  private sponsorQuestionInterval: number = 30000; // Show sponsor question every 30 seconds
  private gameMode: 'normal' | 'word-of-day' | 'sponsor-trivia' = 'normal'; // Current game mode

  private stateChangeCallback?: (state: GameEngineState) => void;

  constructor(gameMode: 'normal' | 'word-of-day' | 'sponsor-trivia' = 'normal') {
    this.gameMode = gameMode;
    this.board = new Board();
    this.gravity = new Gravity();
    this.wordDetector = new WordDetector();
    this.powerUpSystem = new PowerUpSystem();
    this.letterGenerator = getLetterGenerator();
    this.gameStartTime = Date.now();

    // Dictionary should already be initialized by App component
    // Just verify it's loaded (won't re-initialize if already loading/loaded)
    if (!dictionaryService.isLoaded()) {
      dictionaryService.initialize().catch(error => {
        debugError('Dictionary not yet loaded in GameEngine:', error);
      });
    }

    // Load game modes data (async, don't wait)
    this.loadGameModesData();

    // Create game session (async, don't wait)
    this.createGameSession();

    // Spawn the first falling letter and preview letter to start the game
    this.spawnNextLetter(); // Spawn preview letter first
    if (this.nextLetter) {
      // Make preview letter the current falling letter
      this.currentLetter = this.nextLetter;
      this.nextLetter = null;
      // Spawn new preview letter
      this.spawnNextLetter();
      debugLog(`🎮 Game started - first letter spawned: ${this.currentLetter.letter}`);
    }
    this.lastWordTime = Date.now();
    this.lastDropTime = 0; // Reset drop timer for first letter

    // Notify initial state so UI updates immediately
    this.notifyStateChange();
  }

  /**
   * Set callback for state changes
   */
  setStateChangeCallback(callback: (state: GameEngineState) => void): void {
    this.stateChangeCallback = callback;
  }

  /**
   * Update game loop (called every frame)
   */
  update(deltaTime: number): void {
    if (this.isPaused || this.isGameOver) {
      return;
    }

    // Check if we should show a sponsor question (only in sponsor-trivia mode)
    if (this.gameMode === 'sponsor-trivia') {
      this.checkForSponsorQuestion();
    }

    // Don't update falling letters while words are being removed
    // This prevents conflicts during word removal animation and gravity
    if (this.removalTimeoutId !== null) {
      // Still check combo timeout even during word removal
      const now = Date.now();
      if (now - this.lastWordTime > SCORING_CONFIG.MULTIPLIERS.COMBO.RESET_TIME) {
        if (this.comboCount > 0) {
          this.comboCount = 0;
          this.notifyStateChange();
        }
      }
      return; // Pause game loop during word removal
    }

    // Check combo timeout (5 seconds)
    const now = Date.now();
    if (now - this.lastWordTime > SCORING_CONFIG.MULTIPLIERS.COMBO.RESET_TIME) {
      if (this.comboCount > 0) {
        this.comboCount = 0;
        this.notifyStateChange();
      }
    }

    // Only update falling letter if we have one
    if (!this.currentLetter) {
      return;
    }

    this.lastDropTime += deltaTime;

    // Apply freeze effect multiplier to drop interval (freeze makes it slower = longer interval)
    const effectiveDropInterval = this.dropInterval * this.freezeIntervalMultiplier;

    // Move letter down ONE cell at a time when interval elapses
    if (this.lastDropTime >= effectiveDropInterval) {
      this.fallLetterOneCell();
      this.lastDropTime = 0;
    }

    this.notifyStateChange();
  }

  /**
   * Move current letter left or right
   */
  moveLetter(direction: 'left' | 'right'): boolean {
    if (!this.currentLetter || this.isPaused || this.isGameOver) {
      return false;
    }

    const newPosition: Position = {
      x: direction === 'left'
        ? this.currentLetter.position.x - 1
        : this.currentLetter.position.x + 1,
      y: this.currentLetter.position.y,
    };

    if (this.canMoveTo(newPosition)) {
      this.currentLetter.moveTo(newPosition);
      soundService.play(SOUND_MAPPINGS.MOVE);
      this.notifyStateChange();
      return true;
    }

    return false;
  }

  /**
   * Move falling letter down one cell (called by update loop)
   */
  private fallLetterOneCell(): void {
    if (!this.currentLetter || this.isPaused || this.isGameOver) {
      return;
    }

    // Try to move down one cell
    const nextPosition: Position = {
      x: this.currentLetter.position.x,
      y: this.currentLetter.position.y + 1, // Increase Y to go DOWN
    };

    // Check if we can move down
    if (this.canMoveTo(nextPosition)) {
      // Move down one cell
      this.currentLetter.moveTo(nextPosition);
    } else {
      // Can't move down - letter has landed (hit bottom or another letter)
      this.landLetter();
    }
  }

  /**
   * Drop letter faster (fast drop) - player action
   * Moves down one cell at a time instead of instant drop (slower, more controllable)
   */
  dropLetter(): void {
    if (!this.currentLetter || this.isPaused || this.isGameOver) {
      return;
    }

    // Move down one cell instead of instant drop (makes it slower and more controllable)
    const nextPosition: Position = {
      x: this.currentLetter.position.x,
      y: this.currentLetter.position.y + 1,
    };

    if (this.canMoveTo(nextPosition)) {
      // Can move down - move one cell
      this.currentLetter.moveTo(nextPosition);
      soundService.play(SOUND_MAPPINGS.LETTER_DROP);
      this.notifyStateChange();
    } else {
      // Can't move down - letter has landed
      this.landLetter();
    }
  }

  /**
   * Check if position is valid for movement
   */
  private canMoveTo(position: Position): boolean {
    // Check bounds
    if (
      position.x < 0 ||
      position.x >= BOARD_CONFIG.WIDTH ||
      position.y < 0 ||
      position.y >= BOARD_CONFIG.HEIGHT
    ) {
      return false;
    }

    // Check if cell is empty
    return this.board.isEmpty(position);
  }

  /**
   * Land the current letter on the board
   */
  private landLetter(): void {
    if (!this.currentLetter) {
      return;
    }

    const pos = this.currentLetter.position;
    const landedRow = pos.y;
    const landedCol = pos.x;

    const isBomb = this.currentLetter.isBomb || false;

    // Place letter on board
    this.board.setCell(pos, {
      letter: this.currentLetter.letter,
      isEmpty: false,
      isRemoving: false,
      isFrozen: false,
      isBomb: isBomb,
    });

    // Clear current letter reference IMMEDIATELY after placing on board
    // This ensures the letter is only shown from the board state, not from currentLetter
    this.currentLetter = null;

    // Check for bomb explosion BEFORE processing words
    if (isBomb) {
      // Bomb explodes immediately when it lands
      this.explodeBomb(pos);
      // Don't process words for bomb explosion (explosion clears cells)
      return;
    }

    // Notify state change to update UI with letter on board
    this.notifyStateChange();

    // Check for game over
    if (this.board.isTopRowBlocked()) {
      this.isGameOver = true;
      soundService.play(SOUND_MAPPINGS.GAME_OVER);
      this.notifyStateChange();
      return;
    }

    // Process words ONLY in the row and column where the letter landed
    // This matches the example behavior - check only where the letter was placed
    // Cascading will continue after animations complete
    this.processWordsAndCascade(landedRow, landedCol);

    // Check for game over (if top row is blocked, can't spawn next letter)
    if (this.board.isTopRowBlocked()) {
      this.isGameOver = true;
      soundService.play(SOUND_MAPPINGS.GAME_OVER);
      this.notifyStateChange();
      return;
    }

    // Spawn next letter from preview (nextLetter becomes currentLetter)
    if (this.nextLetter) {
      // Move preview letter to current
      this.currentLetter = this.nextLetter;
      this.nextLetter = null;
    } else {
      // No preview letter, spawn one directly as current
      const letter = this.letterGenerator.generateLetter();
      const startPosition: Position = {
        x: 4, // Column 4 at the top
        y: 0, // Top row
      };
      this.currentLetter = new Letter(letter, startPosition);
    }

    // Generate new preview letter for next
    this.spawnNextLetter();

    // Reset drop timer for new letter
    this.lastDropTime = 0;

    this.notifyStateChange();
  }

  /**
   * Spawn next letter (for preview - not active yet)
   * Current letter spawns when previous one lands
   */
  private spawnNextLetter(): void {
    const letter = this.letterGenerator.generateLetter();
    // Letter spawns at column 4 (x=4) at the top (y=0)
    const startPosition: Position = {
      x: 4, // Column 4 (0-indexed: columns are 0-7, so 4 is center)
      y: 0, // Top row (0-indexed: rows are 0-11, so 0 is top)
    };

    // Always set as nextLetter (preview letter)
    // Current letter is set when previous letter lands
    this.nextLetter = new Letter(letter, startPosition);
  }

  /**
   * Process words on board and handle cascading
   * Phase 2: Complete implementation with scoring and cascading
   * Note: Cascading happens after removal animation completes
   * @param row - Row where the letter landed (for targeted word detection)
   * @param col - Column where the letter landed (for targeted word detection)
   */
  private processWordsAndCascade(row: number, col: number): void {
    // Process words once (first iteration) - check only row and column where letter landed
    // Cascading will happen after removal animation completes
    this.processWordsOnce(row, col);
  }

  /**
   * Continue cascading word detection after animation completes
   * Called after word removal animation finishes
   * Only process words once - cascading is handled by async timeouts, not synchronous loops
   */
  private continueCascading(): void {
    // Wait for any existing removal to complete
    if (this.removalTimeoutId !== null) {
      debugLog('⏸️ Cascading paused - removal already in progress');
      return; // Already processing words
    }

    // Prevent infinite cascading loops
    if (this.cascadeDepth >= this.maxCascadeDepth) {
      debugError(`Maximum cascade depth (${this.maxCascadeDepth}) reached! Stopping cascading to prevent infinite loop.`);
      this.cascadeDepth = 0; // Reset for next round
      // Spawn new letter if needed after cascading completes
      this.spawnNewLetterAfterCascade();
      this.notifyStateChange();
      return;
    }

    // Process words once - check entire board for cascading words
    // When cascading, we check the entire board because gravity may have moved letters
    this.cascadeDepth++;
    debugLog(`🔄 Checking for cascading words after gravity... (depth: ${this.cascadeDepth}/${this.maxCascadeDepth})`);

    // For cascading, check entire board (gravity may have moved letters anywhere)
    const board = this.board.getCells();
    const detectedWords = this.wordDetector.detectWords(board);
    const foundWords = detectedWords.length > 0 ? this.processDetectedWords(detectedWords) : false;

    // If no words found, we're done cascading
    if (!foundWords) {
      debugLog(`✅ Cascading complete - no more words found (depth: ${this.cascadeDepth})`);
      this.cascadeDepth = 0; // Reset cascade depth
      // Spawn new letter if needed after cascading completes
      // This ensures game continues after bomb explosion or word processing
      this.spawnNewLetterAfterCascade();
      // Resume game loop - no more words to process
      this.notifyStateChange();
    }
    // If words were found, processWordsOnce() set the timeout which will call continueCascading() again
  }

  /**
   * Spawn a new letter after cascading/explosion completes
   * Called when no more words are being processed and game should continue
   */
  private spawnNewLetterAfterCascade(): void {
    // Check for game over first
    if (this.board.isTopRowBlocked()) {
      this.isGameOver = true;
      debugLog('❌ Game over - top row blocked after cascade');
      soundService.play(SOUND_MAPPINGS.GAME_OVER);
      this.notifyStateChange();
      return;
    }

    // If there's already a current letter, don't spawn a new one
    if (this.currentLetter) {
      debugLog('📝 Current letter already exists - not spawning new one');
      return;
    }

    // Spawn next letter from preview (nextLetter becomes currentLetter)
    if (this.nextLetter) {
      // Move preview letter to current
      this.currentLetter = this.nextLetter;
      this.nextLetter = null;
      debugLog(`📝 Spawned new letter from preview after cascade: ${this.currentLetter.letter}`);
    } else {
      // No preview letter, spawn one directly as current
      const letter = this.letterGenerator.generateLetter();
      const startPosition: Position = {
        x: 4, // Column 4 at the top
        y: 0, // Top row
      };
      this.currentLetter = new Letter(letter, startPosition);
      debugLog(`📝 Spawned new letter directly after cascade: ${this.currentLetter.letter}`);
    }

    // Generate new preview letter for next
    this.spawnNextLetter();

    // Reset drop timer for new letter
    this.lastDropTime = 0;

    debugLog('🔄 Game continues - new letter spawned after bomb explosion/cascade');
  }

  /**
   * Process words once (one iteration)
   * Check ONLY the row and column where the letter landed (like the example)
   * @param row - Row where the letter landed
   * @param col - Column where the letter landed
   * Returns true if words were found and processed
   */
  private processWordsOnce(row: number, col: number): boolean {
    // Wait for previous removal animation to complete before checking again
    if (this.removalTimeoutId !== null) {
      return false;
    }

    const board = this.board.getCells();

    // CRITICAL: Check ONLY the row and column where the letter landed
    // This matches the example behavior exactly
    debugLog(`🔍 Checking for words at row ${row}, col ${col} where letter landed`);

    // Detect words ONLY in the specific row and column where letter landed (like example)
    const detectedWords = this.wordDetector.detectWordsAt(board, row, col);

    if (detectedWords.length === 0) {
      return false;
    }

    // Process the detected words
    return this.processDetectedWords(detectedWords);
  }

  /**
   * Process detected words - mark for removal and calculate scores
   * @param detectedWords - Array of detected words to process
   * Returns true if words were processed
   */
  private processDetectedWords(detectedWords: DetectedWord[]): boolean {
    if (detectedWords.length === 0) {
      return false;
    }

    debugLog(`🎯 Processing ${detectedWords.length} detected word(s):`, detectedWords.map(w => w.text));

    // Mark words for removal and calculate scores
    const wordsToProcess: Array<{ word: DetectedWord; score: number }> = [];
    const markedPositions: Position[] = [];

    for (const word of detectedWords) {
      // Skip if already being removed
      const wordKey = `${word.text}-${word.startPosition.x}-${word.startPosition.y}`;
      if (this.wordsBeingRemoved.has(wordKey)) {
        debugLog(`⏭️ Skipping word "${word.text}" - already being removed`);
        continue;
      }

      // Mark cells for removal - including the letter that just landed if it's part of the word
      let markedCount = 0;
      for (const pos of word.positions) {
        const cell = this.board.getCell(pos);
        if (cell && !cell.isEmpty && cell.letter && !cell.isRemoving) {
          // Mark for removal - this will clear the cell after animation
          // Preserve all cell properties and mark as removing
          this.board.setCell(pos, {
            letter: cell.letter, // Keep letter visible during animation
            isEmpty: false, // Still has letter during animation (will be overridden by setCell logic)
            isRemoving: true, // Mark as removing
            isFrozen: cell.isFrozen || false,
            isBomb: cell.isBomb || false,
          });
          markedPositions.push(pos);
          markedCount++;
        }
      }

      if (markedCount === 0) {
        debugWarn(`⚠️ Word "${word.text}" had no cells to mark for removal`);
        continue;
      }

      debugLog(`✅ Marked ${markedCount} cell(s) for removal for word "${word.text}"`);

      // Detect special word type (word of day, sponsor trivia)
      const specialWordType = this.detectSpecialWordType(word.text);

      // Calculate score for this word
      const scoreCalc = calculateWordScore({
        word: word.text,
        orientation: word.orientation,
        comboCount: this.comboCount,
        level: this.level,
        specialWordType: specialWordType || undefined,
      });

      debugLog(`💰 Score for "${word.text}": ${scoreCalc.finalScore} (base: ${scoreCalc.baseScore}, letter: ${scoreCalc.letterScore}, length: ${scoreCalc.lengthBonus}, multiplier: ${scoreCalc.multiplier.toFixed(2)}x)`);

      wordsToProcess.push({ word, score: scoreCalc.finalScore });

      // Calculate popup position at the center of the word
      const centerCol = word.orientation === 'horizontal'
        ? word.startPosition.x + Math.floor(word.positions.length / 2)
        : word.startPosition.x;
      const centerRow = word.orientation === 'vertical'
        ? word.startPosition.y + Math.floor(word.positions.length / 2)
        : word.startPosition.y;

      // Add score popup (position will be converted to pixels in GameBoard)
      this.addScorePopup(scoreCalc.finalScore, centerCol, centerRow, this.comboCount, word.text);

      // Track word
      this.wordsBeingRemoved.add(wordKey);
      this.wordsFound.push(word.text);
      this.totalWordsFound++;

      // Handle special words (word of day, sponsor trivia)
      if (specialWordType === 'word-of-day') {
        this.handleWordOfTheDayFound(word.text, scoreCalc.finalScore);
      } else if (specialWordType === 'sponsor-trivia') {
        // This is the pending sponsor word - handle it
        debugLog(`🎯 Processing sponsor-trivia word: ${word.text}, pending: ${this.pendingSponsorWord}`);
        this.handleSponsorWordFound(word.text, scoreCalc.finalScore);
      } else if (this.pendingSponsorWord) {
        // Fallback: Check if this word matches the pending sponsor word
        const normalizedWord = word.text.toUpperCase().trim();
        const normalizedPending = this.pendingSponsorWord.toUpperCase().trim();
        debugLog(`🔍 Fallback check: word="${normalizedWord}", pending="${normalizedPending}", match=${normalizedWord === normalizedPending}`);
        if (normalizedWord === normalizedPending) {
          debugLog(`🎯 Found pending sponsor word via fallback check: ${word.text}`);
          this.handleSponsorWordFound(word.text, scoreCalc.finalScore);
        }
      }

      // Submit score to backend (async, don't wait)
      this.submitScoreToBackend(word.text, scoreCalc.finalScore, specialWordType);
    }

    // Check if we have words to process
    if (wordsToProcess.length === 0) {
      debugWarn('⚠️ No words to process - score will not be updated');
      return false;
    }

    // Play sound effect - combo if this is a combo, otherwise word-formed
    if (this.comboCount > 0) {
      soundService.play(SOUND_MAPPINGS.COMBO);
    } else {
      soundService.play(SOUND_MAPPINGS.WORD_FORMED);
    }

    // Update combo count and timing
    if (wordsToProcess.length > 0) {
      this.comboCount++;
      this.lastWordTime = Date.now();
      // Track max combo
      if (this.comboCount > this.maxCombo) {
        this.maxCombo = this.comboCount;
      }
    }

    // Calculate total score for this round
    let roundScore = wordsToProcess.reduce((sum, { score }) => sum + score, 0);

    debugLog(`📊 Round score calculation: ${wordsToProcess.length} word(s) = ${roundScore} points`);

    // Add milestone bonus if reached
    const milestoneBonus = getMilestoneBonus(this.totalWordsFound);
    if (milestoneBonus > 0) {
      debugLog(`🎁 Milestone bonus: +${milestoneBonus} points (${this.totalWordsFound} words found)`);
      roundScore += milestoneBonus;
    }

    // Update score and check level up
    const previousScore = this.score;
    this.score += roundScore;

    debugLog(`💵 Score update: ${previousScore} + ${roundScore} = ${this.score}`);

    // Verify score was actually updated
    if (this.score === previousScore && roundScore > 0) {
      debugError(`❌ ERROR: Score was not updated! Previous: ${previousScore}, Round: ${roundScore}, Current: ${this.score}`);
    }

    this.checkLevelUp();

    // Notify state change immediately so UI shows removing animation AND score update
    debugLog('📢 Notifying state change with updated score...');
    this.notifyStateChange();

    // Clear any existing timeout before setting a new one
    // CRITICAL: This prevents multiple timeouts from running simultaneously
    if (this.removalTimeoutId !== null) {
      debugWarn('⚠️ Clearing existing removal timeout before setting new one');
      clearTimeout(this.removalTimeoutId);
      this.removalTimeoutId = null;
    }

    debugLog(`⏱️ Setting removal timeout (${wordsToProcess.length} word(s) to remove)...`);

    // Set timeout to clear words after animation
    this.removalTimeoutId = window.setTimeout(() => {
      debugLog('⏰ Removal timeout fired - clearing words...');

      // Clear the timeout ID immediately so game loop can resume
      this.removalTimeoutId = null;

      try {
        // Clear removing words first - this sets cells to empty
        this.clearRemovingWords();

        // Get fresh board state AFTER clearing
        const boardCells = this.board.getCells();

        // Debug: Check board state before gravity
        const emptyBefore = boardCells.flat().filter(c => c && c.isEmpty && !c.letter).length;
        const lettersBefore = boardCells.flat().filter(c => c && !c.isEmpty && c.letter).length;
        const removingBefore = boardCells.flat().filter(c => c && c.isRemoving).length;
        debugLog(`📊 Before gravity: ${emptyBefore} empty, ${lettersBefore} letters, ${removingBefore} still removing`);

        if (removingBefore > 0) {
          debugWarn(`⚠️ WARNING: ${removingBefore} cells still marked as removing after clearRemovingWords()!`);
          // Force clear any remaining removing cells
          for (let y = 0; y < BOARD_CONFIG.HEIGHT; y++) {
            for (let x = 0; x < BOARD_CONFIG.WIDTH; x++) {
              const cell = boardCells[y][x];
              if (cell && cell.isRemoving) {
                boardCells[y][x] = {
                  ...cell,
                  letter: null,
                  isEmpty: true,
                  isRemoving: false,
                };
              }
            }
          }
        }

        // Apply gravity to make letters fall into empty spaces
        const gravityMoved = this.gravity.applyUntilStable(boardCells);

        // Debug: Check board state after gravity
        const emptyAfter = boardCells.flat().filter(c => c && c.isEmpty && !c.letter).length;
        const lettersAfter = boardCells.flat().filter(c => c && !c.isEmpty && c.letter).length;
        debugLog(`📊 After gravity: ${emptyAfter} empty, ${lettersAfter} letters (${gravityMoved ? 'gravity applied' : 'no movement'})`);

        // Update board with gravity-applied state
        this.updateBoardFromCells(boardCells);

        // Reset removing words set
        this.wordsBeingRemoved.clear();

        // Notify state change after gravity has been applied
        this.notifyStateChange();

        debugLog('✅ Word removal complete - checking for cascading words...');

        // Check for cascading words after gravity
        // Use a small delay to allow state to update and React to re-render
        // Use requestAnimationFrame to ensure state is fully updated before checking again
        requestAnimationFrame(() => {
          setTimeout(() => {
            this.continueCascading();
          }, 100); // Increased delay to ensure state is fully updated
        });
      } catch (error) {
        debugError('❌ Error in word removal timeout:', error);
        debugError('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        // Reset state on error to prevent freeze - CRITICAL
        this.wordsBeingRemoved.clear();
        this.removalTimeoutId = null;
        this.cascadeDepth = 0; // Reset cascade depth on error

        // Force clear any cells that might be stuck in removing state
        try {
          this.clearRemovingWords();
        } catch (clearError) {
          debugError('❌ Error clearing words in error handler:', clearError);
        }

        this.notifyStateChange();
      }
    }, ANIMATION_DURATIONS.WORD_REMOVAL); // Matches CSS animation duration

    debugLog(`✅ Removal timeout set (ID: ${this.removalTimeoutId})`);

    return wordsToProcess.length > 0;
  }

  /**
   * Clear words marked for removal from board
   * Cells become empty but remain intact (visible as empty cells)
   */
  private clearRemovingWords(): void {
    let clearedCount = 0;
    const clearedPositions: Position[] = [];

    // Iterate directly over board positions to ensure we check actual board state
    for (let y = 0; y < BOARD_CONFIG.HEIGHT; y++) {
      for (let x = 0; x < BOARD_CONFIG.WIDTH; x++) {
        const position = { x, y };
        const cell = this.board.getCell(position);

        // Clear all cells marked for removal
        if (cell && cell.isRemoving) {
          const hadLetter = cell.letter !== null;

          // Clear the letter but keep the cell structure intact
          // The cell should remain visible as an empty cell
          this.board.setCell(position, {
            letter: null, // Remove the letter
            isEmpty: true, // Cell is now empty but still exists
            isRemoving: false, // No longer removing
            isFrozen: false, // Reset frozen state
            isBomb: false, // Reset bomb state if it was a bomb
          });

          if (hadLetter) {
            clearedCount++;
            clearedPositions.push(position);
          }
        }
      }
    }

    if (clearedCount > 0) {
      debugLog(`✅ Cleared ${clearedCount} cell(s) marked for removal:`,
        clearedPositions.map(p => `(${p.x},${p.y})`).join(', '));

      // Verify clearing worked
      for (const pos of clearedPositions) {
        const cellAfter = this.board.getCell(pos);
        if (cellAfter && (!cellAfter.isEmpty || cellAfter.letter !== null || cellAfter.isRemoving)) {
          debugError(`❌ Cell at (${pos.x},${pos.y}) not properly cleared:`, cellAfter);
        }
      }
    } else {
      debugWarn('⚠️ No cells marked for removal found when trying to clear');

      // Debug: Check if any cells have isRemoving flag
      const removingCells = [];
      for (let y = 0; y < BOARD_CONFIG.HEIGHT; y++) {
        for (let x = 0; x < BOARD_CONFIG.WIDTH; x++) {
          const cell = this.board.getCell({ x, y });
          if (cell && cell.isRemoving) {
            removingCells.push({ x, y, cell });
          }
        }
      }
      if (removingCells.length > 0) {
        debugWarn(`⚠️ Found ${removingCells.length} cells with isRemoving flag but not cleared:`, removingCells);
      }
    }

    // Don't notify state change here - will notify after gravity is applied
  }

  /**
   * Check if level should increase
   */
  private checkLevelUp(): void {
    // Check if we've reached the threshold for the next level
    const nextLevel = this.level + 1;
    if (nextLevel > LEVEL_CONFIG.MAX_LEVEL) {
      return; // Already at max level
    }

    const threshold = LEVEL_CONFIG.POINTS_THRESHOLDS[nextLevel as keyof typeof LEVEL_CONFIG.POINTS_THRESHOLDS];

    if (this.score >= threshold && !this.isLevelingUp) {
      // Trigger level-up sequence
      this.triggerLevelUp(nextLevel);
    }
  }

  /**
   * Trigger level-up sequence
   */
  private triggerLevelUp(newLevel: number): void {
    debugLog(`🚀 Level Up! Reached Level ${newLevel}`);

    // Store level-up info for UI
    this.isLevelingUp = true;
    const themeId = LEVEL_CONFIG.LEVEL_THEMES[newLevel as keyof typeof LEVEL_CONFIG.LEVEL_THEMES] || 'neon-blue';

    this.levelUpData = {
      newLevel,
      points: this.score,
      themeId,
    };

    // Update level
    this.level = newLevel;

    // Update drop speed (INCREASE SPEED = DECREASE INTERVAL)
    // Letters fall faster at higher levels
    this.dropInterval = Math.max(
      DROP_CONFIG.BASE_INTERVAL - ((this.level - 1) * DROP_CONFIG.SPEED_INCREASE_PER_LEVEL),
      DROP_CONFIG.MIN_INTERVAL
    );

    debugLog(`🚀 Drop speed updated: ${this.dropInterval}ms (${((DROP_CONFIG.BASE_INTERVAL - this.dropInterval) / 10).toFixed(0)}% faster)`);

    // Clear board completely
    this.clearBoard();

    // Pause the game during level-up banner
    this.isPaused = true;

    // Notify UI
    this.notifyStateChange();
  }

  /**
   * Complete level-up sequence (called after banner animation)
   * Public method so UI can call it after banner completes
   */
  completeLevelUp(): void {
    if (!this.isLevelingUp) {
      return;
    }

    debugLog(`✅ Level-up sequence complete, resuming game at Level ${this.level}`);

    // Reset level-up state
    this.isLevelingUp = false;
    this.levelUpData = null;

    // Resume game
    this.isPaused = false;

    // Spawn a new letter to continue gameplay
    // If no current letter, spawn one
    if (!this.currentLetter) {
      this.spawnNextLetter();
      if (this.nextLetter) {
        this.currentLetter = this.nextLetter;
        this.nextLetter = null;
        this.spawnNextLetter();
      }
    }

    // Notify state change
    this.notifyStateChange();
  }

  /**
   * Clear the entire board
   */
  private clearBoard(): void {
    debugLog('🧹 Clearing board for level-up...');

    for (let y = 0; y < BOARD_CONFIG.HEIGHT; y++) {
      for (let x = 0; x < BOARD_CONFIG.WIDTH; x++) {
        this.board.setCell({ x, y }, {
          letter: null,
          isEmpty: true,
          isRemoving: false,
          isFrozen: false,
          isBomb: false,
        });
      }
    }

    // Clear current and next letters
    this.currentLetter = null;
    this.nextLetter = null;

    // Clear any pending removal operations
    this.wordsBeingRemoved.clear();
    if (this.removalTimeoutId !== null) {
      clearTimeout(this.removalTimeoutId);
      this.removalTimeoutId = null;
    }

    debugLog('✅ Board cleared successfully');
  }

  /**
   * Process words on board (public method for external access)
   */
  processWords(): DetectedWord[] {
    const board = this.board.getCells();
    return this.wordDetector.detectWords(board);
  }

  /**
   * Apply gravity to board
   */
  applyGravity(): void {
    const board = this.board.getCells();
    this.gravity.applyUntilStable(board);
    this.updateBoardFromCells(board);
  }

  /**
   * Update board from cell array (after gravity)
   * This ensures the board state matches the modified cells after gravity
   */
  private updateBoardFromCells(cells: ReturnType<Board['getCells']>): void {
    for (let y = 0; y < BOARD_CONFIG.HEIGHT; y++) {
      for (let x = 0; x < BOARD_CONFIG.WIDTH; x++) {
        const cell = cells[y][x];
        if (cell) {
          // Explicitly set all cell properties to ensure correct state
          this.board.setCell({ x, y }, {
            letter: cell.letter,
            isEmpty: cell.isEmpty ?? (cell.letter === null || cell.letter === undefined),
            isRemoving: cell.isRemoving ?? false,
            isFrozen: cell.isFrozen ?? false,
            isBomb: cell.isBomb ?? false,
          });
        }
      }
    }
  }

  /**
   * Pause the game
   */
  pause(): void {
    this.isPaused = true;
    this.notifyStateChange();
  }

  /**
   * Resume the game
   */
  resume(): void {
    this.isPaused = false;
    this.notifyStateChange();
  }

  /**
   * Reset the game
   */
  reset(): void {
    // Clear any pending removal timeouts
    if (this.removalTimeoutId !== null) {
      clearTimeout(this.removalTimeoutId);
      this.removalTimeoutId = null;
    }

    // Clear any pending timeouts
    if (this.removalTimeoutId !== null) {
      clearTimeout(this.removalTimeoutId);
      this.removalTimeoutId = null;
    }

    this.board = new Board();
    this.currentLetter = null;
    this.nextLetter = null;
    this.score = 0;
    this.level = 1;
    this.comboCount = 0;
    this.isGameOver = false;
    this.achievements = [];
    this.maxCombo = 0;
    this.isPaused = false;
    this.cascadeDepth = 0; // Reset cascade depth
    this.scorePopups = []; // Clear score popups
    this.nextPopupId = 0; // Reset popup ID counter
    this.wordsBeingRemoved.clear(); // Clear removing words set
    this.wordsFound = [];
    this.totalWordsFound = 0;
    this.dropInterval = DROP_CONFIG.BASE_INTERVAL;
    this.lastDropTime = 0;
    this.lastWordTime = Date.now();
    this.wordsBeingRemoved.clear();
    this.isFrozen = false;
    this.freezeIntervalMultiplier = 1.0;
    if (this.freezeTimeoutId !== null) {
      clearTimeout(this.freezeTimeoutId);
      this.freezeTimeoutId = null;
    }
    this.isLevelingUp = false;
    this.levelUpData = null;
    this.powerUpSystem.reset(); // Reset power-ups
    this.letterGenerator.reset(); // Reset letter generator

    // Reset game modes state
    this.wordOfTheDay = null;
    this.currentSponsorQuestion = null;
    this.showTriviaModal = false;
    this.foundWordOfTheDay = false;
    this.foundSponsorWord = false;
    this.pendingSponsorWord = null;
    this.sponsorTriviaAnswered = false;

    // Spawn first letter and its preview
    this.spawnNextLetter();
    if (this.nextLetter) {
      this.currentLetter = this.nextLetter;
      this.nextLetter = null;
      this.spawnNextLetter(); // Generate preview letter
    }

    // Reload game modes data
    this.loadGameModesData();

    this.notifyStateChange();
  }

  /**
   * Add a score popup at the specified position
   * @param score - Score value to display
   * @param col - Column (grid coordinate)
   * @param row - Row (grid coordinate)
   * @param combo - Combo count for display
   * @param word - Word that was created
   */
  private addScorePopup(score: number, col: number, row: number, combo: number, word?: string): void {
    const popup: ScorePopup = {
      id: this.nextPopupId++,
      score,
      position: { x: col, y: row }, // Grid coordinates - will be converted to pixels in GameBoard
      combo,
      word,
    };
    this.scorePopups.push(popup);
    debugLog(`🎯 Added score popup: ${score} points at (${col}, ${row}) with combo ${combo}, word: ${word}`);
  }

  /**
   * Remove a score popup by ID
   * @param id - Popup ID to remove
   */
  removeScorePopup(id: number): void {
    this.scorePopups = this.scorePopups.filter(popup => popup.id !== id);
    this.notifyStateChange(); // Notify state change so UI updates
  }

  /**
   * Get current game state
   */
  getState(): GameEngineState {
    return {
      board: this.board.getCells(),
      currentLetter: this.currentLetter,
      nextLetter: this.nextLetter,
      score: this.score,
      level: this.level,
      comboCount: this.comboCount,
      isGameOver: this.isGameOver,
      isPaused: this.isPaused,
      wordsFound: [...this.wordsFound],
      scorePopups: [...this.scorePopups],
      powerUps: this.powerUpSystem.getAllPowerUps(),
      isFrozen: this.isFrozen,
      isLevelingUp: this.isLevelingUp,
      levelUpData: this.levelUpData ? { ...this.levelUpData } : null,
      // Game modes
      wordOfTheDay: this.wordOfTheDay,
      currentSponsorQuestion: this.currentSponsorQuestion,
      showTriviaModal: this.showTriviaModal,
      foundWordOfTheDay: this.foundWordOfTheDay,
      foundSponsorWord: this.foundSponsorWord,
      pendingSponsorWord: this.pendingSponsorWord,
      sponsorTriviaAnswered: this.sponsorTriviaAnswered,
      achievements: [...this.achievements],
      maxCombo: this.maxCombo,
    };
  }

  /**
   * Get total words found count
   */
  getTotalWordsFound(): number {
    return this.totalWordsFound;
  }

  /**
   * Notify state change to callback
   */
  private notifyStateChange(): void {
    if (this.stateChangeCallback) {
      const state = this.getState();
      // Debug: Log score when notifying state change
      if (state.score > 0) {
        debugLog(`📡 Notifying state change - Score: ${state.score}, Level: ${state.level}, Words: ${state.wordsFound.length}`);
      }
      this.stateChangeCallback(state);
    } else {
      debugWarn('⚠️ State change callback not set! Score updates will not be visible.');
    }
  }

  /**
   * Use a power-up
   * @param type - Power-up type to use
   * @param metadata - Optional metadata (e.g., selected letter for blank)
   * @returns true if power-up was used successfully
   */
  usePowerUp(type: PowerUpType, metadata?: Record<string, unknown>): boolean {
    if (this.isPaused || this.isGameOver) {
      return false;
    }

    if (!this.powerUpSystem.canUse(type)) {
      debugWarn(`⚠️ Cannot use power-up ${type}: not available or no uses remaining`);
      return false;
    }

    // Apply power-up effect based on type FIRST (before consuming)
    // For blank power-up, we need to validate the letter before consuming
    let success = false;

    switch (type) {
      case 'bomb':
        success = this.applyBombPowerUp();
        break;
      case 'lightning':
        success = this.applyLightningPowerUp();
        break;
      case 'freeze':
        success = this.applyFreezePowerUp();
        break;
      case 'wind':
        success = this.applyWindPowerUp();
        break;
      case 'blank':
        const selectedLetter = metadata?.letter as string | undefined;
        success = this.applyBlankPowerUp(selectedLetter);
        break;
      default:
        debugWarn(`⚠️ Unknown power-up type: ${type}`);
        return false;
    }

    // Only consume power-up if it was successful
    if (success) {
      // Use the power-up (decrement uses)
      if (!this.powerUpSystem.use(type)) {
        debugWarn(`⚠️ Failed to consume power-up ${type} after successful application`);
      } else {
        debugLog(`✅ Power-up ${type} used successfully`);
        this.notifyStateChange(); // Update UI with new power-up counts
      }
    } else {
      debugWarn(`❌ Power-up ${type} failed to apply - not consuming use`);
    }

    return success;
  }

  /**
   * Add power-up uses (reward from watching ad)
   * @param type - Power-up type to add uses to
   * @param amount - Number of uses to add (default: 1)
   */
  addPowerUpUses(type: PowerUpType, amount: number = 1): boolean {
    if (this.powerUpSystem.addUses(type, amount)) {
      debugLog(`✅ Added ${amount} use(s) to power-up ${type}`);
      this.notifyStateChange();
      return true;
    }
    return false;
  }

  /**
   * Apply Bomb power-up: Current falling letter becomes a bomb that explodes when it lands
   */
  private applyBombPowerUp(): boolean {
    if (!this.currentLetter) {
      debugWarn('⚠️ Cannot apply bomb: no current letter');
      return false;
    }

    // Mark current letter as bomb
    this.currentLetter.isBomb = true;
    debugLog(`💣 Bomb power-up applied to current letter at (${this.currentLetter.position.x}, ${this.currentLetter.position.y})`);

    this.notifyStateChange();
    return true;
  }

  /**
   * Apply Lightning power-up: Clear entire column where current letter is
   */
  private applyLightningPowerUp(): boolean {
    if (!this.currentLetter) {
      debugWarn('⚠️ Cannot apply lightning: no current letter');
      return false;
    }

    const col = this.currentLetter.position.x;
    const positionsToClear: Position[] = [];

    // Check if column has any cells to clear
    for (let y = 0; y < BOARD_CONFIG.HEIGHT; y++) {
      const cell = this.board.getCell({ x: col, y });
      if (cell && !cell.isEmpty && cell.letter) {
        positionsToClear.push({ x: col, y });
      }
    }

    if (positionsToClear.length === 0) {
      debugWarn(`⚠️ Column ${col} is empty - lightning has no effect`);
      // Still consume the power-up, but no effect
      this.notifyStateChange();
      return true;
    }

    // Mark cells for removal
    for (const pos of positionsToClear) {
      const cell = this.board.getCell(pos);
      if (cell) {
        this.board.setCell(pos, {
          ...cell,
          isRemoving: true,
        });
      }
    }

    // Award points
    this.score += POWER_UP_CONFIG.LIGHTNING_SCORE;
    this.addScorePopup(POWER_UP_CONFIG.LIGHTNING_SCORE, col, BOARD_CONFIG.HEIGHT / 2, this.comboCount);

    // Clear cells after animation (similar to word removal)
    if (this.removalTimeoutId !== null) {
      clearTimeout(this.removalTimeoutId);
    }
    this.removalTimeoutId = window.setTimeout(() => {
      this.removalTimeoutId = null;
      this.clearRemovingWords();
      this.applyGravityAndCheckCascading();
    }, 400); // Same animation delay as word removal

    debugLog(`⚡ Lightning cleared ${positionsToClear.length} cells in column ${col}`);
    soundService.play(SOUND_MAPPINGS.LIGHTNING);
    this.notifyStateChange();
    return true;
  }

  /**
   * Apply Freeze power-up: Slow down falling speed for 5 seconds
   */
  private applyFreezePowerUp(): boolean {
    if (this.isFrozen) {
      debugWarn('⚠️ Freeze already active');
      return false;
    }

    // Clear any existing freeze timeout
    if (this.freezeTimeoutId !== null) {
      clearTimeout(this.freezeTimeoutId);
      this.freezeTimeoutId = null;
    }

    // Apply freeze effect
    // FREEZE_SPEED_MULTIPLIER: 0.5 means 50% slower, so we multiply interval by 2 (1 / 0.5 = 2)
    this.isFrozen = true;
    this.freezeIntervalMultiplier = 1.0 / POWER_UP_CONFIG.FREEZE_SPEED_MULTIPLIER; // Double the drop interval (50% slower)
    soundService.play(SOUND_MAPPINGS.FREEZE);

    // Mark all cells as frozen (visual effect)
    for (let y = 0; y < BOARD_CONFIG.HEIGHT; y++) {
      for (let x = 0; x < BOARD_CONFIG.WIDTH; x++) {
        const cell = this.board.getCell({ x, y });
        if (cell) {
          this.board.setCell({ x, y }, {
            ...cell,
            isFrozen: true,
          });
        }
      }
    }

    // Remove freeze after duration
    this.freezeTimeoutId = window.setTimeout(() => {
      this.freezeTimeoutId = null;
      this.isFrozen = false;
      this.freezeIntervalMultiplier = 1.0;

      // Remove frozen flag from all cells
      for (let y = 0; y < BOARD_CONFIG.HEIGHT; y++) {
        for (let x = 0; x < BOARD_CONFIG.WIDTH; x++) {
          const cell = this.board.getCell({ x, y });
          if (cell) {
            this.board.setCell({ x, y }, {
              ...cell,
              isFrozen: false,
            });
          }
        }
      }

      debugLog('❄️ Freeze effect ended - speed returned to normal');
      this.notifyStateChange();
    }, POWER_UP_CONFIG.FREEZE_DURATION);

    debugLog(`❄️ Freeze applied for ${POWER_UP_CONFIG.FREEZE_DURATION}ms - drop speed reduced by ${((1 - POWER_UP_CONFIG.FREEZE_SPEED_MULTIPLIER) * 100).toFixed(0)}%`);
    this.notifyStateChange();
    return true;
  }

  /**
   * Apply Wind power-up: Clear entire bottom row
   */
  private applyWindPowerUp(): boolean {
    const bottomRow = BOARD_CONFIG.HEIGHT - 1;
    const positionsToClear: Position[] = [];

    // Check if bottom row has any cells to clear
    for (let x = 0; x < BOARD_CONFIG.WIDTH; x++) {
      const cell = this.board.getCell({ x, y: bottomRow });
      if (cell && !cell.isEmpty && cell.letter) {
        positionsToClear.push({ x, y: bottomRow });
      }
    }

    // If no cells to clear, don't consume power-up
    if (positionsToClear.length === 0) {
      debugLog(`🌬️ Wind power-up: Bottom row ${bottomRow} is already empty - no effect`);
      return false; // Return false so power-up is not consumed
    }

    // Mark cells for removal
    for (const pos of positionsToClear) {
      const cell = this.board.getCell(pos);
      if (cell) {
        this.board.setCell(pos, {
          ...cell,
          isRemoving: true,
        });
      }
    }

    // Award points based on cells cleared (not fixed amount)
    const windScore = POWER_UP_CONFIG.WIND_SCORE * positionsToClear.length;
    this.score += windScore;
    this.addScorePopup(windScore, Math.floor(BOARD_CONFIG.WIDTH / 2), bottomRow, this.comboCount, 'WIND!');

    // Clear cells after animation
    if (this.removalTimeoutId !== null) {
      clearTimeout(this.removalTimeoutId);
    }
    this.removalTimeoutId = window.setTimeout(() => {
      this.removalTimeoutId = null;
      this.clearRemovingWords();
      this.applyGravityAndCheckCascading();
    }, 400);

    debugLog(`🌬️ Wind cleared ${positionsToClear.length} cell(s) in bottom row (score: +${windScore})`);
    soundService.play(SOUND_MAPPINGS.WIND);
    this.notifyStateChange();
    return true;
  }

  /**
   * Apply Blank power-up: Player chooses next letter
   * @param selectedLetter - Letter chosen by player (A-Z)
   */
  private applyBlankPowerUp(selectedLetter?: string): boolean {
    if (!selectedLetter || selectedLetter.length !== 1) {
      debugWarn('⚠️ Blank power-up requires a selected letter');
      return false;
    }

    const letterUpper = selectedLetter.toUpperCase();
    if (!letterUpper.match(/^[A-Z]$/)) {
      debugWarn(`⚠️ Invalid letter for blank power-up: ${selectedLetter}`);
      return false;
    }

    // Validate letter type - convert string to LetterType (union type from types/game.ts)
    // LetterType is already imported at the top of the file
    const validLetters: LetterType[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const letter = letterUpper as LetterType;
    if (!validLetters.includes(letter)) {
      debugWarn(`⚠️ Invalid letter for blank power-up: ${selectedLetter}`);
      return false;
    }

    // Set next letter to selected letter
    // Since Letter.letter is readonly, we need to create a new Letter object
    // Use the same spawn position as normal letter spawning (x: 4, y: 0)
    const spawnPosition: Position = {
      x: 4, // Column 4 at the top (same as normal spawn)
      y: 0, // Top row
    };

    if (this.nextLetter) {
      // Replace the next letter with the selected letter, keeping the same position
      const currentPosition = this.nextLetter.position;
      const currentIsBomb = this.nextLetter.isBomb;
      // Create new Letter with selected letter value
      this.nextLetter = new Letter(letter, currentPosition, currentIsBomb);
      debugLog(`🔠 Blank power-up: next letter changed to ${letter} (position: ${currentPosition.x}, ${currentPosition.y})`);
    } else {
      // If no next letter, create one with default spawn position (x: 4, y: 0)
      this.nextLetter = new Letter(letter, spawnPosition, false);
      debugLog(`🔠 Blank power-up: created next letter ${letter} at position (${spawnPosition.x}, ${spawnPosition.y})`);
    }

    // Notify state change to update UI with new next letter
    // The power-up consumption will happen in usePowerUp() which will notify again (which is fine - double update is safe)
    this.notifyStateChange();
    return true;
  }

  /**
   * Apply gravity and check for cascading words
   * Called after power-up clears cells or bomb explosion
   */
  private applyGravityAndCheckCascading(): void {
    // Apply gravity - pass board cells, not Board object
    const boardCells = this.board.getCells();
    const moved = this.gravity.applyUntilStable(boardCells);

    // Update board with gravity result
    if (moved) {
      // Copy the modified cells back to the board
      for (let y = 0; y < BOARD_CONFIG.HEIGHT; y++) {
        for (let x = 0; x < BOARD_CONFIG.WIDTH; x++) {
          this.board.setCell({ x, y }, boardCells[y][x]);
        }
      }
      debugLog('📉 Gravity applied after power-up/explosion');
      this.notifyStateChange();
    }

    // Check for cascading words (words formed by gravity)
    // Reset cascade depth before checking (bomb/word processing is a new cascade chain)
    this.cascadeDepth = 0;

    // Use requestAnimationFrame to ensure state is fully updated before checking
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.continueCascading();
      }, 50); // Small delay to ensure gravity state is fully updated
    });
  }

  /**
   * Explode bomb at position (cross pattern)
   * Clears: center (bomb), 2 cells left, 2 cells right, 2 cells below
   */
  private explodeBomb(position: Position): void {
    const { x: col, y: row } = position;
    const positionsToClear: Position[] = [];

    // Always include the bomb position itself (center)
    positionsToClear.push(position);

    // Add cells to the left (2 cells)
    for (let c = Math.max(0, col - 2); c < col; c++) {
      positionsToClear.push({ x: c, y: row });
    }

    // Add cells to the right (2 cells)
    for (let c = col + 1; c <= Math.min(BOARD_CONFIG.WIDTH - 1, col + 2); c++) {
      positionsToClear.push({ x: c, y: row });
    }

    // Add cells below (2 cells)
    for (let r = row + 1; r <= Math.min(BOARD_CONFIG.HEIGHT - 1, row + 2); r++) {
      positionsToClear.push({ x: col, y: r });
    }

    // Mark cells for removal (including bomb position itself)
    let markedCount = 0;
    for (const pos of positionsToClear) {
      const cell = this.board.getCell(pos);
      // Mark cell for removal if it has content (letter or bomb)
      // Note: Bomb cells have a letter value (even though UI hides it), so !isEmpty should catch them
      if (cell && !cell.isEmpty && cell.letter) {
        this.board.setCell(pos, {
          ...cell,
          isRemoving: true,
          isBomb: false, // Remove bomb flag (bomb will be cleared)
        });
        markedCount++;
      }
    }

    if (markedCount === 0) {
      debugWarn('⚠️ Bomb explosion: no cells marked for removal - bomb may have already been cleared');
      // Even if no cells to clear, still spawn new letter to continue game
      this.spawnNewLetterAfterCascade();
      this.notifyStateChange();
      return;
    }

    debugLog(`💣 Bomb explosion: marked ${markedCount} cell(s) for removal`);
    soundService.play(SOUND_MAPPINGS.BOMB);

    // Award points
    this.score += POWER_UP_CONFIG.BOMB_SCORE;
    this.addScorePopup(POWER_UP_CONFIG.BOMB_SCORE, col, row, this.comboCount);

    // Clear cells after animation
    if (this.removalTimeoutId !== null) {
      clearTimeout(this.removalTimeoutId);
    }
    this.removalTimeoutId = window.setTimeout(() => {
      this.removalTimeoutId = null;
      this.clearRemovingWords();
      this.applyGravityAndCheckCascading();
    }, 400);

    debugLog(`💣 Bomb explosion cleared ${positionsToClear.length} cells`);
    this.notifyStateChange();
  }

  /**
   * Create game session in backend
   */
  private async createGameSession(): Promise<void> {
    try {
      const session = await gameApiService.createOrUpdateGameSession({
        level_reached: this.level,
        final_score: this.score,
        words_found: this.totalWordsFound,
        duration_seconds: 0,
      });
      if (session) {
        debugLog('✅ Game session created:', session.data.session_token);
      }
    } catch (error) {
      debugError('Failed to create game session:', error);
    }
  }

  /**
   * Load game modes data (word of the day, sponsor questions)
   */
  private async loadGameModesData(): Promise<void> {
    try {
      // Load word of the day (only for word-of-day mode)
      if (this.gameMode === 'word-of-day') {
        const wordOfDay = await gameApiService.getWordOfTheDay();
        if (wordOfDay) {
          this.wordOfTheDay = wordOfDay;
          debugLog(`📅 Word of the Day loaded: ${wordOfDay.answer} - "${wordOfDay.question}"`);
        } else {
          debugWarn('⚠️ No word of the day available');
        }
      }

      // Load sponsor question (only for sponsor-trivia mode)
      if (this.gameMode === 'sponsor-trivia') {
        const sponsorQuestion = await gameApiService.getSponsorQuestion(this.level, this.comboCount);
        if (sponsorQuestion) {
          this.currentSponsorQuestion = sponsorQuestion;
          debugLog(`🎯 Sponsor question loaded: ${sponsorQuestion.answer} - "${sponsorQuestion.question}"`);
        }
      }
    } catch (error) {
      debugError('Failed to load game modes data:', error);
    }
  }

  /**
   * Detect if a word is a special word (word of day or sponsor trivia)
   */
  private detectSpecialWordType(word: string): 'word-of-day' | 'sponsor-trivia' | null {
    const normalizedWord = word.toUpperCase().trim();

    // Check for word of the day
    if (this.wordOfTheDay) {
      const normalizedAnswer = this.wordOfTheDay.answer.toUpperCase().trim();
      if (normalizedWord === normalizedAnswer) {
        debugLog(`✨ Found word of the day: ${word}`);
        return 'word-of-day';
      }
    }

    // Check for pending sponsor word (after answering trivia correctly)
    if (this.pendingSponsorWord) {
      const normalizedAnswer = this.pendingSponsorWord.toUpperCase().trim();
      if (normalizedWord === normalizedAnswer) {
        debugLog(`✨ Found pending sponsor word: ${word}`);
        return 'sponsor-trivia';
      }
    }

    return null;
  }

  /**
   * Check if we should show a sponsor question (randomly during gameplay)
   */
  private checkForSponsorQuestion(): void {
    const now = Date.now();

    // Don't show if:
    // - Already showing a question
    // - Already answered and waiting for word
    // - Less than interval time has passed
    if (
      this.showTriviaModal ||
      this.pendingSponsorWord !== null ||
      (now - this.lastSponsorQuestionTime) < this.sponsorQuestionInterval
    ) {
      return;
    }

    // Random chance to show question (30% chance every interval)
    if (Math.random() < 0.3) {
      this.showSponsorQuestion();
    }
  }

  /**
   * Show sponsor question modal
   */
  private async showSponsorQuestion(): Promise<void> {
    try {
      const sponsorQuestion = await gameApiService.getSponsorQuestion(this.level, this.comboCount);
      if (sponsorQuestion) {
        this.currentSponsorQuestion = sponsorQuestion;
        this.showTriviaModal = true;
        this.isPaused = true; // Pause game while showing trivia
        this.lastSponsorQuestionTime = Date.now();
        this.notifyStateChange();
        debugLog(`🎯 Showing sponsor question: ${sponsorQuestion.question}`);
      }
    } catch (error) {
      debugError('Failed to load sponsor question:', error);
    }
  }

  /**
   * Handle word of the day found
   */
  private handleWordOfTheDayFound(word: string, score: number): void {
    if (this.foundWordOfTheDay) {
      return; // Already found
    }

    this.foundWordOfTheDay = true;
    debugLog(`🎉 Word of the Day found: ${word}! Score: ${score}`);

    // Play celebration sound
    soundService.play(SOUND_MAPPINGS.LEVEL_UP || SOUND_MAPPINGS.WORD_FORMED);

    // Award achievement
    this.awardAchievement('word_of_day_completed', {
      word: word,
      date: new Date().toISOString().split('T')[0],
      score: score,
    });

    // Show celebration (will be handled by UI component)
    this.notifyStateChange();
  }

  /**
   * Award achievement to player
   */
  private awardAchievement(achievementType: string, metadata?: Record<string, unknown>): void {
    debugLog(`🏆 Achievement unlocked: ${achievementType}`, metadata);

    // Track achievement in state
    if (!this.achievements.includes(achievementType)) {
      this.achievements.push(achievementType);
    }

    // TODO: Send achievement to backend API
    // This can be implemented when backend achievement system is ready
    // For now, just log it
    try {
      // Future: Submit achievement to backend
      // await gameApiService.submitAchievement(achievementType, metadata);
    } catch (error) {
      debugError('Failed to submit achievement:', error);
    }
  }

  /**
   * Handle sponsor word found (after answering trivia correctly)
   */
  private handleSponsorWordFound(word: string, score: number): void {
    if (this.pendingSponsorWord && word.toUpperCase().trim() === this.pendingSponsorWord.toUpperCase().trim()) {
      debugLog(`🎯 Sponsor word found: ${word}! Score: ${score}`);

      // Clear pending word FIRST so banner disappears immediately
      const wordToClear = this.pendingSponsorWord;
      this.pendingSponsorWord = null;
      this.foundSponsorWord = true;
      this.isPaused = false; // Resume game

      debugLog(`✅ Clearing pending sponsor word: ${wordToClear}, new value: ${this.pendingSponsorWord}`);

      // Play celebration sound
      soundService.play(SOUND_MAPPINGS.LEVEL_UP || SOUND_MAPPINGS.WORD_FORMED);

      // Award achievement
      this.awardAchievement('sponsor_trivia_completed', {
        word: word,
        question_id: this.currentSponsorQuestion?.id,
        score: score,
      });

      // Clear question after getting the ID
      this.currentSponsorQuestion = null;

      // Force state update immediately - call multiple times to ensure it propagates
      this.notifyStateChange();
      // Also force another update after a tiny delay to ensure React picks it up
      setTimeout(() => {
        this.notifyStateChange();
        debugLog(`✅ Second state update called, pendingSponsorWord should be null: ${this.pendingSponsorWord}`);
      }, 10);
    }
  }

  /**
   * Handle trivia answer
   */
  handleTriviaAnswer(isCorrect: boolean, selectedAnswer?: string): void {
    this.showTriviaModal = false;
    this.sponsorTriviaAnswered = isCorrect;

    if (isCorrect && selectedAnswer) {
      // Use the selected answer as the word to find (not the question's answer field)
      this.pendingSponsorWord = selectedAnswer.toUpperCase().trim();
      debugLog(`✅ Trivia answered correctly! Find the word: ${this.pendingSponsorWord}`);
      // Resume game immediately so banner can show, but keep question for points reference
      this.isPaused = false;
    } else {
      // Wrong answer - resume game
      this.isPaused = false;
      this.currentSponsorQuestion = null;
    }

    this.notifyStateChange();
  }

  /**
   * Load next sponsor question
   */
  /*
  private async loadNextSponsorQuestion(): Promise<void> {
    try {
      const sponsorQuestion = await gameApiService.getSponsorQuestion(this.level, this.comboCount);
      if (sponsorQuestion) {
        this.currentSponsorQuestion = sponsorQuestion;
        this.foundSponsorWord = false; // Reset for next question
        debugLog(`🎯 Next sponsor question loaded: ${sponsorQuestion.answer}`);
      }
    } catch (error) {
      debugError('Failed to load next sponsor question:', error);
    }
  }
  */

  /**
   * Submit score to backend
   */
  private async submitScoreToBackend(
    word: string,
    points: number,
    specialWordType: 'word-of-day' | 'sponsor-trivia' | null
  ): Promise<void> {
    try {
      const sessionId = gameApiService.getGameSessionId();
      if (!sessionId) {
        // Create session if it doesn't exist
        const session = await gameApiService.createOrUpdateGameSession({
          level_reached: this.level,
          final_score: this.score,
          words_found: this.totalWordsFound,
          duration_seconds: Math.floor((Date.now() - this.gameStartTime) / 1000),
        });
        if (!session) {
          return;
        }
      }

      const wordType = specialWordType === 'word-of-day'
        ? 'word_of_day'
        : specialWordType === 'sponsor-trivia'
          ? 'sponsor_trivia'
          : 'normal';

      await gameApiService.submitScore({
        game_session_id: gameApiService.getGameSessionId()!,
        word: word,
        points: points,
        combo_count: this.comboCount,
        level: this.level,
        word_type: wordType,
        word_id: specialWordType === 'word-of-day' ? this.wordOfTheDay?.id : undefined,
        question_id: specialWordType === 'sponsor-trivia' ? this.currentSponsorQuestion?.id : undefined,
      });
    } catch (error) {
      debugError('Failed to submit score to backend:', error);
      // Don't block gameplay if score submission fails
    }
  }

  /**
   * Get word of the day
   */
  getWordOfTheDay(): WordOfTheDay | null {
    return this.wordOfTheDay;
  }

  /**
   * Get current sponsor question
   */
  getCurrentSponsorQuestion(): SponsorQuestion | null {
    return this.currentSponsorQuestion;
  }
}
