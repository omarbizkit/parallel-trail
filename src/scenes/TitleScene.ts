import { Scene } from 'phaser';
import { GameState } from '../systems/GameState';
import { UISystem, TypewriterText, RetroMenu } from '../systems/UISystem';

export class TitleScene extends Scene {
  private gameState: GameState;
  private uiSystem: UISystem;
  private titleText?: TypewriterText;
  private subtitleText?: TypewriterText;
  private mainMenu?: RetroMenu;

  constructor() {
    super({ key: 'TitleScene' });
    this.gameState = GameState.getInstance();
    this.uiSystem = UISystem.getInstance();
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Initialize UI system
    this.uiSystem.initialize(this);

    // Title text with typewriter effect
    this.titleText = new TypewriterText(
      this,
      width / 2,
      height / 3,
      'PARALLEL TRAIL',
      {
        fontSize: '48px',
        color: this.uiSystem.getColorPalette().primary,
        align: 'center',
      },
      () => {
        // Start subtitle after title completes
        if (this.subtitleText) {
          this.subtitleText.startTyping('A Retro Roguelike Deck-Builder');
        } else {
          this.showMainMenu();
        }
      }
    );
    this.titleText.setOrigin(0.5, 0.5);

    // Subtitle (initially empty, will be populated after title animation)
    this.subtitleText = new TypewriterText(
      this,
      width / 2,
      height / 3 + 60,
      '',
      {
        fontSize: '20px',
        color: this.uiSystem.getColorPalette().secondary,
        align: 'center',
      },
      () => {
        // Show menu after subtitle completes
        this.showMainMenu();
      }
    );
    this.subtitleText.setOrigin(0.5, 0.5);

    // Skip intro on any key press or click
    this.input.keyboard?.on('keydown', () => {
      if (this.titleText?.isCurrentlyTyping()) {
        this.titleText.skipTyping();
      } else if (this.subtitleText?.isCurrentlyTyping()) {
        this.subtitleText.skipTyping();
      } else {
        // If neither is typing, show menu directly
        this.showMainMenu();
      }
    });

    this.input.on('pointerdown', () => {
      if (this.titleText?.isCurrentlyTyping()) {
        this.titleText.skipTyping();
      } else if (this.subtitleText?.isCurrentlyTyping()) {
        this.subtitleText.skipTyping();
      } else {
        // If neither is typing, show menu directly
        this.showMainMenu();
      }
    });

    // Fallback timer - show menu after 5 seconds regardless
    this.time.delayedCall(5000, () => {
      if (!this.mainMenu) {
        this.showMainMenu();
      }
    });
  }

  private showMainMenu(): void {
    const { width, height } = this.cameras.main;
    const hasSaveGame = this.gameState.hasSaveGame();

    const menuItems = [
      'Start New Game',
      hasSaveGame ? 'Continue' : 'Continue (No Save)',
      'Settings',
      'Credits',
    ];

    // Create proper RetroMenu using UISystem
    this.mainMenu = this.uiSystem.createMenu(
      this,
      width / 2 - 100,
      height / 2 + 60,
      menuItems,
      (index, item) => {
        // Only allow continue if save exists
        if (index === 1 && !hasSaveGame) {
          return; // Do nothing for disabled continue option
        }
        this.handleMenuSelection(index, item);
      }
    );

    // Disable continue option if no save exists
    if (!hasSaveGame) {
      this.mainMenu.setEnabled(true); // Keep menu enabled but handle individually
    }
  }

  private handleMenuSelection(index: number, _item: string): void {
    switch (index) {
      case 0: // Start New Game
        this.startNewGame();
        break;
      case 1: // Continue
        this.continueGame();
        break;
      case 2: // Settings
        this.openSettings();
        break;
      case 3: // Credits
        this.showCredits();
        break;
    }
  }

  startNewGame(): void {
    this.gameState.resetGame();
    this.gameState.setCurrentScene('HubScene');
    this.scene.start('HubScene');
  }

  continueGame(): void {
    if (this.gameState.loadGame()) {
      const savedScene = this.gameState.getCurrentScene();
      this.scene.start(savedScene);
    } else {
      console.error('Failed to load saved game');
      // Could show an error message to the user here
    }
  }

  openSettings(): void {
    // TODO: Implement settings menu
    console.log('Settings - not implemented yet');
  }

  showCredits(): void {
    // TODO: Implement credits screen
    console.log('Credits - not implemented yet');
  }
}
