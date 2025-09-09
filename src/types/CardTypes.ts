export const CardCategoryConst = {
  TIMECRAFT: 'timecraft',
  MIND: 'mind',
  SOCIAL: 'social',
  PHYSICAL: 'physical',
} as const;

export type CardCategory = (typeof CardCategoryConst)[keyof typeof CardCategoryConst];

export const CardTypeConst = {
  ATTACK: 'attack',
  DEFENSE: 'defense',
  UTILITY: 'utility',
  SPECIAL: 'special',
} as const;

export type CardType = (typeof CardTypeConst)[keyof typeof CardTypeConst];

export const CardRarityConst = {
  BASIC: 'basic',
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
} as const;

export type CardRarity = (typeof CardRarityConst)[keyof typeof CardRarityConst];

export interface CardEffect {
  type: string;
  value: number;
  target?: 'self' | 'enemy' | 'both';
  duration?: number;
}

export interface Card {
  id: string;
  name: string;
  description: string;
  category: CardCategory;
  type: CardType;
  rarity: CardRarity;
  cost: number;
  effects: CardEffect[];
  flavorText?: string;
  imageKey?: string;
}

export interface Deck {
  cards: import('../entities/Card').Card[];
  drawPile: import('../entities/Card').Card[];
  discardPile: import('../entities/Card').Card[];
  hand: import('../entities/Card').Card[];
  maxHandSize: number;
}

export interface CardPlayResult {
  success: boolean;
  message?: string;
  energySpent: number;
  effectsApplied: CardEffect[];
}
