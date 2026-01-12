/**
 * LetterGenerator - Smart letter generation with vowel distribution
 * Ensures good vowel rotation for playable word formation
 */

import type { Letter as LetterType } from '../types/game';
import { debugLog } from '../utils/debug';

// Letter frequency weights (based on English letter frequency)
// Vowels are weighted higher to ensure better distribution
const LETTER_WEIGHTS: Record<LetterType, number> = {
  // Vowels (40% total weight)
  'A': 9,   // Most common vowel
  'E': 12,  // Most common letter in English
  'I': 7,   // Common vowel
  'O': 7,   // Common vowel
  'U': 5,   // Less common vowel
  
  // Common consonants (35% total weight)
  'R': 6,
  'S': 6,
  'T': 6,
  'N': 5,
  'L': 5,
  'D': 4,
  'H': 3,
  
  // Medium frequency consonants (15% total weight)
  'C': 3,
  'M': 3,
  'P': 3,
  'B': 2,
  'G': 2,
  'F': 2,
  
  // Less common consonants (10% total weight)
  'Y': 2,
  'W': 1,
  'K': 1,
  'V': 1,
  'J': 1,
  'X': 1,
  'Q': 0.5,
  'Z': 0.5,
};

const VOWELS: LetterType[] = ['A', 'E', 'I', 'O', 'U'];

export class LetterGenerator {
  private recentLetters: LetterType[] = [];
  private readonly maxRecentLetters: number = 5; // Track last 5 letters
  private readonly vowelGuaranteeThreshold: number = 4; // Force vowel after 4 non-vowels
  private readonly maxConsecutiveVowels: number = 3; // Max vowels in a row
  private readonly maxSameLetterRepeat: number = 2; // Max same letter in a row
  
  /**
   * Generate a letter with smart vowel distribution
   */
  generateLetter(): LetterType {
    // Count vowels in recent letters
    const recentVowelCount = this.recentLetters.filter(letter => VOWELS.includes(letter)).length;
    const recentNonVowelCount = this.recentLetters.length - recentVowelCount;
    
    // Check consecutive vowels at the end
    const consecutiveVowelsAtEnd = this.countConsecutiveVowelsAtEnd();
    
    // Check if same letter is repeating too much
    const lastLetter = this.recentLetters[this.recentLetters.length - 1];
    const consecutiveSameLetter = this.countConsecutiveSameLetter();
    
    // If we've had 4+ non-vowels in a row, guarantee a vowel (unless we just had 3 vowels)
    const shouldForceVowel = recentNonVowelCount >= this.vowelGuaranteeThreshold && consecutiveVowelsAtEnd < this.maxConsecutiveVowels;
    
    // If we've had 3+ vowels in a row, force a consonant
    const shouldForceConsonant = consecutiveVowelsAtEnd >= this.maxConsecutiveVowels;
    
    // If same letter repeated 2+ times, exclude it
    const excludedLetters = consecutiveSameLetter >= this.maxSameLetterRepeat && lastLetter ? [lastLetter] : [];
    
    let letter: LetterType;
    
    if (shouldForceConsonant) {
      // Force a consonant (no vowels)
      letter = this.generateWeightedConsonant(excludedLetters);
      debugLog(`🔤 Forced consonant after ${consecutiveVowelsAtEnd} vowels: ${letter}`);
    } else if (shouldForceVowel) {
      // Force a vowel, but avoid repeating the same vowel if it just appeared
      const excludedVowels = excludedLetters.filter(l => VOWELS.includes(l));
      letter = this.generateWeightedVowel(excludedVowels);
      debugLog(`🔤 Forced vowel after ${recentNonVowelCount} consonants: ${letter}`);
    } else {
      // Use weighted distribution for all letters, but exclude recent repeats
      letter = this.generateWeightedLetter(excludedLetters);
    }
    
    // Track this letter
    this.recentLetters.push(letter);
    if (this.recentLetters.length > this.maxRecentLetters) {
      this.recentLetters.shift(); // Remove oldest
    }
    
    return letter;
  }
  
  /**
   * Count consecutive vowels at the end of recent letters
   */
  private countConsecutiveVowelsAtEnd(): number {
    let count = 0;
    for (let i = this.recentLetters.length - 1; i >= 0; i--) {
      if (VOWELS.includes(this.recentLetters[i])) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }
  
  /**
   * Count consecutive same letter at the end
   */
  private countConsecutiveSameLetter(): number {
    if (this.recentLetters.length === 0) return 0;
    
    const lastLetter = this.recentLetters[this.recentLetters.length - 1];
    let count = 0;
    for (let i = this.recentLetters.length - 1; i >= 0; i--) {
      if (this.recentLetters[i] === lastLetter) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }
  
  /**
   * Generate a vowel using weighted distribution
   */
  private generateWeightedVowel(excluded: LetterType[] = []): LetterType {
    const availableVowels = VOWELS.filter(v => !excluded.includes(v));
    
    if (availableVowels.length === 0) {
      // If all vowels are excluded, use any vowel (fallback)
      return VOWELS[Math.floor(Math.random() * VOWELS.length)];
    }
    
    const vowelWeights = availableVowels.map(vowel => LETTER_WEIGHTS[vowel]);
    const totalWeight = vowelWeights.reduce((sum, weight) => sum + weight, 0);
    
    let random = Math.random() * totalWeight;
    
    for (const vowel of availableVowels) {
      random -= LETTER_WEIGHTS[vowel];
      if (random <= 0) {
        return vowel;
      }
    }
    
    // Fallback (shouldn't reach here)
    return availableVowels[0] || 'E';
  }
  
  /**
   * Generate a consonant using weighted distribution
   */
  private generateWeightedConsonant(excluded: LetterType[] = []): LetterType {
    const allLetters = Object.keys(LETTER_WEIGHTS) as LetterType[];
    const consonants = allLetters.filter(letter => !VOWELS.includes(letter) && !excluded.includes(letter));
    
    if (consonants.length === 0) {
      // If all consonants are excluded, use any consonant (fallback)
      const allConsonants = allLetters.filter(letter => !VOWELS.includes(letter));
      return allConsonants[Math.floor(Math.random() * allConsonants.length)] || 'R';
    }
    
    const consonantWeights = consonants.map(letter => LETTER_WEIGHTS[letter]);
    const totalWeight = consonantWeights.reduce((sum, weight) => sum + weight, 0);
    
    let random = Math.random() * totalWeight;
    
    for (const consonant of consonants) {
      random -= LETTER_WEIGHTS[consonant];
      if (random <= 0) {
        return consonant;
      }
    }
    
    // Fallback (shouldn't reach here)
    return consonants[0] || 'R';
  }
  
  /**
   * Generate a letter using weighted distribution
   */
  private generateWeightedLetter(excluded: LetterType[] = []): LetterType {
    const allLetters = Object.keys(LETTER_WEIGHTS) as LetterType[];
    const availableLetters = allLetters.filter(letter => !excluded.includes(letter));
    
    if (availableLetters.length === 0) {
      // If all letters are excluded, use any letter (fallback)
      return allLetters[Math.floor(Math.random() * allLetters.length)];
    }
    
    const letterWeights = availableLetters.map(letter => LETTER_WEIGHTS[letter]);
    const totalWeight = letterWeights.reduce((sum, weight) => sum + weight, 0);
    
    let random = Math.random() * totalWeight;
    
    for (const letter of availableLetters) {
      random -= LETTER_WEIGHTS[letter];
      if (random <= 0) {
        return letter;
      }
    }
    
    // Fallback (shouldn't reach here)
    return availableLetters[0] || 'E';
  }
  
  /**
   * Reset the generator (for new game)
   */
  reset(): void {
    this.recentLetters = [];
  }
  
  /**
   * Get current recent letters (for debugging)
   */
  getRecentLetters(): LetterType[] {
    return [...this.recentLetters];
  }
}

// Singleton instance
let letterGeneratorInstance: LetterGenerator | null = null;

/**
 * Get the letter generator instance
 */
export function getLetterGenerator(): LetterGenerator {
  if (!letterGeneratorInstance) {
    letterGeneratorInstance = new LetterGenerator();
  }
  return letterGeneratorInstance;
}

/**
 * Generate a random letter (legacy function - now uses LetterGenerator)
 * Maintained for backward compatibility
 */
export function generateRandomLetter(): LetterType {
  return getLetterGenerator().generateLetter();
}
