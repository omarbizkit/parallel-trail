import { Scene } from 'phaser';
import { GameState } from './GameState';
import type { PlayerData } from './GameState';
import { UISystem, DEFAULT_RETRO_CONFIG } from './UISystem';

export interface HUDElement {
  key: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

export class HUDSystem {
  private static instance: HUDSystem;
  private uiSystem: UISystem;
  private gameState: GameState;
  private hudElements: Map<string, Phaser.GameObjects.Text> = new Map();
  private scene?: Scene;
  private healthBar?: Phaser.GameObjects.Graphics;
  private energyBar?: Phaser.GameObjects.Graphics;
  private paradoxBar?: Phaser.GameObjects.Graphics;
  private updateTimer?: Phaser.Time.TimerEvent;

  private constructor() {
    this.uiSystem = UISystem.getInstance();
    this.gameState = GameState.getInstance();
  }

  public static getInstance(): HUDSystem {
    if (!HUDSystem.instance) {
      HUDSystem.instance = new HUDSystem();
    }
    return HUDSystem.instance;
  }

  public initialize(scene: Scene): void {
    this.scene = scene;
    this.uiSystem.initialize(scene);
    this.createHUD();
    this.startUpdateLoop();
  }

  private createHUD(): void {
    if (!this.scene) return;

    const { width } = this.scene.cameras.main;

    // Create HUD background panel
    const hudBackground = this.scene.add.rectangle(0, 0, width, 120, 0x000000, 0.8);
    hudBackground.setOrigin(0, 0);
    hudBackground.setDepth(500);

    // Health section (left)
    this.createHealthSection(20, 20);

    // Time Energy section (center-left)
    this.createEnergySection(200, 20);

    // Paradox Risk section (center-right)
    this.createParadoxSection(400, 20);

    // Deck and Day info (right)
    this.createInfoSection(width - 150, 20);

    // Add CRT overlay effect
    this.addCRTEffects();
  }

  private createHealthSection(x: number, y: number): void {
    if (!this.scene) return;

    const palette = this.uiSystem.getColorPalette();

    // Health label with retro styling
    const healthLabel = this.scene.add.text(x, y, 'HEALTH', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '14px',
      color: palette.error,
    });
    this.hudElements.set('healthLabel', healthLabel);

    // Health bar background
    this.healthBar = this.scene.add.graphics();
    this.healthBar.fillStyle(0x333333, 0.8);
    this.healthBar.fillRect(x, y + 20, 150, 20);

    // Health value text
    const healthText = this.scene.add.text(x + 155, y + 20, '', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '12px',
      color: palette.text,
    });
    this.hudElements.set('healthText', healthText);
  }

  private createEnergySection(x: number, y: number): void {
    if (!this.scene) return;

    const palette = this.uiSystem.getColorPalette();

    // Time Energy label
    const energyLabel = this.scene.add.text(x, y, 'TIME ENERGY', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '14px',
      color: palette.primary,
    });
    this.hudElements.set('energyLabel', energyLabel);

    // Energy bar background
    this.energyBar = this.scene.add.graphics();
    this.energyBar.fillStyle(0x333333, 0.8);
    this.energyBar.fillRect(x, y + 20, 150, 20);

    // Energy value text
    const energyText = this.scene.add.text(x + 155, y + 20, '', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '12px',
      color: palette.text,
    });
    this.hudElements.set('energyText', energyText);
  }

  private createParadoxSection(x: number, y: number): void {
    if (!this.scene) return;

    const palette = this.uiSystem.getColorPalette();

    // Paradox Risk label
    const paradoxLabel = this.scene.add.text(x, y, 'PARADOX RISK', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '14px',
      color: palette.accent,
    });
    this.hudElements.set('paradoxLabel', paradoxLabel);

    // Paradox bar background
    this.paradoxBar = this.scene.add.graphics();
    this.paradoxBar.fillStyle(0x333333, 0.8);
    this.paradoxBar.fillRect(x, y + 20, 150, 20);

    // Paradox value text
    const paradoxText = this.scene.add.text(x + 155, y + 20, '', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '12px',
      color: palette.text,
    });
    this.hudElements.set('paradoxText', paradoxText);
  }

  private createInfoSection(x: number, y: number): void {
    if (!this.scene) return;

    const palette = this.uiSystem.getColorPalette();

    // Deck info
    const deckLabel = this.scene.add.text(x, y, 'DECK', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '14px',
      color: palette.secondary,
    });
    this.hudElements.set('deckLabel', deckLabel);

    const deckInfo = this.scene.add.text(x, y + 20, '', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '12px',
      color: palette.text,
    });
    this.hudElements.set('deckInfo', deckInfo);

    // Day counter
    const dayLabel = this.scene.add.text(x, y + 45, 'DAY', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '14px',
      color: palette.secondary,
    });
    this.hudElements.set('dayLabel', dayLabel);

    const dayCounter = this.scene.add.text(x, y + 65, '', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '12px',
      color: palette.text,
    });
    this.hudElements.set('dayCounter', dayCounter);
  }

  private addCRTEffects(): void {
    if (!this.scene) return;

    const { width, height } = this.scene.cameras.main;

    // Add scanlines effect
    const scanlines = this.scene.add.graphics();
    scanlines.setDepth(1000);

    for (let y = 0; y < height; y += 2) {
      scanlines.lineStyle(1, 0x000000, 0.1);
      scanlines.lineBetween(0, y, width, y);
    }

    // Add subtle glow to HUD elements
    this.hudElements.forEach(element => {
      if (element instanceof Phaser.GameObjects.Text) {
        element.setShadow(1, 1, '#00ff00', 1, true, true);
      }
    });
  }

  private startUpdateLoop(): void {
    if (!this.scene) return;

    // Update HUD every 100ms
    this.updateTimer = this.scene.time.addEvent({
      delay: 100,
      callback: this.updateHUD,
      callbackScope: this,
      loop: true,
    });

    // Initial update
    this.updateHUD();
  }

  private updateHUD(): void {
    if (!this.scene) return;

    const playerData = this.gameState.getPlayerData();

    // Update health
    this.updateHealthBar(playerData);

    // Update energy
    this.updateEnergyBar(playerData);

    // Update paradox
    this.updateParadoxBar(playerData);

    // Update info
    this.updateInfoSection(playerData);
  }

  private updateHealthBar(playerData: PlayerData): void {
    const healthText = this.hudElements.get('healthText');
    if (healthText) {
      healthText.setText(`${playerData.health}/${playerData.maxHealth}`);

      // Color based on health percentage
      const healthPercent = playerData.health / playerData.maxHealth;
      if (healthPercent > 0.6) {
        healthText.setColor(this.uiSystem.getColorPalette().success);
      } else if (healthPercent > 0.3) {
        healthText.setColor(this.uiSystem.getColorPalette().warning);
      } else {
        healthText.setColor(this.uiSystem.getColorPalette().error);
      }
    }

    // Update health bar
    if (this.healthBar) {
      const healthPercent = playerData.health / playerData.maxHealth;
      this.healthBar.clear();

      // Background
      this.healthBar.fillStyle(0x333333, 0.8);
      this.healthBar.fillRect(20, 40, 150, 20);

      // Fill
      const barColor = healthPercent > 0.6 ? 0x00ff00 : healthPercent > 0.3 ? 0xffaa00 : 0xff0000;
      this.healthBar.fillStyle(barColor, 0.9);
      this.healthBar.fillRect(20, 40, 150 * healthPercent, 20);

      // Border
      this.healthBar.lineStyle(1, 0x00ff00, 0.8);
      this.healthBar.strokeRect(20, 40, 150, 20);
    }
  }

  private updateEnergyBar(playerData: PlayerData): void {
    const energyText = this.hudElements.get('energyText');
    if (energyText) {
      energyText.setText(`${playerData.timeEnergy}/${playerData.maxTimeEnergy}`);
    }

    // Update energy bar
    if (this.energyBar) {
      const energyPercent = playerData.timeEnergy / playerData.maxTimeEnergy;
      this.energyBar.clear();

      // Background
      this.energyBar.fillStyle(0x333333, 0.8);
      this.energyBar.fillRect(200, 40, 150, 20);

      // Fill
      this.energyBar.fillStyle(0x00ffff, 0.9);
      this.energyBar.fillRect(200, 40, 150 * energyPercent, 20);

      // Border
      this.energyBar.lineStyle(1, 0x00ffff, 0.8);
      this.energyBar.strokeRect(200, 40, 150, 20);
    }
  }

  private updateParadoxBar(playerData: PlayerData): void {
    const paradoxText = this.hudElements.get('paradoxText');
    if (paradoxText) {
      paradoxText.setText(`${playerData.paradoxRisk}%`);

      // Color based on paradox risk
      if (playerData.paradoxRisk > 80) {
        paradoxText.setColor(this.uiSystem.getColorPalette().error);
      } else if (playerData.paradoxRisk > 50) {
        paradoxText.setColor(this.uiSystem.getColorPalette().warning);
      } else {
        paradoxText.setColor(this.uiSystem.getColorPalette().accent);
      }
    }

    // Update paradox bar
    if (this.paradoxBar) {
      const paradoxPercent = playerData.paradoxRisk / 100;
      this.paradoxBar.clear();

      // Background
      this.paradoxBar.fillStyle(0x333333, 0.8);
      this.paradoxBar.fillRect(400, 40, 150, 20);

      // Fill
      const barColor =
        playerData.paradoxRisk > 80 ? 0xff0000 : playerData.paradoxRisk > 50 ? 0xffaa00 : 0xffff00;
      this.paradoxBar.fillStyle(barColor, 0.9);
      this.paradoxBar.fillRect(400, 40, 150 * paradoxPercent, 20);

      // Border
      this.paradoxBar.lineStyle(1, 0xffff00, 0.8);
      this.paradoxBar.strokeRect(400, 40, 150, 20);
    }
  }

  private updateInfoSection(playerData: PlayerData): void {
    const deckInfo = this.hudElements.get('deckInfo');
    if (deckInfo) {
      deckInfo.setText(`${playerData.deckSize} cards`);
    }

    const dayCounter = this.hudElements.get('dayCounter');
    if (dayCounter) {
      dayCounter.setText(`${playerData.day}`);
    }
  }

  public showNotification(message: string, duration: number = 3000): void {
    if (!this.scene) return;

    const { width, height } = this.scene.cameras.main;
    const palette = this.uiSystem.getColorPalette();

    // Create notification overlay
    const notification = this.scene.add.text(width / 2, height - 100, message, {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '16px',
      color: palette.accent,
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
    });

    notification.setOrigin(0.5, 0.5);
    notification.setDepth(1500);

    // Add typewriter effect
    const fullText = notification.text;
    notification.setText('');

    let charIndex = 0;
    const typeTimer = this.scene.time.addEvent({
      delay: 50,
      callback: () => {
        if (charIndex < fullText.length) {
          charIndex++;
          notification.setText(fullText.substring(0, charIndex));
        } else {
          typeTimer.destroy();

          // Auto-hide after duration
          this.scene?.time.delayedCall(duration, () => {
            this.scene?.tweens.add({
              targets: notification,
              alpha: 0,
              duration: 500,
              onComplete: () => notification.destroy(),
            });
          });
        }
      },
      loop: true,
    });
  }

  public showStatusEffect(effect: string, value: number): void {
    if (!this.scene) return;

    const sign = value > 0 ? '+' : '';

    this.showNotification(`${effect}: ${sign}${value}`, 2000);
  }

  public destroy(): void {
    if (this.updateTimer) {
      this.updateTimer.destroy();
    }

    this.hudElements.forEach(element => {
      element.destroy();
    });

    this.healthBar?.destroy();
    this.energyBar?.destroy();
    this.paradoxBar?.destroy();

    HUDSystem.instance = undefined as unknown as HUDSystem;
  }
}
