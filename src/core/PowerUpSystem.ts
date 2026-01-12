/**
 * PowerUpSystem - Manages power-ups
 * Framework-agnostic core game logic
 */

import type { PowerUp, PowerUpType, PowerUpEffect, Position } from '../types/game';
import { POWER_UP_CONFIG, POWER_UP_ICONS, POWER_UP_LABELS } from '../constants/powerups';

export class PowerUpSystem {
  private powerUps: Map<PowerUpType, PowerUp>;

  constructor() {
    this.powerUps = new Map();
    this.initializePowerUps();
  }

  /**
   * Initialize all power-ups with default uses
   */
  private initializePowerUps(): void {
    const powerUpTypes: PowerUpType[] = ['bomb', 'lightning', 'freeze', 'wind', 'blank'];
    
    for (const type of powerUpTypes) {
      this.powerUps.set(type, {
        type,
        uses: POWER_UP_CONFIG.INITIAL_USES,
        isAvailable: true,
      });
    }
  }

  /**
   * Get all power-ups
   */
  getAllPowerUps(): PowerUp[] {
    // Return power-ups in guaranteed order by mapping over ordered types
    const orderedTypes: PowerUpType[] = ['bomb', 'lightning', 'freeze', 'wind', 'blank'];
    const result = orderedTypes
      .map(type => this.powerUps.get(type))
      .filter((pu): pu is PowerUp => pu !== undefined);
    
    // Debug log to verify all power-ups are returned
    if (result.length !== 5) {
      console.error('[PowerUpSystem] ❌ Expected 5 power-ups, got', result.length, 'Types:', result.map(p => p.type));
      console.error('[PowerUpSystem] Map keys:', Array.from(this.powerUps.keys()));
    }
    
    return result;
  }

  /**
   * Get a specific power-up
   */
  getPowerUp(type: PowerUpType): PowerUp | undefined {
    return this.powerUps.get(type);
  }

  /**
   * Check if a power-up can be used
   */
  canUse(type: PowerUpType): boolean {
    const powerUp = this.powerUps.get(type);
    return powerUp !== undefined && powerUp.isAvailable && powerUp.uses > 0;
  }

  /**
   * Use a power-up (decrement uses)
   */
  use(type: PowerUpType): boolean {
    const powerUp = this.powerUps.get(type);
    if (!powerUp || !this.canUse(type)) {
      return false;
    }

    powerUp.uses--;
    powerUp.isAvailable = powerUp.uses > 0;
    return true;
  }

  /**
   * Add uses to a power-up (reward from watching ad)
   */
  addUses(type: PowerUpType, amount: number = 1): boolean {
    const powerUp = this.powerUps.get(type);
    if (!powerUp) {
      return false;
    }

    powerUp.uses += amount;
    powerUp.isAvailable = true;
    return true;
  }

  /**
   * Reset all power-ups to initial state
   */
  reset(): void {
    this.initializePowerUps();
  }

  /**
   * Get icon for power-up type
   */
  getIcon(type: PowerUpType): string {
    return POWER_UP_ICONS[type];
  }

  /**
   * Get label for power-up type
   */
  getLabel(type: PowerUpType): string {
    return POWER_UP_LABELS[type];
  }

  /**
   * Create a power-up effect
   */
  createEffect(type: PowerUpType, position?: Position, metadata?: Record<string, unknown>): PowerUpEffect {
    const effect: PowerUpEffect = {
      type,
      position,
      metadata,
    };

    // Add duration for freeze
    if (type === 'freeze') {
      effect.duration = POWER_UP_CONFIG.FREEZE_DURATION;
    }

    return effect;
  }
}
