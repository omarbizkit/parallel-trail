import { describe, it, expect, beforeEach } from 'vitest';
import { DeckSystem } from './DeckSystem';

describe('DeckSystem', () => {
  let deckSystem: DeckSystem;

  beforeEach(() => {
    deckSystem = DeckSystem.createStarterDeck();
  });

  describe('createStarterDeck', () => {
    it('should create a deck with 8 cards', () => {
      expect(deckSystem.getTotalCardCount()).toBe(8);
    });

    it('should have all cards in draw pile initially', () => {
      expect(deckSystem.getDrawPileCount()).toBe(8);
      expect(deckSystem.getDiscardPileCount()).toBe(0);
      expect(deckSystem.getHand().length).toBe(0);
    });
  });

  describe('drawCards', () => {
    it('should draw cards into hand', () => {
      const drawnCards = deckSystem.drawCards(3);

      expect(drawnCards.length).toBe(3);
      expect(deckSystem.getHand().length).toBe(3);
      expect(deckSystem.getDrawPileCount()).toBe(5);
    });

    it('should respect max hand size', () => {
      // Try to draw more than max hand size (7)
      const drawnCards = deckSystem.drawCards(10);

      expect(drawnCards.length).toBe(7);
      expect(deckSystem.getHand().length).toBe(7);
      expect(deckSystem.isHandFull()).toBe(true);
    });

    it('should reshuffle discard pile when draw pile is empty', () => {
      // Draw all available cards (max 7 in hand)
      deckSystem.drawCards(8);
      expect(deckSystem.getHand().length).toBe(7); // Max hand size is 7
      expect(deckSystem.getDrawPileCount()).toBe(1); // 1 card left undrawn

      // Discard some cards to make room
      const hand = deckSystem.getHand();
      deckSystem.discardCard(hand[0].id);
      deckSystem.discardCard(hand[1].id);

      expect(deckSystem.getDiscardPileCount()).toBe(2);
      expect(deckSystem.getHand().length).toBe(5);

      // Draw the remaining card first
      deckSystem.drawCards(1);
      expect(deckSystem.getDrawPileCount()).toBe(0); // Now draw pile is empty
      expect(deckSystem.getDiscardPileCount()).toBe(2);
      expect(deckSystem.getHand().length).toBe(6);

      // Try to draw more cards (should trigger reshuffle)
      const drawnCards = deckSystem.drawCards(2);

      // We can only draw 1 more card because max hand size is 7
      expect(drawnCards.length).toBe(1);
      expect(deckSystem.getHand().length).toBe(7); // At max hand size
      expect(deckSystem.getDrawPileCount()).toBe(1); // 1 card left from reshuffled pile
      expect(deckSystem.getDiscardPileCount()).toBe(0); // Discard pile was reshuffled
    });
  });

  describe('playCard', () => {
    it('should play a card from hand and move it to discard', () => {
      // Draw a card first
      deckSystem.drawCards(1);
      const hand = deckSystem.getHand();
      const cardId = hand[0].id;

      // Play the card
      const result = deckSystem.playCard(cardId, 3); // 3 energy available

      expect(result.success).toBe(true);
      expect(result.energySpent).toBe(hand[0].cost);
      expect(deckSystem.getHand().length).toBe(0);
      expect(deckSystem.getDiscardPileCount()).toBe(1);
    });

    it('should fail to play card not in hand', () => {
      const result = deckSystem.playCard('nonexistent-card', 3);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Card not found in hand');
    });

    it('should fail to play card without enough energy', () => {
      // Draw cards until we get one that costs energy
      let cardWithCost: { id: string; cost: number } | null = null;
      let attempts = 0;

      while (!cardWithCost && attempts < 10) {
        deckSystem.drawCards(1);
        const hand = deckSystem.getHand();
        const card = hand[hand.length - 1]; // Get the last drawn card

        if (card.cost > 0) {
          cardWithCost = card;
        } else {
          // Put it back and try again
          deckSystem.discardCard(card.id);
        }
        attempts++;
      }

      // If we couldn't find a card with cost, create a test card
      if (!cardWithCost) {
        // Reset and draw one card to test with
        deckSystem.resetDeck();
        deckSystem.drawCards(1);
        const hand = deckSystem.getHand();
        cardWithCost = hand[0];

        // Override the cost for this test
        (cardWithCost as { id: string; cost: number }).cost = 1;
      }

      // Try to play with 0 energy
      const result = deckSystem.playCard(cardWithCost.id, 0);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough energy');
    });
  });

  describe('discardCard', () => {
    it('should discard a card from hand', () => {
      deckSystem.drawCards(2);
      const hand = deckSystem.getHand();
      const cardId = hand[0].id;

      const success = deckSystem.discardCard(cardId);

      expect(success).toBe(true);
      expect(deckSystem.getHand().length).toBe(1);
      expect(deckSystem.getDiscardPileCount()).toBe(1);
    });

    it('should return false for card not in hand', () => {
      const success = deckSystem.discardCard('nonexistent-card');

      expect(success).toBe(false);
    });
  });

  describe('resetDeck', () => {
    it('should reset deck to initial state', () => {
      // Draw and discard some cards
      deckSystem.drawCards(3);
      const hand = deckSystem.getHand();
      deckSystem.discardCard(hand[0].id);

      // Reset
      deckSystem.resetDeck();

      expect(deckSystem.getDrawPileCount()).toBe(8);
      expect(deckSystem.getDiscardPileCount()).toBe(0);
      expect(deckSystem.getHand().length).toBe(0);
    });
  });
});
