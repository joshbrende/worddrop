/**
 * CrazyGamesService - Wrapper for CrazyGames SDK
 * Handles video ads for power-ups and other SDK features
 */

// Type definitions for CrazyGames SDK
interface CrazyGamesSDK {
  SDK: {
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
    if (typeof window !== 'undefined' && window.CrazyGames?.SDK?.ad) {
      this.isSDKLoaded = true;
      this.checkAdblock();
    } else {
      // Retry after a short delay
      setTimeout(() => this.checkSDKLoaded(), 100);
    }
  }

  /**
   * Check if user has adblock
   */
  private async checkAdblock(): Promise<void> {
    if (!this.isSDKLoaded) return;

    try {
      this.hasAdblock = await window.CrazyGames!.SDK.ad.hasAdblock();
      console.log('[CrazyGames] Adblock detected:', this.hasAdblock);
    } catch (error) {
      console.warn('[CrazyGames] Failed to check adblock:', error);
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
    if (!this.isSDKLoaded) {
      console.warn('[CrazyGames] SDK not loaded, cannot show ad');
      if (onError) {
        onError({ code: 'sdk_not_loaded', message: 'CrazyGames SDK not available' });
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
   * Check if SDK is available
   */
  isAvailable(): boolean {
    return this.isSDKLoaded && !this.hasAdblock;
  }

  /**
   * Get adblock status
   */
  getAdblockStatus(): boolean {
    return this.hasAdblock;
  }
}

// Export singleton instance
export default CrazyGamesService.getInstance();
