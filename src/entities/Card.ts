import type { Card as ICard, CardEffect } from '../types/CardTypes';
import { CardCategoryConst, CardRarityConst } from '../types/CardTypes';

export class Card implements ICard {
  id: string;
  name: string;
  description: string;
  category: import('../types/CardTypes').CardCategory;
  type: import('../types/CardTypes').CardType;
  rarity: import('../types/CardTypes').CardRarity;
  cost: number;
  effects: CardEffect[];
  flavorText?: string;
  imageKey?: string;

  constructor(cardData: ICard) {
    this.id = cardData.id;
    this.name = cardData.name;
    this.description = cardData.description;
    this.category = cardData.category;
    this.type = cardData.type;
    this.rarity = cardData.rarity;
    this.cost = cardData.cost;
    this.effects = [...cardData.effects];
    this.flavorText = cardData.flavorText;
    this.imageKey = cardData.imageKey;
  }

  /**
   * Creates a deep copy of this card
   */
  public clone(): Card {
    return new Card({
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      type: this.type,
      rarity: this.rarity,
      cost: this.cost,
      effects: this.effects.map(effect => ({ ...effect })),
      flavorText: this.flavorText,
      imageKey: this.imageKey,
    });
  }

  /**
   * Checks if the card can be played with the given energy
   */
  public canPlay(currentEnergy: number): boolean {
    return currentEnergy >= this.cost;
  }

  /**
   * Gets a formatted description of the card's effects
   */
  public getEffectDescription(): string {
    return this.effects
      .map(effect => {
        switch (effect.type) {
          case 'damage':
            return `Deal ${effect.value} damage`;
          case 'defense':
            return `Gain ${effect.value} defense`;
          case 'heal':
            return `Heal ${effect.value} health`;
          case 'draw':
            return `Draw ${effect.value} card${effect.value > 1 ? 's' : ''}`;
          case 'dodge':
            return `Avoid the next ${effect.value} attack${effect.value > 1 ? 's' : ''}`;
          case 'rewind':
            return 'Shuffle discard pile into draw pile';
          default:
            return effect.type;
        }
      })
      .join('. ');
  }

  /**
   * Gets the card's color based on category for UI styling
   */
  public getCategoryColor(): string {
    switch (this.category) {
      case CardCategoryConst.TIMECRAFT:
        return '#4A90E2'; // Blue
      case CardCategoryConst.MIND:
        return '#9B59B6'; // Purple
      case CardCategoryConst.SOCIAL:
        return '#E74C3C'; // Red
      case CardCategoryConst.PHYSICAL:
        return '#27AE60'; // Green
      default:
        return '#95A5A6'; // Gray
    }
  }

  /**
   * Gets the card's rarity color for UI styling
   */
  public getRarityColor(): string {
    switch (this.rarity) {
      case CardRarityConst.BASIC:
        return '#BDC3C7'; // Light gray
      case CardRarityConst.COMMON:
        return '#FFFFFF'; // White
      case CardRarityConst.UNCOMMON:
        return '#2ECC71'; // Green
      case CardRarityConst.RARE:
        return '#3498DB'; // Blue
      default:
        return '#BDC3C7';
    }
  }

  /**
   * Validates that the card data is complete and correct
   */
  public validate(): boolean {
    if (!this.id || !this.name || !this.description) {
      return false;
    }
    if (this.cost < 0) {
      return false;
    }
    if (!this.effects || this.effects.length === 0) {
      return false;
    }
    return true;
  }

  /**
   * Converts card to a plain object for serialization
   */
  public toJSON(): ICard {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      type: this.type,
      rarity: this.rarity,
      cost: this.cost,
      effects: this.effects.map(effect => ({ ...effect })),
      flavorText: this.flavorText,
      imageKey: this.imageKey,
    };
  }

  /**
   * Creates a Card from a plain object
   */
  public static fromJSON(data: ICard): Card {
    return new Card(data);
  }
}
