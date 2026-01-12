/**
 * SoundService - Manages all game sounds and audio effects
 * Maps sound files to game activities
 */

// Sound effect file paths (relative to public/assets/sounds)
export const SOUND_EFFECTS = {
  // UI Sounds
  menu: '/assets/sounds/menu.mp3',              // Menu background music
  loop_menu: '/assets/sounds/loop_menu.mp3',    // Menu background music (looping variant)
  button: '/assets/sounds/button.mp3',          // Button press
  button_press: '/assets/sounds/button_press.mp3', // Button press (alternative)
  error: '/assets/sounds/error.mp3',            // Error sound

  // Game Sounds
  music: '/assets/sounds/music.mp3',            // Background music (gameplay)
  in_game: '/assets/sounds/in-game.mp3',        // Background music (gameplay alternative)
  
  // Word Formation
  word_formed: '/assets/sounds/word-formed.mp3', // When a word is formed (single word)
  combo: '/assets/sounds/combo.mp3',            // When a combo word is formed (multiple words in sequence)

  // Level Progression
  level_up: '/assets/sounds/level_up.mp3',      // When level-up banner appears

  // Letter Movement
  move: '/assets/sounds/move.mp3',              // When letter moves left/right
  letter_drop: '/assets/sounds/letter_drop.mp3', // When letter drops (manual drop)

  // Power-Ups
  bomb: '/assets/sounds/bomb.mp3',              // Bomb power-up explosion
  lightning: '/assets/sounds/lightning.mp3',    // Lightning power-up
  freeze: '/assets/sounds/freeze.mp3',          // Freeze power-up
  wind: '/assets/sounds/wind.mp3',              // Wind power-up

  // Game State
  game_over: '/assets/sounds/game_over.mp3',    // When game over occurs

  // Additional (not yet used)
  career_mode: '/assets/sounds/career-mode.mp3',
  career_timer: '/assets/sounds/career-timer.mp3',
  time_trial: '/assets/sounds/time-trial.mp3',
  timer: '/assets/sounds/timer.mp3',
} as const;

export type SoundEffectName = keyof typeof SOUND_EFFECTS;

class SoundService {
  private sounds: Map<SoundEffectName, HTMLAudioElement> = new Map();
  private backgroundMusic: HTMLAudioElement | null = null;
  private currentBackgroundMusic: SoundEffectName | null = null;
  private pendingMusic: SoundEffectName | null = null; // Music waiting for user interaction
  private initialized: boolean = false;
  private isMusicEnabled: boolean = true;
  private isEffectsEnabled: boolean = true;
  private hasInteracted: boolean = false;
  private musicVolume: number = 0.5;
  private effectsVolume: number = 0.7;

  private static instance: SoundService | null = null;

  private constructor() {
    // Initialize sound service
    this.setupInteractionListener();
    this.loadSettings();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  /**
   * Setup interaction listener (required for autoplay policy)
   */
  private setupInteractionListener(): void {
    if (typeof window === 'undefined') return;

    const handleInteraction = () => {
      this.hasInteracted = true;
      
      // Play pending music if there was music waiting for interaction
      if (this.pendingMusic && this.isMusicEnabled) {
        this.playBackgroundMusic(this.pendingMusic);
        this.pendingMusic = null;
      }
      
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    if (typeof window === 'undefined') return;

    try {
      // Load music enabled (backwards compatible with old soundEnabled)
      const savedMusicEnabled = localStorage.getItem('musicEnabled');
      const savedSoundEnabled = localStorage.getItem('soundEnabled'); // Legacy support
      if (savedMusicEnabled !== null) {
        this.isMusicEnabled = savedMusicEnabled === 'true';
      } else if (savedSoundEnabled !== null) {
        // Migrate from old single toggle
        this.isMusicEnabled = savedSoundEnabled === 'true';
      }

      // Load effects enabled (backwards compatible with old soundEnabled)
      const savedEffectsEnabled = localStorage.getItem('effectsEnabled');
      if (savedEffectsEnabled !== null) {
        this.isEffectsEnabled = savedEffectsEnabled === 'true';
      } else if (savedSoundEnabled !== null) {
        // Migrate from old single toggle
        this.isEffectsEnabled = savedSoundEnabled === 'true';
      }

      const savedMusicVolume = localStorage.getItem('musicVolume');
      if (savedMusicVolume !== null) {
        this.musicVolume = parseFloat(savedMusicVolume);
      }

      const savedEffectsVolume = localStorage.getItem('effectsVolume');
      if (savedEffectsVolume !== null) {
        this.effectsVolume = parseFloat(savedEffectsVolume);
      }
    } catch (error) {
      console.warn('Failed to load sound settings:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('musicEnabled', String(this.isMusicEnabled));
      localStorage.setItem('effectsEnabled', String(this.isEffectsEnabled));
      localStorage.setItem('musicVolume', String(this.musicVolume));
      localStorage.setItem('effectsVolume', String(this.effectsVolume));
    } catch (error) {
      console.warn('Failed to save sound settings:', error);
    }
  }

  /**
   * Initialize sound service (load all sounds)
   */
  async initialize(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    try {
      // Preload all sound effects
      const loadPromises = (Object.keys(SOUND_EFFECTS) as SoundEffectName[]).map(async (name) => {
        try {
          const audio = new Audio(SOUND_EFFECTS[name]);
          audio.volume = this.effectsVolume;
          audio.preload = 'auto';
          
          // Wait for audio to be ready
          await new Promise<void>((resolve, reject) => {
            audio.addEventListener('canplaythrough', () => resolve(), { once: true });
            audio.addEventListener('error', () => reject(new Error(`Failed to load ${name}`)), { once: true });
            audio.load();
          });

          this.sounds.set(name, audio);
        } catch (error) {
          console.warn(`Failed to load sound ${name}:`, error);
        }
      });

      await Promise.all(loadPromises);
      this.initialized = true;
      console.log(`✅ SoundService initialized: ${this.sounds.size} sounds loaded`);
    } catch (error) {
      console.error('Failed to initialize SoundService:', error);
    }
  }

  /**
   * Play a sound effect
   */
  play(soundName: SoundEffectName): void {
    if (!this.initialized || !this.isEffectsEnabled || !this.hasInteracted) {
      return;
    }

    const audio = this.sounds.get(soundName);
    if (audio) {
      try {
        // Clone audio to allow overlapping sounds
        const audioClone = audio.cloneNode() as HTMLAudioElement;
        audioClone.volume = this.effectsVolume;
        audioClone.play().catch((error) => {
          if (error.name !== 'AbortError') {
            console.warn(`Failed to play sound ${soundName}:`, error);
          }
        });
      } catch (error) {
        console.warn(`Error playing sound ${soundName}:`, error);
      }
    }
  }

  /**
   * Play background music (looping)
   */
  playBackgroundMusic(musicName: SoundEffectName = 'music'): void {
    if (!this.initialized || !this.isMusicEnabled) {
      return;
    }

    // If user hasn't interacted yet, store the music to play after interaction
    if (!this.hasInteracted) {
      this.pendingMusic = musicName;
      return;
    }

    // Stop current background music if playing
    this.stopBackgroundMusic();

    const audio = this.sounds.get(musicName);
    if (audio) {
      try {
        this.backgroundMusic = audio.cloneNode() as HTMLAudioElement;
        this.backgroundMusic.volume = this.musicVolume;
        this.backgroundMusic.loop = true;
        this.currentBackgroundMusic = musicName;
        
        this.backgroundMusic.play().catch((error) => {
          if (error.name !== 'AbortError') {
            console.warn(`Failed to play background music ${musicName}:`, error);
          }
        });
      } catch (error) {
        console.warn(`Error playing background music ${musicName}:`, error);
      }
    }
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic = null;
      this.currentBackgroundMusic = null;
    }
    // Clear pending music as well
    this.pendingMusic = null;
  }

  /**
   * Set music enabled/disabled
   */
  setMusicEnabled(enabled: boolean): void {
    this.isMusicEnabled = enabled;
    this.saveSettings();

    if (!enabled) {
      this.stopBackgroundMusic();
    } else if (this.currentBackgroundMusic && this.hasInteracted) {
      this.playBackgroundMusic(this.currentBackgroundMusic);
    }
  }

  /**
   * Set sound effects enabled/disabled
   */
  setEffectsEnabled(enabled: boolean): void {
    this.isEffectsEnabled = enabled;
    this.saveSettings();
  }

  /**
   * Set sound enabled/disabled (deprecated - use setMusicEnabled/setEffectsEnabled instead)
   * @deprecated Use setMusicEnabled() and setEffectsEnabled() instead
   */
  setSoundEnabled(enabled: boolean): void {
    // For backwards compatibility, set both
    this.setMusicEnabled(enabled);
    this.setEffectsEnabled(enabled);
  }

  /**
   * Set music volume (0.0 to 1.0)
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();

    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.musicVolume;
    }
  }

  /**
   * Set effects volume (0.0 to 1.0)
   */
  setEffectsVolume(volume: number): void {
    this.effectsVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();

    // Update all loaded sounds
    this.sounds.forEach((audio) => {
      audio.volume = this.effectsVolume;
    });
  }

  /**
   * Get current music enabled state
   */
  getMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  /**
   * Get current effects enabled state
   */
  getEffectsEnabled(): boolean {
    return this.isEffectsEnabled;
  }

  /**
   * Get current sound enabled state (deprecated - use getMusicEnabled/getEffectsEnabled instead)
   * @deprecated Use getMusicEnabled() and getEffectsEnabled() instead
   */
  getSoundEnabled(): boolean {
    // For backwards compatibility, return true if either is enabled
    return this.isMusicEnabled || this.isEffectsEnabled;
  }

  /**
   * Get current music volume
   */
  getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * Get current effects volume
   */
  getEffectsVolume(): number {
    return this.effectsVolume;
  }

  /**
   * Mute all audio (for ads)
   */
  muteAll(): void {
    // Mute background music
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = 0;
    }
    
    // Mute all sound effects
    this.sounds.forEach((audio) => {
      audio.volume = 0;
    });
  }

  /**
   * Unmute all audio (restore volumes after ads)
   */
  unmuteAll(): void {
    // Restore background music volume
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.musicVolume;
    }
    
    // Restore sound effects volume
    this.sounds.forEach((audio) => {
      audio.volume = this.effectsVolume;
    });
  }
}

// Export singleton instance
const soundService = SoundService.getInstance();
export default soundService;
