/**
 * CrazyGamesService - Wrapper for CrazyGames SDK v3
 * Handles video ads for power-ups and other SDK features
 */

// Type definitions for CrazyGames SDK
interface CrazyGamesSDK {
  SDK: {
    init: () => Promise<void>;
    game: {
      gameplayStart: () => void;
      gameplayStop: () => void;
    };
    ad: {
      requestAd: (
        type: 'midgame' | 'rewarded',
        callbacks: {
          adStarted?: () => void;
          adError?: (error: { code: string; message: string }) => void;
          adFinished?: () => void;
        }
      ) => void;
      hasAdblock: () => Promise<boolean>;
    };
    data: {
      setItem: (key: string, value: any) => Promise<void>;
      getItem: (key: string) => Promise<any>;
      removeItem: (key: string) => Promise<void>;
      clear: () => Promise<void>;
    };
  };
}

declare global {
  interface Window {
    CrazyGames?: CrazyGamesSDK;
  }
}

export class CrazyGamesService {
  private static instance: CrazyGamesService;
  private isSDKLoaded: boolean = false;
  private hasAdblock: boolean = false;
  private isInitialized: boolean = false; // SDK initialization status

  private constructor() {
    this.checkSDKLoaded();
  }

  static getInstance(): CrazyGamesService {
    if (!CrazyGamesService.instance) {
      CrazyGamesService.instance = new CrazyGamesService();
    }
    return CrazyGamesService.instance;
  }

  /**
   * Check if SDK is loaded
   */
  private checkSDKLoaded(): void {
    if (typeof window !== 'undefined' && window.CrazyGames?.SDK) {
      this.isSDKLoaded = true;
      // Don't auto-check adblock here anymore, do it after init
    } else {
      // Retry after a short delay
      setTimeout(() => this.checkSDKLoaded(), 100);
    }
  }

  /**
   * Initialize the SDK (Required for v3)
   */
  async initialize(): Promise<void> {
    if (!this.isSDKLoaded) {
      debugWarn('SDK not loaded yet, waiting...');
      await new Promise<void>(resolve => {
        const check = setInterval(() => {
          if (this.isSDKLoaded) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });
    }

    try {
      await window.CrazyGames!.SDK.init();
      this.isInitialized = true;
      console.log('[CrazyGames] SDK Initialized');

      // Check adblock after initialization
      this.hasAdblock = await window.CrazyGames!.SDK.ad.hasAdblock();
      console.log('[CrazyGames] Adblock detected:', this.hasAdblock);

    } catch (error) {
      console.error('[CrazyGames] Failed to initialize SDK:', error);
    }
  }

  /**
   * Track gameplay start
   */
  gameplayStart(): void {
    if (!this.isInitialized) return;
    try {
      window.CrazyGames!.SDK.game.gameplayStart();
      console.log('[CrazyGames] Gameplay Start tracked');
    } catch (error) {
      console.warn('[CrazyGames] Failed to track gameplay start:', error);
    }
  }

  /**
   * Track gameplay stop
   */
  gameplayStop(): void {
    if (!this.isInitialized) return;
    try {
      window.CrazyGames!.SDK.game.gameplayStop();
      console.log('[CrazyGames] Gameplay Stop tracked');
    } catch (error) {
      console.warn('[CrazyGames] Failed to track gameplay stop:', error);
    }
  }

  /**
   * Request a rewarded ad (for power-ups)
   * @param onReward - Callback when ad finishes successfully
   * @param onError - Callback when ad fails
   */
  requestRewardedAd(
    onReward: () => void,
    onError?: (error: { code: string; message: string }) => void
  ): void {
    if (!this.isInitialized) {
      console.warn('[CrazyGames] SDK not initialized, cannot show ad');
      if (onError) {
        onError({ code: 'sdk_not_initialized', message: 'CrazyGames SDK not initialized' });
      }
      return;
    }

    if (this.hasAdblock) {
      console.warn('[CrazyGames] Adblock detected, cannot show ad');
      if (onError) {
        onError({ code: 'adblock', message: 'Adblock detected' });
      }
      return;
    }

    const callbacks = {
      adStarted: () => {
        console.log('[CrazyGames] Ad started');
        // Mute audio and pause game (handled by caller)
      },
      adError: (error: { code: string; message: string }) => {
        console.warn('[CrazyGames] Ad error:', error);
        // Unmute audio and resume game (handled by caller)
        if (onError) {
          onError(error);
        }
      },
      adFinished: () => {
        console.log('[CrazyGames] Ad finished - giving reward');
        // Unmute audio and resume game (handled by caller)
        onReward();
      },
    };

    try {
      window.CrazyGames!.SDK.ad.requestAd('rewarded', callbacks);
    } catch (error) {
      console.error('[CrazyGames] Failed to request ad:', error);
      if (onError) {
        onError({ code: 'other', message: 'Failed to request ad' });
      }
    }
  }

  /**
   * Request a midgame ad (interstitial)
   * @param onFinished - Callback when ad finishes or errors (game should resume)
   */
  requestMidgameAd(onFinished: () => void): void {
    if (!this.isInitialized || this.hasAdblock) {
      onFinished();
      return;
    }

    const callbacks = {
      adStarted: () => {
        console.log('[CrazyGames] Midgame Ad started');
      },
      adError: (error: { code: string; message: string }) => {
        console.warn('[CrazyGames] Midgame Ad error:', error);
        onFinished();
      },
      adFinished: () => {
        console.log('[CrazyGames] Midgame Ad finished');
        onFinished();
      },
    };

    try {
      window.CrazyGames!.SDK.ad.requestAd('midgame', callbacks);
    } catch (error) {
      console.error('[CrazyGames] Failed to request midgame ad:', error);
      onFinished();
    }
  }

  /**
   * Save data to CrazyGames cloud storage (with localStorage fallback)
   */
  async saveData(key: string, value: any): Promise<void> {
    try {
      if (this.isInitialized && window.CrazyGames?.SDK?.data) {
        await window.CrazyGames.SDK.data.setItem(key, JSON.stringify(value));
        console.log(`[CrazyGames] Saved data for key: ${key}`);
      } else {
        // Fallback to localStorage
        localStorage.setItem(key, JSON.stringify(value));
        console.log(`[CrazyGames] Saved data to localStorage for key: ${key}`);
      }
    } catch (error) {
      console.error(`[CrazyGames] Failed to save data for key: ${key}`, error);
    }
  }

  /**
   * Load data from CrazyGames cloud storage (with localStorage fallback)
   */
  async loadData(key: string): Promise<any | null> {
    try {
      let data = null;

      if (this.isInitialized && window.CrazyGames?.SDK?.data) {
        const result = await window.CrazyGames.SDK.data.getItem(key);
        if (result) {
          data = JSON.parse(result);
          console.log(`[CrazyGames] Loaded data for key: ${key}`);
        }
      } else {
        // Fallback to localStorage
        const result = localStorage.getItem(key);
        if (result) {
          data = JSON.parse(result);
          console.log(`[CrazyGames] Loaded data from localStorage for key: ${key}`);
        }
      }
      return data;
    } catch (error) {
      console.error(`[CrazyGames] Failed to load data for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Check if SDK is available
   */
  isAvailable(): boolean {
    return this.isInitialized && !this.hasAdblock;
  }

  /**
   * Get adblock status
   */
  getAdblockStatus(): boolean {
    return this.hasAdblock;
  }
}

// Helper for debug logging if needed (shim since we removed imports)
function debugWarn(msg: string) {
  console.warn('[CrazyGamesService]', msg);
}

// Export singleton instance
export default CrazyGamesService.getInstance();
