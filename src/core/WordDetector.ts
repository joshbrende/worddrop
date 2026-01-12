/**
 * WordDetector - Detects words on the board
 * Framework-agnostic core game logic
 * Phase 2: Complete implementation with dictionary validation
 */

import type { Cell, DetectedWord, Position } from '../types/game';
import { BOARD_CONFIG } from '../constants/game';
import dictionaryService from '../services/DictionaryService';

export class WordDetector {
  /**
   * Finds valid words at a specific row and column (where letter landed)
   * This matches the example behavior - check ONLY where letter was placed
   * @param board - The game board
   * @param row - Row where the letter landed
   * @param col - Column where the letter landed
   * @returns Array of detected valid words
   */
  detectWordsAt(board: Cell[][], row: number, col: number): DetectedWord[] {
    const words: DetectedWord[] = [];

    // Check horizontal words ONLY in the row where letter landed
    // Words are validated IMMEDIATELY as they're built (like example)
    const horizontalWords = this.detectHorizontalWordsInRow(board, row);
    words.push(...horizontalWords);

    // Check vertical words ONLY in the column where letter landed
    // Words are validated IMMEDIATELY as they're built (like example)
    const verticalWords = this.detectVerticalWordsInColumn(board, col);
    words.push(...verticalWords);

    // Track word keys to prevent duplicates (same word at same position)
    const validWords: DetectedWord[] = [];
    const seenWordKeys = new Set<string>();
    
    for (const word of words) {
      // Create unique key for this word at this position
      const wordKey = `${word.text}-${word.startPosition.x}-${word.startPosition.y}-${word.orientation}`;
      
      // Skip if we've already processed this exact word at this position
      if (seenWordKeys.has(wordKey)) {
        continue;
      }
      
      seenWordKeys.add(wordKey);
      
      // Word is already validated in detectHorizontalWordsInRow/detectVerticalWordsInColumn
      // Just add it to valid words
      validWords.push(word);
    }

    // Log detected words for debugging
    if (validWords.length > 0) {
      const dictSize = dictionaryService.getDictionarySize();
      console.log(`✅ Found ${validWords.length} valid word(s) at row ${row}, col ${col}:`, validWords.map(w => `${w.text} (${w.orientation})`), `[Dictionary: ${dictSize.toLocaleString()} words${dictSize === 0 ? ' (using fallback)' : ''}]`);
    } else {
      console.log(`ℹ️ No valid words detected at row ${row}, col ${col}`);
    }

    return validWords;
  }

  /**
   * Finds all valid words on the board (for cascading checks)
   * Returns words with their positions and orientation
   * Filters to valid dictionary words
   */
  detectWords(board: Cell[][]): DetectedWord[] {
    const words: DetectedWord[] = [];

    // Horizontal words
    const horizontalWords = this.detectHorizontalWords(board);
    words.push(...horizontalWords);

    // Vertical words
    const verticalWords = this.detectVerticalWords(board);
    words.push(...verticalWords);

    // Filter to valid dictionary words with detailed logging
    const validWords: DetectedWord[] = [];
    const invalidWords: string[] = [];
    
    // Track word keys to prevent duplicates (same word at same position)
    const seenWordKeys = new Set<string>();
    
    for (const word of words) {
      // Create unique key for this word at this position
      const wordKey = `${word.text}-${word.startPosition.x}-${word.startPosition.y}-${word.orientation}`;
      
      // Skip if we've already processed this exact word at this position
      if (seenWordKeys.has(wordKey)) {
        continue;
      }
      
      seenWordKeys.add(wordKey);
      
      const isValid = dictionaryService.isValidWord(word.text);
      if (isValid) {
        validWords.push(word);
      } else {
        invalidWords.push(word.text);
      }
    }

    // Log detected words for debugging
    if (validWords.length > 0) {
      const dictSize = dictionaryService.getDictionarySize();
      console.log(`✅ Found ${validWords.length} valid word(s):`, validWords.map(w => `${w.text} (${w.orientation})`), `[Dictionary: ${dictSize.toLocaleString()} words${dictSize === 0 ? ' (using fallback)' : ''}]`);
    }
    
    if (invalidWords.length > 0 && invalidWords.length <= 10) {
      // Only log invalid words if there are few (avoid spam)
      console.warn(`⚠️ Detected ${invalidWords.length} invalid word candidate(s):`, invalidWords);
    }
    
    if (words.length === 0) {
      console.log('ℹ️ No words detected on board');
    }

    return validWords;
  }

  /**
   * Detect horizontal words in a specific row (like example checkForHorizontalWords)
   * Validates words IMMEDIATELY as they're built, matching example behavior
   */
  private detectHorizontalWordsInRow(board: Cell[][], row: number): DetectedWord[] {
    const words: DetectedWord[] = [];
    
    if (row < 0 || row >= BOARD_CONFIG.HEIGHT) {
      return words;
    }

    // Extract letters from row (like example does)
    const letters = board[row].map(cell => cell.letter || '');
    console.log(`Checking row ${row} for words. Letters:`, letters.join(''));

    let currentWord = '';
    let startCol = 0;
    const positions: Position[] = [];

    // Scan only this specific row (like example)
    for (let col = 0; col <= letters.length; col++) {
      // Check if there's a letter at this position (like example: letters[i] && letters[i] !== '💣')
      // Note: We don't need to check for '💣' because bombs are stored as isBomb property, not as a letter
      if (col < letters.length && letters[col] && letters[col] !== '') {
        if (currentWord === '') {
          startCol = col;
        }
        currentWord += letters[col];
        positions.push({ x: col, y: row });
      } else if (currentWord.length >= BOARD_CONFIG.MIN_WORD_LENGTH) {
        // End of word - validate IMMEDIATELY (like example)
        console.log(`Checking potential horizontal word: "${currentWord}"`);
        
        const isValid = dictionaryService.isValidWord(currentWord);
        if (isValid) {
          console.log(`Found valid horizontal word: ${currentWord}`);
          words.push({
            text: currentWord,
            positions: [...positions],
            orientation: 'horizontal',
            startPosition: { x: startCol, y: row },
          });
        } else {
          console.log(`Invalid horizontal word candidate: "${currentWord}"`);
        }
        
        currentWord = '';
        positions.length = 0;
      } else {
        // Word too short, reset
        currentWord = '';
        positions.length = 0;
      }
    }

    return words;
  }

  /**
   * Detect vertical words in a specific column (like example checkForVerticalWords)
   * Validates words IMMEDIATELY as they're built, matching example behavior
   */
  private detectVerticalWordsInColumn(board: Cell[][], col: number): DetectedWord[] {
    const words: DetectedWord[] = [];
    
    if (col < 0 || col >= BOARD_CONFIG.WIDTH) {
      return words;
    }

    // Extract letters from column (like example does)
    const letters = board.map(row => row[col].letter || '');
    console.log(`Checking column ${col} for words. Letters:`, letters.join(''));

    let currentWord = '';
    let startRow = 0;
    const positions: Position[] = [];

    // Scan only this specific column (like example)
    for (let row = 0; row <= letters.length; row++) {
      // Check if there's a letter at this position (like example: letters[i] && letters[i] !== '💣')
      // Note: We don't need to check for '💣' because bombs are stored as isBomb property, not as a letter
      if (row < letters.length && letters[row] && letters[row] !== '') {
        if (currentWord === '') {
          startRow = row;
        }
        currentWord += letters[row];
        positions.push({ x: col, y: row });
      } else if (currentWord.length >= BOARD_CONFIG.MIN_WORD_LENGTH) {
        // End of word - validate IMMEDIATELY (like example)
        console.log(`Checking potential vertical word: "${currentWord}"`);
        
        const isValid = dictionaryService.isValidWord(currentWord);
        if (isValid) {
          console.log(`Found valid vertical word: ${currentWord}`);
          words.push({
            text: currentWord,
            positions: [...positions],
            orientation: 'vertical',
            startPosition: { x: col, y: startRow },
          });
        } else {
          console.log(`Invalid vertical word candidate: "${currentWord}"`);
        }
        
        currentWord = '';
        positions.length = 0;
      } else {
        // Word too short, reset
        currentWord = '';
        positions.length = 0;
      }
    }

    return words;
  }

  /**
   * Detect horizontal words (left to right)
   */
  private detectHorizontalWords(board: Cell[][]): DetectedWord[] {
    const words: DetectedWord[] = [];

    for (let row = 0; row < BOARD_CONFIG.HEIGHT; row++) {
      let currentWord = '';
      let startCol = 0;
      const positions: Position[] = [];

      for (let col = 0; col <= BOARD_CONFIG.WIDTH; col++) {
        const cell = col < BOARD_CONFIG.WIDTH ? board[row][col] : null;

        if (cell && !cell.isEmpty && !cell.isRemoving && cell.letter) {
          if (currentWord === '') {
            startCol = col;
          }
          currentWord += cell.letter;
          positions.push({ x: col, y: row });
        } else {
          // End of word
          if (currentWord.length >= BOARD_CONFIG.MIN_WORD_LENGTH) {
            words.push({
              text: currentWord,
              positions: [...positions],
              orientation: 'horizontal',
              startPosition: { x: startCol, y: row },
            });
          }
          currentWord = '';
          positions.length = 0;
        }
      }
    }

    return words;
  }

  /**
   * Detect vertical words (top to bottom)
   */
  private detectVerticalWords(board: Cell[][]): DetectedWord[] {
    const words: DetectedWord[] = [];

    for (let col = 0; col < BOARD_CONFIG.WIDTH; col++) {
      let currentWord = '';
      let startRow = 0;
      const positions: Position[] = [];

      for (let row = 0; row <= BOARD_CONFIG.HEIGHT; row++) {
        const cell = row < BOARD_CONFIG.HEIGHT ? board[row][col] : null;

        if (cell && !cell.isEmpty && !cell.isRemoving && cell.letter) {
          if (currentWord === '') {
            startRow = row;
          }
          currentWord += cell.letter;
          positions.push({ x: col, y: row });
        } else {
          // End of word
          if (currentWord.length >= BOARD_CONFIG.MIN_WORD_LENGTH) {
            words.push({
              text: currentWord,
              positions: [...positions],
              orientation: 'vertical',
              startPosition: { x: col, y: startRow },
            });
          }
          currentWord = '';
          positions.length = 0;
        }
      }
    }

    return words;
  }
}
