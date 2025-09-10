import { DeckSystem } from './DeckSystem';
import { Player } from '../entities/Player';
import type { CardPlayResult } from '../types/CardTypes';

export interface PlayerData {
  health: number;
  maxHealth: number;
  timeEnergy: number;
  maxTimeEnergy: number;
  paradoxRisk: number;
  deckSize: number;
  currentLocation: string;
  day: number;
}

export interface GameProgress {
  currentScene: string;
  playerData: PlayerData;
  gameFlags: Record<string, boolean>;
  visitedLocations: string[];
  completedEvents: string[];
  deckSystem?: Record<string, unknown>; // Serialized deck state for save/load
}

export class GameState {
  private static instance: GameState;
  private gameProgress: GameProgress;
  private deckSystem: DeckSystem;
  private player!: Player;
  private saveKey = 'parallel-trail-save';
  private isPlayerInitialized: boolean = false;

  private constructor() {
    this.gameProgress = this.createDefaultGameState();
    this.deckSystem = DeckSystem.createStarterDeck();
  }

  public static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  private createDefaultGameState(): GameProgress {
    return {
      currentScene: 'TitleScene',
      playerData: {
        health: 100,
        maxHealth: 100,
        timeEnergy: 3,
        maxTimeEnergy: 3,
        paradoxRisk: 0,
        deckSize: 8,
        currentLocation: 'Hospital Hub',
        day: 1,
      },
      gameFlags: {},
      visitedLocations: [],
      completedEvents: [],
    };
  }

  public getPlayerData(): PlayerData {
    return { ...this.gameProgress.playerData };
  }

  public setPlayerData(data: Partial<PlayerData>): void {
    this.gameProgress.playerData = { ...this.gameProgress.playerData, ...data };
  }

  /**
   * Player entity methods for enhanced character system
   */
  public getPlayer(): Player {
    return this.player;
  }

  public isPlayerEntityReady(): boolean {
    return this.isPlayerInitialized;
  }

  /**
   * Sync game progress with player entity data
   */
  public syncWithPlayerEntity(): void {
    if (!this.isPlayerInitialized) {
      console.warn('Player entity not initialized, skipping sync');
      return;
    }

    // Only sync from player entity to game progress for backward compatibility
    const playerData = this.player.getData();
    this.gameProgress.playerData = {
      health: playerData.health,
      maxHealth: playerData.maxHealth,
      timeEnergy: playerData.timeEnergy,
      maxTimeEnergy: playerData.maxTimeEnergy,
      paradoxRisk: playerData.paradoxRisk,
      deckSize: playerData.deckSize,
      currentLocation: playerData.currentLocation,
      day: playerData.day,
    };
  }

  public getCurrentScene(): string {
    return this.gameProgress.currentScene;
  }

  public setCurrentScene(scene: string): void {
    this.gameProgress.currentScene = scene;
  }

  public getGameFlag(flag: string): boolean {
    return this.gameProgress.gameFlags[flag] || false;
  }

  public setGameFlag(flag: string, value: boolean): void {
    this.gameProgress.gameFlags[flag] = value;
  }

  public addVisitedLocation(location: string): void {
    if (!this.gameProgress.visitedLocations.includes(location)) {
      this.gameProgress.visitedLocations.push(location);
    }
  }

  public hasVisitedLocation(location: string): boolean {
    return this.gameProgress.visitedLocations.includes(location);
  }

  public addCompletedEvent(event: string): void {
    if (!this.gameProgress.completedEvents.includes(event)) {
      this.gameProgress.completedEvents.push(event);
    }
  }

  public hasCompletedEvent(event: string): boolean {
    return this.gameProgress.completedEvents.includes(event);
  }

  public saveGame(): boolean {
    try {
      localStorage.setItem(this.saveKey, JSON.stringify(this.gameProgress));
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  public loadGame(): boolean {
    try {
      const saveData = localStorage.getItem(this.saveKey);
      if (saveData) {
        const loadedProgress = JSON.parse(saveData) as GameProgress;
        this.gameProgress = loadedProgress;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  }

  public hasSaveGame(): boolean {
    return localStorage.getItem(this.saveKey) !== null;
  }

  public resetGame(): void {
    this.gameProgress = this.createDefaultGameState();
    localStorage.removeItem(this.saveKey);
  }

  public getGameProgress(): GameProgress {
    return { ...this.gameProgress };
  }

  public getDeckSystem(): DeckSystem {
    return this.deckSystem;
  }

  public drawCards(count: number = 1): void {
    this.deckSystem.drawCards(count);
  }

  public playCard(cardId: string): CardPlayResult {
    const playerData = this.getPlayerData();
    const result = this.deckSystem.playCard(cardId, playerData.timeEnergy);

    if (result.success) {
      // Deduct energy cost
      this.setPlayerData({
        timeEnergy: playerData.timeEnergy - result.energySpent,
      });
    }

    return result;
  }

  public resetDeck(): void {
    this.deckSystem.resetDeck();
  }
}
