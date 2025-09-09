import { Scene } from 'phaser';
import { GameState } from '../systems/GameState';
import { UISystem, RetroMenu, TypewriterText } from '../systems/UISystem';
import { HUDSystem } from '../systems/HUDSystem';
import { DeckSystem } from '../systems/DeckSystem';
import { Card } from '../entities/Card';
import { ENEMY_DATA, type EnemyData, getEnemyIntent } from '../data/EnemyData';

export interface CombatState {
  isPlayerTurn: boolean;
  enemyHealth: number;
  enemyMaxHealth: number;
  enemyIntent: EnemyIntent;
  playerDefense: number;
  turnCount: number;
  combatLog: string[];
}

export interface EnemyIntent {
  type: 'attack' | 'defend' | 'special';
  value: number;
  description: string;
}

export interface CombatReward {
  cards?: Card[];
  relics?: string[];
  storyClues?: string[];
  experience?: number;
}

export class CombatScene extends Scene {
  private gameState: GameState;
  private uiSystem: UISystem;
  private hudSystem: HUDSystem;
  private deckSystem: DeckSystem;

  private combatState: CombatState;
  private currentEnemy?: EnemyData;
  private enemyIntentDisplay?: TypewriterText;
  private combatLogDisplay?: TypewriterText;
  private playerHandDisplay?: Phaser.GameObjects.Container;
  private cardButtons: Phaser.GameObjects.Text[] = [];
  // private endTurnButton?: RetroMenu; // TODO: Implement end turn button functionality

  constructor() {
    super({ key: 'CombatScene' });
    this.gameState = GameState.getInstance();
    this.uiSystem = UISystem.getInstance();
    this.hudSystem = HUDSystem.getInstance();
    this.deckSystem = this.gameState.getDeckSystem();

    this.combatState = this.createInitialCombatState();
  }

  init(data?: { enemyType?: string; location?: string }): void {
    this.gameState.setCurrentScene('CombatScene');
    this.gameState.saveGame();

    // Initialize combat with enemy data if provided
    if (data?.enemyType) {
      this.initializeEnemy(data.enemyType);
    } else {
      // Default test enemy for development
      this.initializeEnemy('test_enemy');
    }
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Initialize UI systems
    this.uiSystem.initialize(this);
    this.hudSystem.initialize(this);

    // Create combat UI layout
    this.createCombatLayout(width, height);

    // Initialize combat state
    this.setupCombat();

    // Start the combat loop
    this.startCombat();
  }

  private createInitialCombatState(): CombatState {
    return {
      isPlayerTurn: true,
      enemyHealth: 50,
      enemyMaxHealth: 50,
      enemyIntent: {
        type: 'attack',
        value: 8,
        description: 'The enemy prepares to attack',
      },
      playerDefense: 0,
      turnCount: 1,
      combatLog: ['Combat begins!'],
    };
  }

  private initializeEnemy(enemyType: string): void {
    // Load enemy data from configuration
    this.currentEnemy = ENEMY_DATA[enemyType] || ENEMY_DATA['test_enemy'];

    if (this.currentEnemy) {
      this.combatState.enemyHealth = this.currentEnemy.health;
      this.combatState.enemyMaxHealth = this.currentEnemy.maxHealth;

      // Add some flavor text to combat log
      if (this.currentEnemy.flavorText && this.currentEnemy.flavorText.length > 0) {
        const randomFlavor =
          this.currentEnemy.flavorText[
            Math.floor(Math.random() * this.currentEnemy.flavorText.length)
          ];
        this.addCombatLog(randomFlavor);
      }
    }
  }

  private createCombatLayout(width: number, _height: number): void {
    // Combat title
    new TypewriterText(this, width / 2, 40, '=== COMBAT ===', {
      fontFamily: this.uiSystem.getConfig().fontFamily,
      fontSize: `${this.uiSystem.getConfig().fontSize.large}px`,
      color: this.uiSystem.getColorPalette().primary,
      align: 'center',
    }).setOrigin(0.5, 0.5);

    // Enemy area (top)
    this.createEnemyArea();

    // Player area (bottom)
    this.createPlayerArea();

    // Combat log area (side)
    this.createCombatLogArea();

    // Control buttons
    this.createControlButtons();
  }

  private createEnemyArea(): void {
    const { width, height } = this.cameras.main;
    const enemyY = height * 0.25;

    // Enemy name/health display
    const enemyName = this.currentEnemy?.name || 'Unknown Enemy';
    new TypewriterText(this, width / 2, enemyY - 40, enemyName.toUpperCase(), {
      fontFamily: this.uiSystem.getConfig().fontFamily,
      fontSize: `${this.uiSystem.getConfig().fontSize.large}px`,
      color: this.uiSystem.getColorPalette().text,
      align: 'center',
    }).setOrigin(0.5, 0.5);
    this.updateEnemyHealthDisplay();

    // Enemy intent display
    this.enemyIntentDisplay = this.uiSystem.createTypewriterText(
      this,
      width / 2,
      enemyY + 20,
      this.getEnemyIntentText(),
      { align: 'center', fontSize: 14 }
    );
  }

  private createPlayerArea(): void {
    const { width } = this.cameras.main;
    const playerY = this.cameras.main.height * 0.75;

    // Player status
    this.updatePlayerStatusDisplay();

    // Hand area
    this.playerHandDisplay = this.add.container(width / 2, playerY);
    this.updateHandDisplay();
  }

  private createCombatLogArea(): void {
    const { width } = this.cameras.main;

    // Combat log title
    new TypewriterText(this, width - 150, 100, 'COMBAT LOG', {
      fontFamily: this.uiSystem.getConfig().fontFamily,
      fontSize: `${this.uiSystem.getConfig().fontSize.medium}px`,
      color: this.uiSystem.getColorPalette().secondary,
      align: 'right',
    }).setOrigin(1, 0.5);

    // Combat log display
    this.combatLogDisplay = this.uiSystem.createTypewriterText(
      this,
      width - 150,
      130,
      this.getCombatLogText(),
      { align: 'right', fontSize: 12, wordWrap: { width: 280 } }
    );
  }

  private createControlButtons(): void {
    const { width } = this.cameras.main;

    // End Turn button
    new RetroMenu(
      this,
      width - 120,
      this.cameras.main.height - 60,
      ['END TURN'],
      this.uiSystem.getConfig(),
      (index, _item) => {
        if (index === 0) this.endPlayerTurn();
      }
    );
  }

  private setupCombat(): void {
    // Draw initial hand
    this.deckSystem.drawCards(5);
    this.updateHandDisplay();
    this.updatePlayerStatusDisplay();

    // Add combat start message
    this.addCombatLog('You draw your initial hand.');
  }

  private startCombat(): void {
    if (this.combatState.isPlayerTurn) {
      this.startPlayerTurn();
    }
  }

  private startPlayerTurn(): void {
    this.combatState.isPlayerTurn = true;
    this.updateEnemyIntent();
    this.addCombatLog(`Turn ${this.combatState.turnCount}: Your turn`);

    // Draw a card at start of turn (standard card game mechanic)
    const drawnCards = this.deckSystem.drawCards(1);
    if (drawnCards.length > 0) {
      this.addCombatLog('You draw a card.');
    }

    this.updateHandDisplay();
    this.updatePlayerStatusDisplay();
  }

  private endPlayerTurn(): void {
    if (!this.combatState.isPlayerTurn) return;

    this.combatState.isPlayerTurn = false;
    this.addCombatLog('You end your turn.');

    // Execute enemy turn
    this.time.delayedCall(500, () => {
      this.executeEnemyTurn();
    });
  }

  private executeEnemyTurn(): void {
    this.addCombatLog('Enemy takes their turn...');

    // Execute the telegraphed intent
    this.executeEnemyIntent();

    // Reset defense at end of enemy turn
    if (this.combatState.playerDefense > 0) {
      this.combatState.playerDefense = 0;
      this.addCombatLog('Your defense fades.');
    }

    // Prepare for next turn
    this.time.delayedCall(1000, () => {
      this.combatState.turnCount++;
      this.startPlayerTurn();
    });
  }

  private executeEnemyIntent(): void {
    const intent = this.combatState.enemyIntent;

    switch (intent.type) {
      case 'attack':
        this.executeEnemyAttack(intent.value);
        break;
      case 'defend':
        // Enemy defense mechanics (for future expansion)
        this.addCombatLog(`Enemy prepares defenses.`);
        break;
      case 'special':
        // Enemy special abilities (for future expansion)
        this.addCombatLog(`Enemy uses a special ability.`);
        break;
    }
  }

  private executeEnemyAttack(damage: number): void {
    if (!this.currentEnemy) return;
    // Apply damage to player (accounting for defense)
    const actualDamage = Math.max(0, damage - this.combatState.playerDefense);
    const playerData = this.gameState.getPlayerData();
    const newHealth = Math.max(0, playerData.health - actualDamage);

    this.gameState.setPlayerData({ health: newHealth });

    if (actualDamage > 0) {
      this.addCombatLog(`Enemy attacks for ${actualDamage} damage!`);
      if (this.combatState.playerDefense > 0) {
        this.addCombatLog(
          `Your defense blocks ${Math.min(damage, this.combatState.playerDefense)} damage.`
        );
      }
    } else {
      this.addCombatLog(`Enemy attack blocked by your defense!`);
    }

    this.updatePlayerStatusDisplay();

    // Check for defeat
    if (newHealth <= 0) {
      this.handleDefeat();
    }
  }

  private updateEnemyIntent(): void {
    if (!this.currentEnemy) return;

    // Use the enemy AI system to determine intent
    this.combatState.enemyIntent = getEnemyIntent(this.currentEnemy, this.combatState.turnCount);
    this.updateEnemyIntentDisplay();
  }

  private updateEnemyHealthDisplay(): void {
    const { width } = this.cameras.main;
    const enemyY = this.cameras.main.height * 0.25;

    const healthText = `HP: ${this.combatState.enemyHealth}/${this.combatState.enemyMaxHealth}`;
    new TypewriterText(this, width / 2, enemyY - 20, healthText, {
      fontFamily: this.uiSystem.getConfig().fontFamily,
      fontSize: `${this.uiSystem.getConfig().fontSize.medium}px`,
      color: this.uiSystem.getColorPalette().text,
      align: 'center',
    }).setOrigin(0.5, 0.5);
  }

  private updatePlayerStatusDisplay(): void {
    const { width } = this.cameras.main;
    const playerY = this.cameras.main.height * 0.75;
    const playerData = this.gameState.getPlayerData();

    let statusText = `HP: ${playerData.health}/${playerData.maxHealth} | Energy: ${playerData.timeEnergy}/${playerData.maxTimeEnergy}`;
    if (this.combatState.playerDefense > 0) {
      statusText += ` | Defense: ${this.combatState.playerDefense}`;
    }

    new TypewriterText(this, width / 2, playerY - 40, statusText, {
      fontFamily: this.uiSystem.getConfig().fontFamily,
      fontSize: `${this.uiSystem.getConfig().fontSize.medium}px`,
      color: this.uiSystem.getColorPalette().text,
      align: 'center',
    }).setOrigin(0.5, 0.5);
  }

  private updateHandDisplay(): void {
    if (!this.playerHandDisplay) return;

    // Clear existing hand display
    this.playerHandDisplay.removeAll(true);
    this.cardButtons.forEach(button => button.destroy());
    this.cardButtons = [];

    const hand = this.deckSystem.getHand();
    const cardWidth = 120;
    const cardSpacing = 10;
    const totalWidth = hand.length * cardWidth + (hand.length - 1) * cardSpacing;
    const startX = -totalWidth / 2 + cardWidth / 2;

    hand.forEach((card, index) => {
      const x = startX + index * (cardWidth + cardSpacing);
      const cardButton = this.createCardButton(x, 0, card);
      this.playerHandDisplay?.add(cardButton);
      this.cardButtons.push(cardButton);
    });
  }

  private createCardButton(x: number, y: number, card: Card): Phaser.GameObjects.Text {
    const cardText = this.formatCardDisplay(card);
    const playerData = this.gameState.getPlayerData();
    const canPlay = card.canPlay(playerData.timeEnergy);

    const cardDisplay = this.add.text(x, y, cardText, {
      fontFamily: this.uiSystem.getConfig().fontFamily,
      fontSize: `${this.uiSystem.getConfig().fontSize.small}px`,
      color: canPlay
        ? this.uiSystem.getColorPalette().text
        : this.uiSystem.getColorPalette().disabled,
      backgroundColor: card.getCategoryColor(),
      padding: { x: 8, y: 4 },
      align: 'center',
      wordWrap: { width: 110 },
    });

    cardDisplay.setOrigin(0.5, 0.5);
    cardDisplay.setInteractive({ useHandCursor: true });

    if (canPlay) {
      cardDisplay.on('pointerdown', () => this.playCard(card.id));
      cardDisplay.on('pointerover', () => {
        cardDisplay.setColor(this.uiSystem.getColorPalette().highlight);
      });
      cardDisplay.on('pointerout', () => {
        cardDisplay.setColor(this.uiSystem.getColorPalette().text);
      });
    }

    return cardDisplay;
  }

  private formatCardDisplay(card: Card): string {
    return `${card.name}\nCost: ${card.cost}\n${card.getEffectDescription()}`;
  }

  private playCard(cardId: string): void {
    if (!this.combatState.isPlayerTurn) return;

    const result = this.gameState.playCard(cardId);

    if (result.success) {
      this.addCombatLog(`You play ${this.deckSystem.getHand().find(c => c.id === cardId)?.name}`);

      // Apply card effects to enemy
      this.applyCardEffectsToEnemy(result.effectsApplied);

      this.updateHandDisplay();
      this.updatePlayerStatusDisplay();

      // Check for victory after card effects
      if (this.combatState.enemyHealth <= 0) {
        this.handleVictory();
      }
    } else {
      this.addCombatLog(`Cannot play card: ${result.message}`);
    }
  }

  private applyCardEffectsToEnemy(effects: Array<{ type: string; value: number }>): void {
    effects.forEach(effect => {
      switch (effect.type) {
        case 'damage': {
          const damage = effect.value;
          this.combatState.enemyHealth = Math.max(0, this.combatState.enemyHealth - damage);
          this.addCombatLog(`You deal ${damage} damage!`);
          this.updateEnemyHealthDisplay();
          break;
        }
        case 'defense': {
          this.combatState.playerDefense += effect.value;
          this.addCombatLog(`You gain ${effect.value} defense.`);
          break;
        }
        case 'heal':
          // Healing handled by GameState
          break;
        case 'dodge':
          this.addCombatLog(`You prepare to dodge the next attack.`);
          break;
      }
    });
  }

  private getEnemyIntentText(): string {
    const intent = this.combatState.enemyIntent;
    return intent ? `Intent: ${intent.description}` : 'Enemy intent unknown';
  }

  private getCombatLogText(): string {
    return this.combatState.combatLog.slice(-5).join('\n'); // Show last 5 messages
  }

  private addCombatLog(message: string): void {
    this.combatState.combatLog.push(message);
    if (this.combatLogDisplay) {
      this.combatLogDisplay.setText(this.getCombatLogText());
    }
  }

  private updateEnemyIntentDisplay(): void {
    if (this.enemyIntentDisplay) {
      this.enemyIntentDisplay.setText(this.getEnemyIntentText());
    }
  }

  private handleVictory(): void {
    this.addCombatLog('Victory! You defeated the enemy!');

    // Generate rewards
    const reward = this.generateCombatReward();
    this.applyCombatReward(reward);

    // Return to hub after delay
    this.time.delayedCall(2000, () => {
      this.returnToHub('victory', reward);
    });
  }

  private handleDefeat(): void {
    this.addCombatLog('Defeat! You have been overcome...');

    // Handle permadeath
    this.gameState.resetGame();

    // Return to title after delay
    this.time.delayedCall(2000, () => {
      this.scene.start('TitleScene');
    });
  }

  private generateCombatReward(): CombatReward {
    // Simple reward generation for now
    // In the future, this will be more sophisticated
    return {
      experience: 10,
      storyClues: ['You learned something from this battle'],
    };
  }

  private applyCombatReward(reward: CombatReward): void {
    if (reward.experience) {
      this.addCombatLog(`Gained ${reward.experience} experience!`);
    }
    if (reward.storyClues && reward.storyClues.length > 0) {
      reward.storyClues.forEach(clue => {
        this.addCombatLog(`Clue: ${clue}`);
      });
    }
  }

  private returnToHub(result: 'victory' | 'defeat', reward?: CombatReward): void {
    this.scene.start('HubScene', { combatResult: result, reward });
  }
}
