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

    // Create HUD background panel (moved down to avoid title overlap)
    const hudBackground = this.scene.add.rectangle(0, 140, width, 100, 0x000000, 0.8);
    hudBackground.setOrigin(0, 0);
    hudBackground.setDepth(500);

    // Create section separators for better visual grouping
    this.createSectionSeparators();

    // Calculate refined spacing with consistent padding
    const sectionSpacing = 200; // 160px content + 40px padding between sections
    const startX = 30; // Increased left padding for better visual balance

    // Status bar sections (left area - three bars)
    this.createHealthSection(startX, 160);
    this.createEnergySection(startX + sectionSpacing, 160);
    this.createParadoxSection(startX + sectionSpacing * 2, 160);

    // Info section (right area - DECK/DAY)
    const infoX = width - 200; // Fixed right alignment for info
    this.createInfoSection(infoX, 160);

    // Add CRT overlay effect
    this.addCRTEffects();
  }

  private createSectionSeparators(): void {
    if (!this.scene) return;

    const { width } = this.scene.cameras.main;

    // Create subtle background border for status bar areas
    const backgroundGraphics = this.scene.add.graphics();
    backgroundGraphics.lineStyle(1, 0x00cc00, 0.15); // Green color for retro aesthetic
    backgroundGraphics.fillStyle(0x000000, 0.2);

    // Draw background rectangles for better visual separation
    const infoAreaX = width - 220;
    backgroundGraphics.fillRect(15, 155, 585, 33); // Status bar area background
    backgroundGraphics.strokeRoundedRect(15, 155, 585, 33, 2); // Status bar area border

    backgroundGraphics.fillRect(infoAreaX - 5, 145, 185, 85); // Info area background
    backgroundGraphics.strokeRoundedRect(infoAreaX - 5, 145, 185, 85, 2); // Info area border
    backgroundGraphics.setDepth(499);

    // Vertical separator between status bars and info section
    const separatorX = infoAreaX;
    const separatorGraphics = this.scene.add.graphics();
    separatorGraphics.lineStyle(1, 0x00cc00, 0.4);
    separatorGraphics.lineBetween(separatorX - 10, 155, separatorX - 10, 190);
    separatorGraphics.setDepth(501);

    // Horizontal separator between HUD background and screen
    const hSeparatorGraphics = this.scene.add.graphics();
    hSeparatorGraphics.lineStyle(1, 0x00cc00, 0.3);
    hSeparatorGraphics.lineBetween(10, 155, width - 10, 155); // Top separator
    hSeparatorGraphics.lineBetween(10, 188, width - 10, 188); // Bottom separator
    hSeparatorGraphics.setDepth(501);

    // Add small indicators for bar sections
    const indicatorGraphics = this.scene.add.graphics();
    indicatorGraphics.lineStyle(1, 0x00ff00, 0.5);

    // Section indicators above bars
    const barPositions = [35, 235, 435]; // Center of each bar section
    barPositions.forEach(x => {
      indicatorGraphics.lineBetween(x + 5, 138, x + 15, 138); // Short horizontal lines
      indicatorGraphics.lineBetween(x + 10, 138, x + 10, 143); // Small vertical marker
    });
    indicatorGraphics.setDepth(501);
  }

  private createHealthSection(x: number, y: number): void {
    if (!this.scene) return;

    const palette = this.uiSystem.getColorPalette();

    // Health label with retro styling (positioned above bar)
    const healthLabel = this.scene.add.text(x, y - 25, 'HEALTH', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '14px',
      color: palette.error,
    });
    this.hudElements.set('healthLabel', healthLabel);

    // Health bar background (spaced below label)
    this.healthBar = this.scene.add.graphics();
    this.healthBar.fillStyle(0x333333, 0.8);
    this.healthBar.fillRect(x, y, 150, 20);

    // Health value text (aligned with bar)
    const healthText = this.scene.add.text(x + 155, y + 2, '', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '12px',
      color: palette.text,
    });
    this.hudElements.set('healthText', healthText);
  }

  private createEnergySection(x: number, y: number): void {
    if (!this.scene) return;

    const palette = this.uiSystem.getColorPalette();

    // Time Energy label (positioned above bar)
    const energyLabel = this.scene.add.text(x, y - 25, 'TIME ENERGY', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '14px',
      color: palette.primary,
    });
    this.hudElements.set('energyLabel', energyLabel);

    // Energy bar background (spaced below label)
    this.energyBar = this.scene.add.graphics();
    this.energyBar.fillStyle(0x333333, 0.8);
    this.energyBar.fillRect(x, y, 150, 20);

    // Energy value text (aligned with bar)
    const energyText = this.scene.add.text(x + 155, y + 2, '', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '12px',
      color: palette.text,
    });
    this.hudElements.set('energyText', energyText);
  }

  private createParadoxSection(x: number, y: number): void {
    if (!this.scene) return;

    const palette = this.uiSystem.getColorPalette();

    // Paradox Risk label (positioned above bar)
    const paradoxLabel = this.scene.add.text(x, y - 25, 'PARADOX RISK', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '14px',
      color: palette.accent,
    });
    this.hudElements.set('paradoxLabel', paradoxLabel);

    // Paradox bar background (spaced below label)
    this.paradoxBar = this.scene.add.graphics();
    this.paradoxBar.fillStyle(0x333333, 0.8);
    this.paradoxBar.fillRect(x, y, 150, 20);

    // Paradox value text (aligned with bar)
    const paradoxText = this.scene.add.text(x + 155, y + 2, '', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '12px',
      color: palette.text,
    });
    this.hudElements.set('paradoxText', paradoxText);
  }

  private createInfoSection(x: number, y: number): void {
    if (!this.scene) return;

    const palette = this.uiSystem.getColorPalette();

    // Create a subtle background box for the info section
    const infoBackground = this.scene.add.graphics();
    infoBackground.lineStyle(1, 0x00cc00, 0.4);
    infoBackground.fillStyle(0x000000, 0.3);
    infoBackground.fillRoundedRect(x - 8, y - 30, 170, 85, 2);
    infoBackground.strokeRoundedRect(x - 8, y - 30, 170, 85, 2);
    infoBackground.setDepth(499);

    // DECK section - left aligned within the info box
    const deckLabel = this.scene.add.text(x, y - 20, 'DECK:', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '12px',
      color: palette.secondary,
    });
    this.hudElements.set('deckLabel', deckLabel);

    const deckValue = this.scene.add.text(x + 45, y - 20, '', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '12px',
      color: palette.accent,
    });
    this.hudElements.set('deckValue', deckValue);

    // DAY section - right aligned within the info box
    const dayLabel = this.scene.add.text(x, y + 5, 'DAY:', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '12px',
      color: palette.secondary,
    });
    this.hudElements.set('dayLabel', dayLabel);

    const dayValue = this.scene.add.text(x + 40, y + 5, '', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '12px',
      color: palette.text,
    });
    this.hudElements.set('dayValue', dayValue);

    // Current time/location - formatted consistently
    const locationLabel = this.scene.add.text(x, y + 30, 'LOCATION:', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '10px',
      color: palette.disabled,
    });
    this.hudElements.set('locationLabel', locationLabel);

    const locationValue = this.scene.add.text(x, y + 42, 'HOSPITAL HUB', {
      fontFamily: DEFAULT_RETRO_CONFIG.fontFamily,
      fontSize: '11px',
      color: palette.primary,
    });
    this.hudElements.set('locationValue', locationValue);
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

      // Background (using consistent spacing)
      this.healthBar.fillStyle(0x333333, 0.8);
      this.healthBar.fillRect(30, 160, 150, 20);

      // Fill
      const barColor = healthPercent > 0.6 ? 0x00ff00 : healthPercent > 0.3 ? 0xffaa00 : 0xff0000;
      this.healthBar.fillStyle(barColor, 0.9);
      this.healthBar.fillRect(30, 160, 150 * healthPercent, 20);

      // Border
      this.healthBar.lineStyle(1, 0x00ff00, 0.8);
      this.healthBar.strokeRect(30, 160, 150, 20);
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

      // Background (using consistent spacing)
      this.energyBar.fillStyle(0x333333, 0.8);
      this.energyBar.fillRect(230, 160, 150, 20);

      // Fill
      this.energyBar.fillStyle(0x00ffff, 0.9);
      this.energyBar.fillRect(230, 160, 150 * energyPercent, 20);

      // Border
      this.energyBar.lineStyle(1, 0x00ffff, 0.8);
      this.energyBar.strokeRect(230, 160, 150, 20);
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

      // Background (using consistent spacing)
      this.paradoxBar.fillStyle(0x333333, 0.8);
      this.paradoxBar.fillRect(430, 160, 150, 20);

      // Fill
      const barColor =
        playerData.paradoxRisk > 80 ? 0xff0000 : playerData.paradoxRisk > 50 ? 0xffaa00 : 0xffff00;
      this.paradoxBar.fillStyle(barColor, 0.9);
      this.paradoxBar.fillRect(430, 160, 150 * paradoxPercent, 20);

      // Border
      this.paradoxBar.lineStyle(1, 0xffff00, 0.8);
      this.paradoxBar.strokeRect(430, 160, 150, 20);
    }
  }

  private updateInfoSection(playerData: PlayerData): void {
    const deckValue = this.hudElements.get('deckValue');
    if (deckValue) {
      deckValue.setText(`${playerData.deckSize} CARDS`);
    }

    const dayValue = this.hudElements.get('dayValue');
    if (dayValue) {
      dayValue.setText(`${playerData.day}`);
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
