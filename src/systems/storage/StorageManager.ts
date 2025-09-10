import type { StorageProvider } from './StorageAdapter.js';
import type { PlayerData, PlayerScore, PlayerMetaProgression } from './StorageAdapter.js';
import { FileStorageAdapter } from './FileStorageAdapter.js';
import { STORAGE_CONFIG } from '../../config/GameConfig.js';

/**
 * Storage manager that provides a unified interface for different storage backends
 * Automatically initializes the configured storage provider
 */
export class StorageManager implements StorageProvider {
  private static instance: StorageManager | null = null;
  private provider: StorageProvider;
  private initialized: boolean = false;

  constructor() {
    // Initialize with the configured provider
    switch (STORAGE_CONFIG.provider) {
      case 'file':
      default:
        this.provider = new FileStorageAdapter();
        break;

      case 'postgresql':
        // Will be implemented when PostgreSQL adapter is added
        throw new Error('PostgreSQL storage adapter not yet implemented');

      case 'supabase':
        // Will be implemented when Supabase adapter is added
        throw new Error('Supabase storage adapter not yet implemented');
    }
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    try {
      await this.provider.init();
      this.initialized = true;
      console.log(`Storage ${STORAGE_CONFIG.provider} initialized successfully`);
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw error;
    }
  }

  async savePlayerData(playerId: string, data: PlayerData): Promise<void> {
    await this.ensureInitialized();
    return this.provider.savePlayerData(playerId, data);
  }

  async loadPlayerData(playerId: string): Promise<PlayerData | null> {
    await this.ensureInitialized();
    return this.provider.loadPlayerData(playerId);
  }

  async saveGlobalScore(score: PlayerScore): Promise<void> {
    await this.ensureInitialized();
    return this.provider.saveGlobalScore(score);
  }

  async getGlobalScores(category: string, limit?: number): Promise<PlayerScore[]> {
    await this.ensureInitialized();
    return this.provider.getGlobalScores(category, limit);
  }

  async saveMetaProgression(playerId: string, progression: PlayerMetaProgression): Promise<void> {
    await this.ensureInitialized();
    return this.provider.saveMetaProgression(playerId, progression);
  }

  async loadMetaProgression(playerId: string): Promise<PlayerMetaProgression | null> {
    await this.ensureInitialized();
    return this.provider.loadMetaProgression(playerId);
  }

  async getPlayerLeaderboard(): Promise<PlayerScore[]> {
    await this.ensureInitialized();
    return this.provider.getPlayerLeaderboard();
  }

  async cleanup(): Promise<void> {
    await this.ensureInitialized();
    return this.provider.cleanup();
  }

  async getStorageStatus(): Promise<{ initialized: boolean; provider: string; health: string }> {
    try {
      if (!this.initialized) {
        return { initialized: false, provider: STORAGE_CONFIG.provider, health: 'not_initialized' };
      }

      // Simple health check - try to get global scores
      await this.provider.getGlobalScores('test', 1);
      return { initialized: true, provider: STORAGE_CONFIG.provider, health: 'healthy' };
    } catch {
      return { initialized: true, provider: STORAGE_CONFIG.provider, health: 'error' };
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  // Switch provider method for future runtime changes
  async switchProvider(provider: 'file' | 'postgresql' | 'supabase'): Promise<void> {
    if (provider === STORAGE_CONFIG.provider) {
      return; // Already using this provider
    }

    try {
      // Cleanup current provider
      if (this.initialized) {
        await this.provider.cleanup();
      }

      // Switch to new provider
      // This would require implementing other adapters
      throw new Error(`Provider switching not yet implemented for: ${provider}`);
    } catch (error) {
      console.error('Failed to switch storage provider:', error);
      throw error;
    }
  }
}
