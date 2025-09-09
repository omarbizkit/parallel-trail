import type { CardEffect, CardPlayResult } from '../types/CardTypes';
import { GameState } from './GameState';
import { DeckSystem } from './DeckSystem';

export interface EffectContext {
  gameState: GameState;
  deckSystem: DeckSystem;
  currentEnergy: number;
  isPlayerTurn: boolean;
}

export interface EffectExecutionResult {
  success: boolean;
  message?: string;
  energyChange: number;
  healthChange: number;
  defenseChange: number;
  additionalEffects?: CardEffect[];
}

export class CardEffectEngine {
  private gameState: GameState;
  private deckSystem: DeckSystem; // Used in effect execution methods via context parameter

  constructor(gameState: GameState, deckSystem: DeckSystem) {
    this.gameState = gameState;
    this.deckSystem = deckSystem;
  }

  /**
   * Executes a card effect and returns the result
   */
  public executeEffect(effect: CardEffect, context: EffectContext): EffectExecutionResult {
    try {
      switch (effect.type) {
        case 'damage':
          return this.executeDamageEffect(effect, context);
        case 'defense':
          return this.executeDefenseEffect(effect, context);
        case 'heal':
          return this.executeHealEffect(effect, context);
        case 'draw':
          return this.executeDrawEffect(effect, context);
        case 'dodge':
          return this.executeDodgeEffect(effect, context);
        case 'rewind':
          return this.executeRewindEffect(effect, context);
        default:
          return {
            success: false,
            message: `Unknown effect type: ${effect.type}`,
            energyChange: 0,
            healthChange: 0,
            defenseChange: 0,
          };
      }
    } catch {
      return {
        success: false,
        message: 'Effect execution failed',
        energyChange: 0,
        healthChange: 0,
        defenseChange: 0,
      };
    }
  }

  /**
   * Executes multiple card effects in sequence
   */
  public executeEffects(effects: CardEffect[], context: EffectContext): CardPlayResult {
    const results: EffectExecutionResult[] = [];
    let totalEnergyChange = 0;
    let totalHealthChange = 0;
    let totalDefenseChange = 0;

    for (const effect of effects) {
      const result = this.executeEffect(effect, context);
      results.push(result);

      if (!result.success) {
        return {
          success: false,
          message: result.message,
          energySpent: 0,
          effectsApplied: [],
        };
      }

      totalEnergyChange += result.energyChange;
      totalHealthChange += result.healthChange;
      totalDefenseChange += result.defenseChange;
    }

    // Apply cumulative changes to game state
    this.applyCumulativeChanges(totalEnergyChange, totalHealthChange, totalDefenseChange);

    return {
      success: true,
      energySpent: context.currentEnergy, // This should be handled by the card cost
      effectsApplied: effects,
    };
  }

  private executeDamageEffect(effect: CardEffect, _context: EffectContext): EffectExecutionResult {
    // For now, we'll just return the effect data
    // In the future, this will interface with a combat system
    return {
      success: true,
      message: `Dealt ${effect.value} damage`,
      energyChange: 0,
      healthChange: -effect.value, // Negative for enemy damage
      defenseChange: 0,
    };
  }

  private executeDefenseEffect(effect: CardEffect, _context: EffectContext): EffectExecutionResult {
    return {
      success: true,
      message: `Gained ${effect.value} defense`,
      energyChange: 0,
      healthChange: 0,
      defenseChange: effect.value,
    };
  }

  private executeHealEffect(effect: CardEffect, context: EffectContext): EffectExecutionResult {
    const playerData = context.gameState.getPlayerData();
    const maxHealth = playerData.maxHealth;
    const currentHealth = playerData.health;

    // Calculate actual healing (can't exceed max health)
    const healAmount = Math.min(effect.value, maxHealth - currentHealth);

    if (healAmount <= 0) {
      return {
        success: true,
        message: 'Already at full health',
        energyChange: 0,
        healthChange: 0,
        defenseChange: 0,
      };
    }

    return {
      success: true,
      message: `Healed ${healAmount} health`,
      energyChange: 0,
      healthChange: healAmount,
      defenseChange: 0,
    };
  }

  private executeDrawEffect(effect: CardEffect, context: EffectContext): EffectExecutionResult {
    const drawnCards = context.deckSystem.drawCards(effect.value);

    return {
      success: true,
      message: `Drew ${drawnCards.length} card${drawnCards.length !== 1 ? 's' : ''}`,
      energyChange: 0,
      healthChange: 0,
      defenseChange: 0,
    };
  }

  private executeDodgeEffect(effect: CardEffect, _context: EffectContext): EffectExecutionResult {
    // Dodge effects will be implemented when we have a combat system
    // For now, we'll just acknowledge the effect
    return {
      success: true,
      message: `Will avoid the next ${effect.value} attack${effect.value !== 1 ? 's' : ''}`,
      energyChange: 0,
      healthChange: 0,
      defenseChange: 0,
    };
  }

  private executeRewindEffect(_effect: CardEffect, _context: EffectContext): EffectExecutionResult {
    // Get the discard pile and shuffle it into the draw pile
    // Use this.deckSystem to avoid unused variable warning
    const discardCount = this.deckSystem.getDiscardPileCount();

    if (discardCount === 0) {
      return {
        success: true,
        message: 'No cards to rewind',
        energyChange: 0,
        healthChange: 0,
        defenseChange: 0,
      };
    }

    // Reshuffle discard into draw pile
    this.deckSystem['reshuffleDiscardPile'](); // Access private method for now

    return {
      success: true,
      message: `Rewound ${discardCount} card${discardCount !== 1 ? 's' : ''} into draw pile`,
      energyChange: 0,
      healthChange: 0,
      defenseChange: 0,
    };
  }

  private applyCumulativeChanges(
    _energyChange: number,
    healthChange: number,
    _defenseChange: number
  ): void {
    const playerData = this.gameState.getPlayerData();

    // Apply health changes
    if (healthChange !== 0) {
      const newHealth = Math.max(
        0,
        Math.min(playerData.maxHealth, playerData.health + healthChange)
      );
      this.gameState.setPlayerData({ health: newHealth });
    }

    // Note: Energy changes are handled by the card cost system
    // Defense changes will be implemented with the combat system
  }

  /**
   * Validates that an effect can be executed
   */
  public canExecuteEffect(effect: CardEffect, context: EffectContext): boolean {
    try {
      switch (effect.type) {
        case 'damage':
          return effect.value > 0;
        case 'defense':
          return effect.value > 0;
        case 'heal': {
          const playerData = context.gameState.getPlayerData();
          return playerData.health < playerData.maxHealth && effect.value > 0;
        }
        case 'draw':
          return effect.value > 0 && context.deckSystem.getDrawableCardsCount() > 0;
        case 'dodge':
          return effect.value > 0;
        case 'rewind':
          return context.deckSystem.getDiscardPileCount() > 0;
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Gets a description of what an effect will do
   */
  public getEffectDescription(effect: CardEffect): string {
    switch (effect.type) {
      case 'damage':
        return `Deal ${effect.value} damage`;
      case 'defense':
        return `Gain ${effect.value} defense`;
      case 'heal':
        return `Heal ${effect.value} health`;
      case 'draw':
        return `Draw ${effect.value} card${effect.value !== 1 ? 's' : ''}`;
      case 'dodge':
        return `Avoid the next ${effect.value} attack${effect.value !== 1 ? 's' : ''}`;
      case 'rewind':
        return 'Shuffle discard pile into draw pile';
      default:
        return 'Unknown effect';
    }
  }
}
