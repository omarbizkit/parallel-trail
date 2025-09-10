import type {
  PlayerData,
  PlayerMetaProgression,
  PlayerScore,
} from '../systems/storage/StorageAdapter.js';
import { StorageManager } from '../systems/storage/StorageManager.js';
import { CHARACTER_CONFIG, GLOBAL_SCORES_CONFIG } from '../config/GameConfig.js';
import { generateGUID } from '../utils/GUID.js';

/**
 * Represents the player character - Penelope "Penny" Torres
 * Manages character progression, meta-progression, and stat tracking
 */
export class Player {
  private data: PlayerData;
  private metaProgression: PlayerMetaProgression;
  private storageManager: StorageManager;

  constructor() {
    this.storageManager = StorageManager.getInstance();

    // Initialize with default character name or allow customization
    const playerName = CHARACTER_CONFIG.allowCustomNames
      ? CHARACTER_CONFIG.defaultName
      : CHARACTER_CONFIG.defaultName;

    // Generate or load player ID
    const playerId = generateGUID();

    // Initialize core player data
    this.data = {
      playerId,
      playerName,
      health: 100,
      maxHealth: 100,
      timeEnergy: 3,
      maxTimeEnergy: 3,
      paradoxRisk: 0,
      deckSize: 8,
      currentLocation: 'phoenix_center',
      day: 1,
      experience: 0,
      level: 1,
      characterTraits: ['timeline_aware', 'bilingual'] as string[],
    };

    // Initialize meta progression
    this.metaProgression = {
      playerId,
      totalRuns: 0,
      successfulRuns: 0,
      highestDayReached: 1,
      highestLevelReached: 1,
      cardsUnlocked: ['block', 'dodge', 'strike', 'heal', 'insight', 'rewind'],
      relicsUnlocked: [],
      achievements: ['firstSteps'],
      totalScore: 0,
      lastPlayed: new Date().toISOString(),
    };
  }

  /**
   * Initialize player character - load existing data or create new
   */
  async initialize(): Promise<void> {
    try {
      // Initialize storage
      await this.storageManager.init();

      // Try to load existing meta progression
      const existingMeta = await this.storageManager.loadMetaProgression(this.data.playerId);
      if (existingMeta) {
        this.metaProgression = existingMeta;
        console.log(`Loaded existing meta progression for player ${this.data.playerName}`);
      } else {
        // Save initial meta progression
        await this.saveMetaProgression();
        console.log(`Created new meta progression for player ${this.data.playerName}`);
      }
    } catch (error) {
      console.warn('Failed to initialize player storage, continuing in offline mode:', error);
    }
  }

  /**
   * Change character name with validation
   */
  setCharacterName(name: string): boolean {
    if (name.length > CHARACTER_CONFIG.maxNameLength) {
      return false;
    }

    if (!CHARACTER_CONFIG.allowCustomNames && !CHARACTER_CONFIG.alternateNames.includes(name)) {
      return false;
    }

    this.data.playerName = name;
    return true;
  }

  /**
   * Get available character names for selection
   */
  getAvailableCharacterNames(): string[] {
    return [CHARACTER_CONFIG.defaultName, ...CHARACTER_CONFIG.alternateNames];
  }

  /**
   * Core player stat management methods
   */
  modifyHealth(amount: number): number {
    this.data.health = Math.max(0, Math.min(this.data.maxHealth, this.data.health + amount));
    this.savePlayerData().catch(error => console.warn('Failed to save health change:', error));
    return this.data.health;
  }

  modifyTimeEnergy(amount: number): number {
    this.data.timeEnergy = Math.max(
      0,
      Math.min(this.data.maxTimeEnergy, this.data.timeEnergy + amount)
    );
    // Don't save for minor changes to avoid excessive writes
    return this.data.timeEnergy;
  }

  modifyParadoxRisk(amount: number): number {
    this.data.paradoxRisk = Math.max(0, Math.min(100, this.data.paradoxRisk + amount));
    // Don't save for minor changes
    return this.data.paradoxRisk;
  }

  /**
   * Experience and leveling system
   */
  gainExperience(amount: number): void {
    this.data.experience += amount;

    // Check for level up
    const requiredXP = this.getExperienceForLevel(this.data.level + 1);
    if (this.data.experience >= requiredXP) {
      this.levelUp();
    }

    this.savePlayerData().catch(error => console.warn('Failed to save XP gain:', error));
  }

  levelUp(): void {
    this.data.level++;
    this.data.maxHealth += 10;
    this.data.health = this.data.maxHealth; // Full heal on level up
    this.data.maxTimeEnergy += 1;
    this.data.timeEnergy = this.data.maxTimeEnergy; // Full energy restore

    // Unlock a random card or relic for this run
    this.unlockRandomReward();

    // Check meta-progression achievement
    if (this.data.level > this.metaProgression.highestLevelReached) {
      this.metaProgression.highestLevelReached = this.data.level;
      this.addAchievement('levelMaster');
    }

    console.log(`Player ${this.data.playerName} reached level ${this.data.level}!`);
  }

  private getExperienceForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  /**
   * Meta-progression and unlocks
   */
  unlockCard(cardId: string): void {
    if (!this.metaProgression.cardsUnlocked.includes(cardId)) {
      this.metaProgression.cardsUnlocked.push(cardId);
      this.addAchievement('collector');
    }
  }

  unlockRelic(relicId: string): void {
    if (!this.metaProgression.relicsUnlocked.includes(relicId)) {
      this.metaProgression.relicsUnlocked.push(relicId);
      this.addAchievement('relicHunter');
    }
  }

  private unlockRandomReward(): void {
    // TODO: Implement random unlock logic based on meta-progression
    // For now, add a small score bonus
    this.metaProgression.totalScore += 50;
  }

  /**
   * Achievement system
   */
  addAchievement(achievementId: string): void {
    if (!this.metaProgression.achievements.includes(achievementId)) {
      this.metaProgression.achievements.push(achievementId);
      console.log(`Achievement unlocked: ${achievementId}`);
    }
  }

  /**
   * Global score tracking
   */
  async saveGameScore(
    category: string,
    score: number,
    gameData?: Record<string, unknown>
  ): Promise<void> {
    if (!GLOBAL_SCORES_CONFIG.enabled) {
      return;
    }

    const playerScore: PlayerScore = {
      playerId: this.data.playerId,
      playerName: this.data.playerName,
      score,
      category,
      date: new Date().toISOString(),
      gameData: {
        dayReached: this.data.day,
        cardsCollected: this.data.deckSize,
        ...gameData,
      },
    };

    try {
      await this.storageManager.saveGlobalScore(playerScore);
      console.log(`Global score saved for ${this.data.playerName}: ${score} in ${category}`);
    } catch (error) {
      console.warn('Failed to save global score:', error);
    }
  }

  /**
   * Game session tracking
   */
  startNewGame(): void {
    this.metaProgression.totalRuns++;
    this.data.day = 1;
    this.saveMetaProgression().catch(error =>
      console.warn('Failed to save new game start:', error)
    );
  }

  endGame(successful: boolean, finalScore?: number): void {
    if (successful) {
      this.metaProgression.successfulRuns++;
      this.addAchievement('survivor');
    }

    // Update highest day reached
    if (this.data.day > this.metaProgression.highestDayReached) {
      this.metaProgression.highestDayReached = this.data.day;
      this.addAchievement('explorer');
    }

    // Save final score if provided
    if (finalScore) {
      this.saveGameScore('game_completion', finalScore);
    }

    this.metaProgression.lastPlayed = new Date().toISOString();
    this.saveMetaProgression().catch(error => console.warn('Failed to save game end:', error));
  }

  /**
   * Data persistence methods
   */
  private async savePlayerData(): Promise<void> {
    try {
      await this.storageManager.savePlayerData(this.data.playerId, this.data);
    } catch (error) {
      console.warn('Failed to save player data:', error);
    }
  }

  private async saveMetaProgression(): Promise<void> {
    try {
      await this.storageManager.saveMetaProgression(this.data.playerId, this.metaProgression);
    } catch (error) {
      console.warn('Failed to save meta progression:', error);
    }
  }

  /**
   * Getter methods for player data
   */
  getData(): PlayerData {
    return { ...this.data };
  }

  getMetaProgression(): PlayerMetaProgression {
    return { ...this.metaProgression };
  }

  getPlayerId(): string {
    return this.data.playerId;
  }

  getPlayerName(): string {
    return this.data.playerName;
  }

  getHealth(): number {
    return this.data.health;
  }

  getMaxHealth(): number {
    return this.data.maxHealth;
  }

  getTimeEnergy(): number {
    return this.data.timeEnergy;
  }

  getMaxTimeEnergy(): number {
    return this.data.maxTimeEnergy;
  }

  getParadoxRisk(): number {
    return this.data.paradoxRisk;
  }

  getExperience(): number {
    return this.data.experience;
  }

  getLevel(): number {
    return this.data.level;
  }

  getDay(): number {
    return this.data.day;
  }

  getCurrentLocation(): string {
    return this.data.currentLocation;
  }

  getCharacterTraits(): string[] {
    return [...this.data.characterTraits];
  }

  /**
   * Update location and track progression
   */
  setCurrentLocation(location: string): void {
    this.data.currentLocation = location;
    this.savePlayerData().catch(error => console.warn('Failed to save location change:', error));
  }

  incrementDay(): void {
    this.data.day++;
    if (this.data.day > this.metaProgression.highestDayReached) {
      this.metaProgression.highestDayReached = this.data.day;
    }
    this.savePlayerData().catch(error => console.warn('Failed to save day increment:', error));
  }
}
