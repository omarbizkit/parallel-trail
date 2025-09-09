import { Scene } from 'phaser';

export class HubScene extends Scene {
  constructor() {
    super({ key: 'HubScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Hospital Hub background/description
    const hubTitle = this.add.text(width / 2, 50, 'Hospital Hub', {
      font: '32px monospace',
      color: '#00ff00',
    });
    hubTitle.setOrigin(0.5, 0.5);

    const hubDescription = this.add.text(
      width / 2,
      120,
      'You awaken in a hospital bed, memories of the crash still fresh.\nThe sterile white walls seem to pulse with an otherworldly energy.',
      {
        font: '16px monospace',
        color: '#cccccc',
        align: 'center',
        wordWrap: { width: width - 100 },
      }
    );
    hubDescription.setOrigin(0.5, 0.5);

    // Hub options
    const hubOptions = [
      { text: 'Review your deck', action: () => this.reviewDeck() },
      { text: 'Talk to the nurse', action: () => this.talkToNurse() },
      { text: 'Explore Phoenix', action: () => this.explorePhoenix() },
      { text: 'Rest and recover', action: () => this.restAndRecover() },
    ];

    let yPosition = height / 2;
    hubOptions.forEach((option, index) => {
      const optionText = this.add.text(width / 2, yPosition, `${index + 1}. ${option.text}`, {
        font: '18px monospace',
        color: '#ffffff',
      });
      optionText.setOrigin(0.5, 0.5);
      optionText.setInteractive({ useHandCursor: true });

      optionText.on('pointerover', () => {
        optionText.setColor('#00ff00');
      });

      optionText.on('pointerout', () => {
        optionText.setColor('#ffffff');
      });

      optionText.on('pointerdown', option.action);

      yPosition += 40;
    });

    // Keyboard input
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const key = parseInt(event.key);
      if (key >= 1 && key <= hubOptions.length) {
        hubOptions[key - 1].action();
      }
    });

    // HUD placeholder
    this.createHUD();
  }

  createHUD(): void {
    const { width } = this.cameras.main;

    // Simple HUD elements (placeholder)
    const hudY = 30;

    // Health
    this.add.text(20, hudY, 'Health: 100/100', {
      font: '14px monospace',
      color: '#ff0000',
    });

    // Time Energy
    this.add.text(20, hudY + 20, 'Time Energy: 3/3', {
      font: '14px monospace',
      color: '#00ffff',
    });

    // Paradox Risk
    this.add.text(20, hudY + 40, 'Paradox Risk: 0%', {
      font: '14px monospace',
      color: '#ffff00',
    });

    // Deck info
    this.add.text(width - 150, hudY, 'Deck: 8 cards', {
      font: '14px monospace',
      color: '#ffffff',
    });
  }

  reviewDeck(): void {
    console.log('Review deck - not implemented yet');
    // TODO: Implement deck review interface
  }

  talkToNurse(): void {
    console.log('Talk to nurse - not implemented yet');
    // TODO: Implement nurse dialogue
  }

  explorePhoenix(): void {
    console.log('Explore Phoenix - not implemented yet');
    // TODO: Implement location selection and exploration
  }

  restAndRecover(): void {
    console.log('Rest and recover - not implemented yet');
    // TODO: Implement rest mechanics
  }
}
