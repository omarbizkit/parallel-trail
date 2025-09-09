import { describe, it, expect } from 'vitest';
import { Card } from './Card';
import {
  CardCategoryConst,
  CardTypeConst,
  CardRarityConst,
  type CardEffect,
  type Card as ICard,
} from '../types/CardTypes';

describe('Card', () => {
  const mockCardData = {
    id: 'test_card',
    name: 'Test Card',
    description: 'A test card for unit testing',
    category: CardCategoryConst.PHYSICAL,
    type: CardTypeConst.ATTACK,
    rarity: CardRarityConst.COMMON,
    cost: 2,
    effects: [{ type: 'damage', value: 5, target: 'enemy' } as CardEffect],
    flavorText: 'This is a test card',
    imageKey: 'test_image',
  };

  describe('constructor', () => {
    it('should create a card with all properties', () => {
      const card = new Card(mockCardData);

      expect(card.id).toBe(mockCardData.id);
      expect(card.name).toBe(mockCardData.name);
      expect(card.description).toBe(mockCardData.description);
      expect(card.category).toBe(mockCardData.category);
      expect(card.type).toBe(mockCardData.type);
      expect(card.rarity).toBe(mockCardData.rarity);
      expect(card.cost).toBe(mockCardData.cost);
      expect(card.effects).toEqual(mockCardData.effects);
      expect(card.flavorText).toBe(mockCardData.flavorText);
      expect(card.imageKey).toBe(mockCardData.imageKey);
    });
  });

  describe('clone', () => {
    it('should create a deep copy of the card', () => {
      const originalCard = new Card(mockCardData);
      const clonedCard = originalCard.clone();

      expect(clonedCard).not.toBe(originalCard);
      expect(clonedCard.id).toBe(originalCard.id);
      expect(clonedCard.name).toBe(originalCard.name);
      expect(clonedCard.effects).not.toBe(originalCard.effects);
      expect(clonedCard.effects).toEqual(originalCard.effects);
    });
  });

  describe('canPlay', () => {
    it('should return true when player has enough energy', () => {
      const card = new Card(mockCardData);

      expect(card.canPlay(3)).toBe(true);
      expect(card.canPlay(2)).toBe(true);
    });

    it('should return false when player has insufficient energy', () => {
      const card = new Card(mockCardData);

      expect(card.canPlay(1)).toBe(false);
      expect(card.canPlay(0)).toBe(false);
    });
  });

  describe('getEffectDescription', () => {
    it('should return formatted effect descriptions', () => {
      const damageCard = new Card({
        ...mockCardData,
        effects: [
          { type: 'damage', value: 8, target: 'enemy' } as CardEffect,
          { type: 'draw', value: 2, target: 'self' } as CardEffect,
        ],
      });

      const description = damageCard.getEffectDescription();
      expect(description).toBe('Deal 8 damage. Draw 2 cards');
    });

    it('should handle different effect types', () => {
      const multiEffectCard = new Card({
        ...mockCardData,
        effects: [
          { type: 'heal', value: 5, target: 'self' } as CardEffect,
          { type: 'defense', value: 3, target: 'self' } as CardEffect,
          { type: 'dodge', value: 1, target: 'self' } as CardEffect,
        ],
      });

      const description = multiEffectCard.getEffectDescription();
      expect(description).toBe('Heal 5 health. Gain 3 defense. Avoid the next 1 attack');
    });
  });

  describe('getCategoryColor', () => {
    it('should return correct colors for each category', () => {
      const timecraftCard = new Card({
        ...mockCardData,
        category: CardCategoryConst.TIMECRAFT,
      } as ICard);
      const mindCard = new Card({ ...mockCardData, category: CardCategoryConst.MIND } as ICard);
      const socialCard = new Card({ ...mockCardData, category: CardCategoryConst.SOCIAL } as ICard);
      const physicalCard = new Card({
        ...mockCardData,
        category: CardCategoryConst.PHYSICAL,
      } as ICard);

      expect(timecraftCard.getCategoryColor()).toBe('#4A90E2');
      expect(mindCard.getCategoryColor()).toBe('#9B59B6');
      expect(socialCard.getCategoryColor()).toBe('#E74C3C');
      expect(physicalCard.getCategoryColor()).toBe('#27AE60');
    });
  });

  describe('getRarityColor', () => {
    it('should return correct colors for each rarity', () => {
      const basicCard = new Card({ ...mockCardData, rarity: CardRarityConst.BASIC } as ICard);
      const commonCard = new Card({ ...mockCardData, rarity: CardRarityConst.COMMON } as ICard);
      const uncommonCard = new Card({ ...mockCardData, rarity: CardRarityConst.UNCOMMON } as ICard);
      const rareCard = new Card({ ...mockCardData, rarity: CardRarityConst.RARE } as ICard);

      expect(basicCard.getRarityColor()).toBe('#BDC3C7');
      expect(commonCard.getRarityColor()).toBe('#FFFFFF');
      expect(uncommonCard.getRarityColor()).toBe('#2ECC71');
      expect(rareCard.getRarityColor()).toBe('#3498DB');
    });
  });

  describe('validate', () => {
    it('should return true for valid cards', () => {
      const card = new Card(mockCardData);
      expect(card.validate()).toBe(true);
    });

    it('should return false for cards with missing required fields', () => {
      const invalidCard = new Card({
        ...mockCardData,
        id: '',
        name: '',
        description: '',
      } as ICard);
      expect(invalidCard.validate()).toBe(false);
    });

    it('should return false for cards with negative cost', () => {
      const invalidCard = new Card({
        ...mockCardData,
        cost: -1,
      } as ICard);
      expect(invalidCard.validate()).toBe(false);
    });

    it('should return false for cards with no effects', () => {
      const invalidCard = new Card({
        ...mockCardData,
        effects: [],
      } as ICard);
      expect(invalidCard.validate()).toBe(false);
    });
  });

  describe('toJSON and fromJSON', () => {
    it('should serialize and deserialize cards correctly', () => {
      const originalCard = new Card(mockCardData);
      const json = originalCard.toJSON();
      const deserializedCard = Card.fromJSON(json);

      expect(deserializedCard.id).toBe(originalCard.id);
      expect(deserializedCard.name).toBe(originalCard.name);
      expect(deserializedCard.effects).toEqual(originalCard.effects);
      expect(deserializedCard).not.toBe(originalCard);
    });
  });
});
