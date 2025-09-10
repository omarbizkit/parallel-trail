import { BaseStorageAdapter } from './StorageAdapter.js';
import type { PlayerData, PlayerScore, PlayerMetaProgression } from './StorageAdapter.js';
import { STORAGE_CONFIG } from '../../config/GameConfig.js';

/**
 * Browser-compatible storage adapter using localStorage
 * Suitable for development and client-side persistence
 * Uses localStorage instead of file system for browser compatibility
 */
export class FileStorageAdapter extends BaseStorageAdapter {
  private playerDataKey: string;
  private globalScoresKey: string;
  private metaProgressionKey: string;

  constructor() {
    super();
    // Convert file paths to localStorage keys
    this.playerDataKey = STORAGE_CONFIG.file.playerDataPath.replace(/[^a-zA-Z0-9]/g, '_');
    this.globalScoresKey = STORAGE_CONFIG.file.globalScoresPath.replace(/[^a-zA-Z0-9]/g, '_');
    this.metaProgressionKey = STORAGE_CONFIG.file.metaProgressionPath.replace(/[^a-zA-Z0-9]/g, '_');
  }

  async init(): Promise<void> {
    // Initialize localStorage with default data if not exists
    const keys = [
      { key: this.playerDataKey, defaultValue: {} },
      { key: this.globalScoresKey, defaultValue: { scores: [] } },
      { key: this.metaProgressionKey, defaultValue: {} },
    ];

    keys.forEach(({ key, defaultValue }) => {
      try {
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify(defaultValue));
        }
      } catch (error) {
        console.warn(`Failed to initialize localStorage key ${key}:`, error);
      }
    });
  }

  async savePlayerData(playerId: string, data: PlayerData): Promise<void> {
    try {
      const existingData = this.loadJSON(this.playerDataKey) as Record<string, PlayerData>;
      existingData[playerId] = data;
      this.saveJSON(this.playerDataKey, existingData);
    } catch (error) {
      throw new Error(`Failed to save player data: ${error}`);
    }
  }

  async loadPlayerData(playerId: string): Promise<PlayerData | null> {
    try {
      const existingData = this.loadJSON(this.playerDataKey) as Record<string, PlayerData>;
      return existingData[playerId] || null;
    } catch (error) {
      console.warn('Failed to load player data, returning null:', error);
      return null;
    }
  }

  async saveGlobalScore(score: PlayerScore): Promise<void> {
    try {
      const data = this.loadJSON(this.globalScoresKey) as { scores: PlayerScore[] };
      data.scores = data.scores || [];
      data.scores.push(score);

      // Sort by score descending
      data.scores.sort((a, b) => b.score - a.score);

      // Keep only top scores
      const maxScores = STORAGE_CONFIG.file.globalScoresPath.includes('dev') ? 50 : 100;
      data.scores = data.scores.slice(0, maxScores);

      this.saveJSON(this.globalScoresKey, data);
    } catch (error) {
      throw new Error(`Failed to save global score: ${error}`);
    }
  }

  async getGlobalScores(category: string, limit: number = 10): Promise<PlayerScore[]> {
    try {
      const data = this.loadJSON(this.globalScoresKey) as { scores: PlayerScore[] };
      const filtered = data.scores ? data.scores.filter(score => score.category === category) : [];
      return filtered.slice(0, limit);
    } catch (error) {
      console.warn('Failed to load global scores, returning empty array:', error);
      return [];
    }
  }

  async saveMetaProgression(playerId: string, progression: PlayerMetaProgression): Promise<void> {
    try {
      const existingData = this.loadJSON(this.metaProgressionKey) as Record<
        string,
        PlayerMetaProgression
      >;

      if (existingData[playerId]) {
        // Merge with existing progression
        const existing = existingData[playerId];
        progression.totalRuns = existing.totalRuns + 1;
        progression.successfulRuns += existing.successfulRuns;
        progression.highestDayReached = Math.max(
          existing.highestDayReached,
          progression.highestDayReached
        );
        progression.highestLevelReached = Math.max(
          existing.highestLevelReached || 1,
          progression.highestLevelReached || 1
        );
        progression.cardsUnlocked = Array.from(
          new Set([...existing.cardsUnlocked, ...progression.cardsUnlocked])
        );
        progression.relicsUnlocked = Array.from(
          new Set([...existing.relicsUnlocked, ...progression.relicsUnlocked])
        );
        progression.achievements = Array.from(
          new Set([...existing.achievements, ...progression.achievements])
        );
        progression.totalScore += existing.totalScore;
      }

      existingData[playerId] = progression;
      this.saveJSON(this.metaProgressionKey, existingData);
    } catch (error) {
      throw new Error(`Failed to save meta progression: ${error}`);
    }
  }

  async loadMetaProgression(playerId: string): Promise<PlayerMetaProgression | null> {
    try {
      const existingData = this.loadJSON(this.metaProgressionKey) as Record<
        string,
        PlayerMetaProgression
      >;
      return existingData[playerId] || null;
    } catch (error) {
      console.warn('Failed to load meta progression, returning null:', error);
      return null;
    }
  }

  async getPlayerLeaderboard(): Promise<PlayerScore[]> {
    try {
      const data = this.loadJSON(this.metaProgressionKey) as Record<string, PlayerMetaProgression>;
      const scores: PlayerScore[] = [];

      Object.entries(data).forEach(([playerId, progression]) => {
        scores.push({
          playerId,
          playerName: progression.playerId, // Would need to track names separately
          score: progression.totalScore,
          category: 'overall_total',
          date: progression.lastPlayed,
        });
      });

      return scores.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.warn('Failed to load player leaderboard, returning empty array:', error);
      return [];
    }
  }

  async cleanup(): Promise<void> {
    // No cleanup needed for localStorage
    return Promise.resolve();
  }

  private loadJSON(key: string): Record<string, unknown> {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        return {};
      }
      return JSON.parse(data);
    } catch (error) {
      console.warn(
        `Failed to load JSON from localStorage key ${key}, returning empty object:`,
        error
      );
      return {};
    }
  }

  private saveJSON(key: string, data: Record<string, unknown>): void {
    try {
      localStorage.setItem(key, JSON.stringify(data, null, 2));
    } catch (error) {
      throw new Error(`Failed to save JSON to localStorage key ${key}: ${error}`);
    }
  }
}
