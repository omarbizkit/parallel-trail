/**
 * Storage adapter for player data and global scores
 * Supports file, PostgreSQL, and Supabase backends
 */

export interface PlayerScore {
  playerId: string;
  playerName: string;
  score: number;
  category: string;
  date: string;
  gameData?: {
    dayReached?: number;
    cardsCollected?: number;
    damageTaken?: number;
    completionTime?: number;
  };
}

export interface PlayerMetaProgression {
  playerId: string;
  totalRuns: number;
  successfulRuns: number;
  highestDayReached: number;
  highestLevelReached: number;
  cardsUnlocked: string[];
  relicsUnlocked: string[];
  achievements: string[];
  totalScore: number;
  lastPlayed: string;
}

export interface PlayerData {
  playerId: string;
  playerName: string;
  health: number;
  maxHealth: number;
  timeEnergy: number;
  maxTimeEnergy: number;
  paradoxRisk: number;
  deckSize: number;
  currentLocation: string;
  day: number;
  experience: number;
  level: number;
  characterTraits: string[];
}

export interface StorageProvider {
  init(): Promise<void>;
  savePlayerData(playerId: string, data: PlayerData): Promise<void>;
  loadPlayerData(playerId: string): Promise<PlayerData | null>;
  saveGlobalScore(score: PlayerScore): Promise<void>;
  getGlobalScores(category: string, limit?: number): Promise<PlayerScore[]>;
  saveMetaProgression(playerId: string, progression: PlayerMetaProgression): Promise<void>;
  loadMetaProgression(playerId: string): Promise<PlayerMetaProgression | null>;
  getPlayerLeaderboard(): Promise<PlayerScore[]>;
  cleanup(): Promise<void>;
}

export abstract class BaseStorageAdapter implements StorageProvider {
  abstract init(): Promise<void>;
  abstract savePlayerData(playerId: string, data: PlayerData): Promise<void>;
  abstract loadPlayerData(playerId: string): Promise<PlayerData | null>;
  abstract saveGlobalScore(score: PlayerScore): Promise<void>;
  abstract getGlobalScores(category: string, limit?: number): Promise<PlayerScore[]>;
  abstract saveMetaProgression(playerId: string, progression: PlayerMetaProgression): Promise<void>;
  abstract loadMetaProgression(playerId: string): Promise<PlayerMetaProgression | null>;
  abstract getPlayerLeaderboard(): Promise<PlayerScore[]>;
  abstract cleanup(): Promise<void>;

  protected generateScoreId(): string {
    return `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
