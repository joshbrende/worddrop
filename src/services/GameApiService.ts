/**
 * GameApiService - Handles all API calls to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface WordOfTheDay {
  id: number;
  question: string;
  answer: string;
  word: string; // For backward compatibility
  date: string;
  category: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  type: 'daily';
}

export interface SponsorQuestion {
  id: number;
  sponsor: string;
  sponsorLogo?: string;
  sponsorDetails?: {
    id: number;
    name: string;
    slug: string;
    logo_url?: string;
  };
  question: string;
  answer: string;
  options?: string[]; // Multiple choice options
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  basePoints?: number;
  bonusMultiplier?: number;
  hint?: string;
  type: 'sponsor';
  date: string;
}

export interface GameSessionResponse {
  success: boolean;
  data: {
    session_token: string;
    game_session_id: string;
    user_id?: number;
    crazygames_user_id?: string;
  };
}

export interface ScoreSubmissionResponse {
  success: boolean;
  data: {
    score_id: number;
    points: number;
  };
}

class GameApiService {
  private wordOfTheDayCache: WordOfTheDay | null = null;
  private wordOfTheDayCacheExpiry: number = 0;
  // private sponsorQuestionsCache: SponsorQuestion[] = []; // Unused
  // private sponsorQuestionsCacheExpiry: number = 0; // Unused
  private sessionToken: string | null = null;
  private gameSessionId: string | null = null;

  /**
   * Get today's word of the day
   * Caches result for 24 hours
   */
  async getWordOfTheDay(): Promise<WordOfTheDay | null> {
    // Check cache first
    if (this.wordOfTheDayCache && Date.now() < this.wordOfTheDayCacheExpiry) {
      return this.wordOfTheDayCache;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/word-of-day`);
      const result = await response.json();

      if (result.success && result.data) {
        this.wordOfTheDayCache = result.data;
        // Cache for 24 hours (with 1 hour buffer for timezone changes)
        this.wordOfTheDayCacheExpiry = Date.now() + (25 * 60 * 60 * 1000);
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch word of the day:', error);
      return null;
    }
  }

  /**
   * Get word of the day for a specific date
   */
  async getWordOfTheDayByDate(date: string): Promise<WordOfTheDay | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/word-of-day/${date}`);
      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      }

      return null;
    } catch (error) {
      console.error(`Failed to fetch word of the day for ${date}:`, error);
      return null;
    }
  }

  /**
   * Get a random sponsor question
   * Caches result for 1 hour
   */
  async getSponsorQuestion(level: number = 1, comboCount: number = 1): Promise<SponsorQuestion | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsor-question?level=${level}&combo_count=${comboCount}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch sponsor question:', error);
      return null;
    }
  }

  /**
   * Get a specific sponsor question by ID
   */
  async getSponsorQuestionById(id: number, comboCount: number = 1): Promise<SponsorQuestion | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsor-question/${id}?combo_count=${comboCount}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      }

      return null;
    } catch (error) {
      console.error(`Failed to fetch sponsor question ${id}:`, error);
      return null;
    }
  }

  /**
   * Create or update a game session
   */
  async createOrUpdateGameSession(data: {
    session_token?: string;
    crazygames_user_id?: string;
    level_reached: number;
    final_score: number;
    words_found: number;
    duration_seconds?: number;
  }): Promise<GameSessionResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/game-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.data) {
        this.sessionToken = result.data.session_token;
        this.gameSessionId = result.data.game_session_id;
        return result;
      }

      return null;
    } catch (error) {
      console.error('Failed to create/update game session:', error);
      return null;
    }
  }

  /**
   * Submit a score
   */
  async submitScore(data: {
    game_session_id: string;
    crazygames_user_id?: string;
    word: string;
    points: number;
    combo_count: number;
    level: number;
    word_type: 'normal' | 'word_of_day' | 'sponsor_trivia';
    word_id?: number;
    question_id?: number;
  }): Promise<ScoreSubmissionResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        return result;
      }

      return null;
    } catch (error) {
      console.error('Failed to submit score:', error);
      return null;
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(type: 'all_time' | 'daily' | 'weekly' | 'monthly' = 'all_time', limit: number = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard?type=${type}&limit=${limit}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  }

  /**
   * Get session token
   */
  getSessionToken(): string | null {
    return this.sessionToken;
  }

  /**
   * Get game session ID
   */
  getGameSessionId(): string | null {
    return this.gameSessionId;
  }

  /**
   * Set session token (for persistence)
   */
  setSessionToken(token: string): void {
    this.sessionToken = token;
  }

  /**
   * Set game session ID (for persistence)
   */
  setGameSessionId(id: string): void {
    this.gameSessionId = id;
  }

  /**
   * Clear caches
   */
  clearCache(): void {
    this.wordOfTheDayCache = null;
    this.wordOfTheDayCacheExpiry = 0;
    // this.sponsorQuestionsCache = [];
    // this.sponsorQuestionsCacheExpiry = 0;
  }
}

export const gameApiService = new GameApiService();
