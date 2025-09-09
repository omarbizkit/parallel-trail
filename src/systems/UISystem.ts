import { Scene } from 'phaser';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  disabled: string;
  highlight: string;
  warning: string;
  error: string;
  success: string;
}

export interface TypewriterConfig {
  speed: number; // characters per second
  soundEnabled: boolean;
  cursorChar: string;
  cursorBlinkSpeed: number;
}

export interface RetroUIConfig {
  fontFamily: string;
  fontSize: {
    small: number;
    medium: number;
    large: number;
    title: number;
  };
  colorPalette: ColorPalette;
  typewriter: TypewriterConfig;
  crtEffect: boolean;
  scanlines: boolean;
  glowEffect: boolean;
}

export const DEFAULT_RETRO_CONFIG: RetroUIConfig = {
  fontFamily: 'monospace',
  fontSize: {
    small: 12,
    medium: 16,
    large: 20,
    title: 32,
  },
  colorPalette: {
    primary: '#00ff00',     // Bright green (main UI)
    secondary: '#00cc00',   // Darker green
    accent: '#ffff00',      // Yellow for highlights
    background: '#000000',  // Pure black
    text: '#cccccc',        // Light gray for body text
    disabled: '#666666',    // Gray for disabled elements
    highlight: '#ffffff',   // White for active selections
    warning: '#ffaa00',     // Orange for warnings
    error: '#ff0000',       // Red for errors
    success: '#00ff00',     // Green for success
  },
  typewriter: {
    speed: 30,              // 30 characters per second
    soundEnabled: true,
    cursorChar: '▮',
    cursorBlinkSpeed: 500,  // milliseconds
  },
  crtEffect: true,
  scanlines: true,
  glowEffect: true,
};

export class TypewriterText extends Phaser.GameObjects.Text {
  private fullText: string = '';
  private currentIndex: number = 0;
  private isTyping: boolean = false;
  private typewriterTimer?: Phaser.Time.TimerEvent;
  private cursorTimer?: Phaser.Time.TimerEvent;
  private showCursor: boolean = false;
  private onCompleteCallback?: () => void;
  private config: TypewriterConfig;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    text: string = '',
    style: Phaser.Types.GameObjects.Text.TextStyle = {},
    config?: TypewriterConfig | (() => void),
    onComplete?: () => void
  ) {
    super(scene, x, y, '', style);
    
    // Handle overloaded constructor
    if (typeof config === 'function') {
      this.onCompleteCallback = config;
      this.config = DEFAULT_RETRO_CONFIG.typewriter;
    } else {
      this.config = config || DEFAULT_RETRO_CONFIG.typewriter;
      this.onCompleteCallback = onComplete;
    }
    
    this.fullText = text;
    
    scene.add.existing(this);
    
    if (text) {
      this.startTyping(text, this.onCompleteCallback);
    }
  }

  startTyping(text: string, onComplete?: () => void): void {
    this.fullText = text;
    this.currentIndex = 0;
    this.isTyping = true;
    this.onCompleteCallback = onComplete;
    this.showCursor = true;
    
    // Clear existing timers
    this.clearTimers();
    
    // Start typewriter effect
    const delay = 1000 / this.config.speed;
    this.typewriterTimer = this.scene.time.addEvent({
      delay: delay,
      callback: this.typeNextCharacter,
      callbackScope: this,
      repeat: this.fullText.length - 1,
    });
    
    // Start cursor blinking
    this.cursorTimer = this.scene.time.addEvent({
      delay: this.config.cursorBlinkSpeed,
      callback: this.toggleCursor,
      callbackScope: this,
      loop: true,
    });
  }

  private typeNextCharacter(): void {
    if (this.currentIndex < this.fullText.length) {
      this.currentIndex++;
      this.updateDisplayText();
      
      // Play typewriter sound if enabled
      if (this.config.soundEnabled) {
        this.playTypeSound();
      }
    } else {
      // Typing complete
      this.isTyping = false;
      this.showCursor = false;
      this.clearTimers();
      this.updateDisplayText();
      
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    }
  }

  private toggleCursor(): void {
    if (this.isTyping) {
      this.showCursor = !this.showCursor;
      this.updateDisplayText();
    }
  }

  private updateDisplayText(): void {
    let displayText = this.fullText.substring(0, this.currentIndex);
    
    if (this.showCursor && this.isTyping) {
      displayText += this.config.cursorChar;
    }
    
    this.setText(displayText);
  }

  private clearTimers(): void {
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
      this.typewriterTimer = undefined;
    }
    
    if (this.cursorTimer) {
      this.cursorTimer.destroy();
      this.cursorTimer = undefined;
    }
  }

  private playTypeSound(): void {
    // TODO: Implement typewriter sound effect
    // This would play a short beep or click sound
  }

  skipTyping(): void {
    if (this.isTyping) {
      this.currentIndex = this.fullText.length;
      this.isTyping = false;
      this.showCursor = false;
      this.clearTimers();
      this.updateDisplayText();
      
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    }
  }

  isCurrentlyTyping(): boolean {
    return this.isTyping;
  }

  getFullText(): string {
    return this.fullText;
  }

  destroy(fromScene?: boolean): void {
    this.clearTimers();
    super.destroy(fromScene);
  }
}

export class RetroMenu extends Phaser.GameObjects.Container {
  private menuItems: Phaser.GameObjects.Text[] = [];
  private selectedIndex: number = 0;
  private config: RetroUIConfig;
  private selectionCallback?: (index: number, item: string) => void;
  private selectionIndicator?: Phaser.GameObjects.Text;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    items: string[],
    config: RetroUIConfig = DEFAULT_RETRO_CONFIG,
    selectionCallback?: (index: number, item: string) => void
  ) {
    super(scene, x, y);
    
    this.config = config;
    this.selectionCallback = selectionCallback;
    
    scene.add.existing(this);
    
    this.createMenu(items);
    this.setupInput();
  }

  private createMenu(items: string[]): void {
    let yOffset = 0;
    
    items.forEach((item, index) => {
      const menuItem = this.scene.add.text(20, yOffset, `${index + 1}. ${item}`, {
        fontFamily: this.config.fontFamily,
        fontSize: `${this.config.fontSize.medium}px`,
        color: this.config.colorPalette.text,
      });
      
      menuItem.setInteractive({ useHandCursor: true });
      
      // Mouse events
      menuItem.on('pointerover', () => {
        this.setSelectedIndex(index);
      });
      
      menuItem.on('pointerdown', () => {
        this.selectItem(index);
      });
      
      this.menuItems.push(menuItem);
      this.add(menuItem);
      
      yOffset += 30;
    });
    
    // Create selection indicator
    this.selectionIndicator = this.scene.add.text(0, 0, '▶', {
      fontFamily: this.config.fontFamily,
      fontSize: `${this.config.fontSize.medium}px`,
      color: this.config.colorPalette.highlight,
    });
    
    this.add(this.selectionIndicator);
    this.updateSelectionIndicator();
  }

  private setupInput(): void {
    // Keyboard input
    const cursors = this.scene.input.keyboard?.createCursorKeys();
    const keys = this.scene.input.keyboard?.addKeys('W,S,Enter,Space') as any;
    
    if (cursors) {
      cursors.up.on('down', () => {
        this.setSelectedIndex(Math.max(0, this.selectedIndex - 1));
      });
      
      cursors.down.on('down', () => {
        this.setSelectedIndex(Math.min(this.menuItems.length - 1, this.selectedIndex + 1));
      });
    }
    
    if (keys) {
      keys.W.on('down', () => {
        this.setSelectedIndex(Math.max(0, this.selectedIndex - 1));
      });
      
      keys.S.on('down', () => {
        this.setSelectedIndex(Math.min(this.menuItems.length - 1, this.selectedIndex + 1));
      });
      
      keys.Enter.on('down', () => {
        this.selectCurrentItem();
      });
      
      keys.Space.on('down', () => {
        this.selectCurrentItem();
      });
    }
    
    // Number key shortcuts
    for (let i = 1; i <= 9; i++) {
      this.scene.input.keyboard?.on(`keydown-${i}`, () => {
        if (i <= this.menuItems.length) {
          this.selectItem(i - 1);
        }
      });
    }
  }

  private setSelectedIndex(index: number): void {
    if (index !== this.selectedIndex && index >= 0 && index < this.menuItems.length) {
      // Reset previous item color
      if (this.selectedIndex >= 0 && this.selectedIndex < this.menuItems.length) {
        this.menuItems[this.selectedIndex].setColor(this.config.colorPalette.text);
      }
      
      this.selectedIndex = index;
      
      // Highlight new item
      this.menuItems[this.selectedIndex].setColor(this.config.colorPalette.highlight);
      
      this.updateSelectionIndicator();
    }
  }

  private updateSelectionIndicator(): void {
    if (this.selectionIndicator && this.selectedIndex >= 0 && this.selectedIndex < this.menuItems.length) {
      const selectedItem = this.menuItems[this.selectedIndex];
      this.selectionIndicator.setY(selectedItem.y);
    }
  }

  private selectItem(index: number): void {
    this.setSelectedIndex(index);
    this.selectCurrentItem();
  }

  private selectCurrentItem(): void {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.menuItems.length) {
      const selectedText = this.menuItems[this.selectedIndex].text.replace(/^\d+\.\s*/, '');
      
      if (this.selectionCallback) {
        this.selectionCallback(this.selectedIndex, selectedText);
      }
    }
  }

  getSelectedIndex(): number {
    return this.selectedIndex;
  }

  setEnabled(enabled: boolean): void {
    this.menuItems.forEach(item => {
      item.setAlpha(enabled ? 1 : 0.5);
      item.setInteractive(enabled);
    });
    
    if (this.selectionIndicator) {
      this.selectionIndicator.setAlpha(enabled ? 1 : 0.5);
    }
  }
}

export class CRTEffect extends Phaser.GameObjects.Graphics {
  private scanlines?: Phaser.GameObjects.Graphics;
  private glowGraphics?: Phaser.GameObjects.Graphics;

  constructor(scene: Scene, _config: RetroUIConfig = DEFAULT_RETRO_CONFIG) {
    super(scene, { x: 0, y: 0 });
    
    scene.add.existing(this);
    
    if (_config.scanlines) {
      this.createScanlines();
    }
    
    if (_config.glowEffect) {
      this.createGlowEffect();
    }
    
    this.setDepth(1000); // Render on top
  }

  private createScanlines(): void {
    this.scanlines = this.scene.add.graphics();
    
    const { width, height } = this.scene.cameras.main;
    
    // Create scanlines
    for (let y = 0; y < height; y += 2) {
      this.scanlines.lineStyle(1, 0x000000, 0.1);
      this.scanlines.lineBetween(0, y, width, y);
    }
    
    this.scanlines.setDepth(999);
  }

  private createGlowEffect(): void {
    this.glowGraphics = this.scene.add.graphics();
    
    const { width, height } = this.scene.cameras.main;
    
    // Create subtle glow around edges using simple rectangles with alpha
    this.glowGraphics.fillStyle(0x00ff00, 0.05);
    this.glowGraphics.fillRect(0, 0, width, height);
    
    // Add some edge glow
    this.glowGraphics.fillStyle(0x00ff00, 0.1);
    this.glowGraphics.fillRect(0, 0, 50, height);
    this.glowGraphics.fillRect(width - 50, 0, 50, height);
    
    this.glowGraphics.setDepth(998);
  }

  destroy(fromScene?: boolean): void {
    this.scanlines?.destroy();
    this.glowGraphics?.destroy();
    super.destroy(fromScene);
  }
}

export class UISystem {
  private static instance: UISystem;
  private config: RetroUIConfig;
  private crtEffect?: CRTEffect;

  private constructor(config: RetroUIConfig = DEFAULT_RETRO_CONFIG) {
    this.config = config;
  }

  public static getInstance(config?: RetroUIConfig): UISystem {
    if (!UISystem.instance) {
      UISystem.instance = new UISystem(config);
    }
    return UISystem.instance;
  }

  public initialize(scene: Scene): void {
    if (this.config.crtEffect) {
      this.crtEffect = new CRTEffect(scene, this.config);
    }
  }

  public createTypewriterText(
    scene: Scene,
    x: number,
    y: number,
    text: string,
    style: Phaser.Types.GameObjects.Text.TextStyle = {},
    onComplete?: () => void
  ): TypewriterText {
    const mergedStyle = {
      fontFamily: this.config.fontFamily,
      fontSize: `${this.config.fontSize.medium}px`,
      color: this.config.colorPalette.text,
      ...style,
    };

    return new TypewriterText(scene, x, y, text, mergedStyle, this.config.typewriter, onComplete);
  }

  public createMenu(
    scene: Scene,
    x: number,
    y: number,
    items: string[],
    selectionCallback?: (index: number, item: string) => void
  ): RetroMenu {
    return new RetroMenu(scene, x, y, items, this.config, selectionCallback);
  }

  public getColorPalette(): ColorPalette {
    return { ...this.config.colorPalette };
  }

  public getConfig(): RetroUIConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<RetroUIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public destroy(): void {
    this.crtEffect?.destroy();
    this.crtEffect = undefined;
    UISystem.instance = undefined as any;
  }
}