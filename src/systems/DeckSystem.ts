import { Card } from '../entities/Card';
import type { Deck, CardPlayResult } from '../types/CardTypes';
import { STARTER_DECK } from '../data/StarterDeck';

export class DeckSystem {
  private deck: Deck;
  private listeners: Array<(deck: Deck) => void> = [];

  constructor(initialCards: Card[] = []) {
    this.deck = {
      cards: initialCards.map(card => card.clone()),
      drawPile: [],
      discardPile: [],
      hand: [],
      maxHandSize: 7,
    };
    this.initializeDeck();
  }

  /**
   * Creates a new deck system with the starter deck
   */
  public static createStarterDeck(): DeckSystem {
    const starterCards = STARTER_DECK.map(cardData => new Card(cardData));
    return new DeckSystem(starterCards);
  }

  /**
   * Initializes the deck by shuffling all cards into the draw pile
   */
  private initializeDeck(): void {
    this.deck.drawPile = [...this.deck.cards];
    this.shuffleDrawPile();
    this.deck.discardPile = [];
    this.deck.hand = [];
  }

  /**
   * Shuffles the draw pile using Fisher-Yates algorithm
   */
  private shuffleDrawPile(): void {
    const pile = this.deck.drawPile;
    for (let i = pile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pile[i], pile[j]] = [pile[j], pile[i]];
    }
  }

  /**
   * Draws cards from the draw pile into the hand
   */
  public drawCards(count: number = 1): Card[] {
    const drawnCards: Card[] = [];

    for (let i = 0; i < count; i++) {
      // If draw pile is empty, shuffle discard pile into draw pile
      if (this.deck.drawPile.length === 0) {
        this.reshuffleDiscardPile();
      }

      // If still no cards available, stop drawing
      if (this.deck.drawPile.length === 0) {
        break;
      }

      // Don't exceed max hand size
      if (this.deck.hand.length >= this.deck.maxHandSize) {
        break;
      }

      const card = this.deck.drawPile.pop();
      if (!card) break;
      this.deck.hand.push(card);
      drawnCards.push(card);
    }

    this.notifyListeners();
    return drawnCards;
  }

  /**
   * Shuffles the discard pile into the draw pile
   */
  private reshuffleDiscardPile(): void {
    if (this.deck.discardPile.length === 0) {
      return;
    }

    this.deck.drawPile = [...this.deck.discardPile];
    this.deck.discardPile = [];
    this.shuffleDrawPile();
  }

  /**
   * Plays a card from the hand
   */
  public playCard(cardId: string, currentEnergy: number): CardPlayResult {
    const cardIndex = this.deck.hand.findIndex(card => card.id === cardId);

    if (cardIndex === -1) {
      return {
        success: false,
        message: 'Card not found in hand',
        energySpent: 0,
        effectsApplied: [],
      };
    }

    const card = this.deck.hand[cardIndex];

    // Check if player has enough energy
    if (!card.canPlay(currentEnergy)) {
      return {
        success: false,
        message: `Not enough energy. Need ${card.cost}, have ${currentEnergy}`,
        energySpent: 0,
        effectsApplied: [],
      };
    }

    // Remove card from hand and add to discard pile
    this.deck.hand.splice(cardIndex, 1);
    this.deck.discardPile.push(card);

    this.notifyListeners();

    return {
      success: true,
      energySpent: card.cost,
      effectsApplied: [...card.effects],
    };
  }

  /**
   * Discards a card from the hand
   */
  public discardCard(cardId: string): boolean {
    const cardIndex = this.deck.hand.findIndex(card => card.id === cardId);

    if (cardIndex === -1) {
      return false;
    }

    const card = this.deck.hand.splice(cardIndex, 1)[0];
    this.deck.discardPile.push(card);
    this.notifyListeners();

    return true;
  }

  /**
   * Adds a card to the discard pile
   */
  public addCardToDiscard(card: Card): void {
    this.deck.discardPile.push(card.clone());
    this.notifyListeners();
  }

  /**
   * Gets the current hand
   */
  public getHand(): import('../entities/Card').Card[] {
    return [...this.deck.hand];
  }

  /**
   * Gets the draw pile count
   */
  public getDrawPileCount(): number {
    return this.deck.drawPile.length;
  }

  /**
   * Gets the discard pile count
   */
  public getDiscardPileCount(): number {
    return this.deck.discardPile.length;
  }

  /**
   * Gets the full deck state
   */
  public getDeckState(): Deck {
    return {
      cards: [...this.deck.cards],
      drawPile: [...this.deck.drawPile],
      discardPile: [...this.deck.discardPile],
      hand: [...this.deck.hand],
      maxHandSize: this.deck.maxHandSize,
    };
  }

  /**
   * Gets the total number of cards in the deck
   */
  public getTotalCardCount(): number {
    return this.deck.drawPile.length + this.deck.discardPile.length + this.deck.hand.length;
  }

  /**
   * Resets the deck to initial state
   */
  public resetDeck(): void {
    this.initializeDeck();
    this.notifyListeners();
  }

  /**
   * Adds a listener for deck state changes
   */
  public addListener(listener: (deck: Deck) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Removes a listener
   */
  public removeListener(listener: (deck: Deck) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notifies all listeners of deck state changes
   */
  private notifyListeners(): void {
    const deckState = this.getDeckState();
    this.listeners.forEach(listener => listener(deckState));
  }

  /**
   * Checks if the deck is empty (no cards in any pile)
   */
  public isEmpty(): boolean {
    return this.getTotalCardCount() === 0;
  }

  /**
   * Checks if the hand is full
   */
  public isHandFull(): boolean {
    return this.deck.hand.length >= this.deck.maxHandSize;
  }

  /**
   * Gets the number of cards that can still be drawn
   */
  public getDrawableCardsCount(): number {
    return Math.min(
      this.deck.drawPile.length + this.deck.discardPile.length,
      this.deck.maxHandSize - this.deck.hand.length
    );
  }
}
