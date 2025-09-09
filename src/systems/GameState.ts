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
}

export class GameState {
  private static instance: GameState;
  private gameProgress: GameProgress;
  private saveKey = 'parallel-trail-save';

  private constructor() {
    this.gameProgress = this.createDefaultGameState();
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
}