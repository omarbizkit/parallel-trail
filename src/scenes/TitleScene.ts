import { Scene } from 'phaser';

export class TitleScene extends Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Title text
    const titleText = this.add.text(width / 2, height / 3, 'PARALLEL TRAIL', {
      font: '48px monospace',
      color: '#00ff00',
      stroke: '#003300',
      strokeThickness: 2,
    });
    titleText.setOrigin(0.5, 0.5);

    // Subtitle
    const subtitleText = this.add.text(
      width / 2,
      height / 3 + 60,
      'A Retro Roguelike Deck-Builder',
      {
        font: '20px monospace',
        color: '#00cc00',
      }
    );
    subtitleText.setOrigin(0.5, 0.5);

    // Menu options
    const menuOptions = [
      { text: 'Start New Game', action: () => this.startNewGame() },
      { text: 'Continue', action: () => this.continueGame(), enabled: false },
      { text: 'Settings', action: () => this.openSettings() },
      { text: 'Credits', action: () => this.showCredits() },
    ];

    let yPosition = height / 2 + 40;
    menuOptions.forEach((option, index) => {
      const optionText = this.add.text(width / 2, yPosition, `${index + 1}. ${option.text}`, {
        font: '18px monospace',
        color: option.enabled !== false ? '#ffffff' : '#666666',
      });
      optionText.setOrigin(0.5, 0.5);
      optionText.setInteractive({ useHandCursor: true });

      if (option.enabled !== false) {
        optionText.on('pointerover', () => {
          optionText.setColor('#00ff00');
        });

        optionText.on('pointerout', () => {
          optionText.setColor('#ffffff');
        });

        optionText.on('pointerdown', option.action);
      }

      yPosition += 40;
    });

    // Keyboard input
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const key = parseInt(event.key);
      if (key >= 1 && key <= menuOptions.length) {
        const option = menuOptions[key - 1];
        if (option.enabled !== false) {
          option.action();
        }
      }
    });
  }

  startNewGame(): void {
    this.scene.start('HubScene');
  }

  continueGame(): void {
    // TODO: Implement save game loading
    console.log('Continue game - not implemented yet');
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
