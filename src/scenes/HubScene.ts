import { Scene } from 'phaser';
import { GameState } from '../systems/GameState';
import { UISystem, RetroMenu, TypewriterText } from '../systems/UISystem';
import { HUDSystem } from '../systems/HUDSystem';

export class HubScene extends Scene {
  private gameState: GameState;
  private uiSystem: UISystem;
  private hudSystem: HUDSystem;
  private hubDescription?: TypewriterText;

  constructor() {
    super({ key: 'HubScene' });
    this.gameState = GameState.getInstance();
    this.uiSystem = UISystem.getInstance();
    this.hudSystem = HUDSystem.getInstance();
  }

  init(): void {
    this.gameState.setCurrentScene('HubScene');
    this.gameState.saveGame();
  }

  create(): void {
    const { width } = this.cameras.main;

    // Initialize UI systems
    this.uiSystem.initialize(this);
    this.hudSystem.initialize(this);

    // Hospital Hub title with typewriter effect (positioned above HUD)
    const hubTitle = new TypewriterText(this, width / 2, 80, 'HOSPITAL HUB', {
      fontSize: '32px',
      color: this.uiSystem.getColorPalette().primary,
      align: 'center',
    });
    hubTitle.setOrigin(0.5, 0.5);

    // Hub description with typewriter effect (positioned below HUD with safety margin)
    this.hubDescription = new TypewriterText(
      this,
      width / 2,
      280, // Moved down to ensure no overlap with HUD (HUD ends at y=240)
      'You awaken in a hospital bed, memories of the crash still fresh.\nThe sterile white walls seem to pulse with an otherworldly energy.',
      {
        fontSize: '16px',
        color: this.uiSystem.getColorPalette().text,
        align: 'center',
        wordWrap: { width: width - 100 },
      }
    );
    this.hubDescription.setOrigin(0.5, 0.5);

    // Create hub menu options
    const hubOptions = [
      'Review your deck',
      'Talk to the nurse',
      'Explore Phoenix',
      'Rest and recover',
    ];

    // Position menu with safe distance from description
    const descriptionBottomY = 280 + 40; // Description text position + estimated height
    const menuSafetyMargin = 60; // Safe margin above menu
    const menuY = descriptionBottomY + menuSafetyMargin;

    new RetroMenu(
      this,
      width / 2,
      menuY, // Dynamically positioned with safe spacing
      hubOptions,
      this.uiSystem.getConfig(),
      (index, _item) => {
        this.handleHubMenuSelection(index);
      }
    );

    // Show welcome notification
    this.hudSystem.showNotification('Welcome to the Hospital Hub', 2000);
  }

  private handleHubMenuSelection(index: number): void {
    switch (index) {
      case 0:
        this.reviewDeck();
        break;
      case 1:
        this.talkToNurse();
        break;
      case 2:
        this.explorePhoenix();
        break;
      case 3:
        this.restAndRecover();
        break;
    }
  }

  createHUD(): void {
    // HUD is now handled by the HUDSystem - no need for manual creation
    // The HUDSystem is initialized in create() and automatically updates
  }

  reviewDeck(): void {
    const { width, height } = this.cameras.main;

    // Create a simple deck review overlay
    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width - 100,
      height - 100,
      0x000000,
      0.9
    );

    const title = this.add.text(width / 2, 80, 'DECK REVIEW', {
      font: '24px monospace',
      color: '#00ff00',
    });
    title.setOrigin(0.5, 0.5);

    const playerData = this.gameState.getPlayerData();
    const deckInfo = this.add.text(width / 2, 120, `Current Deck: ${playerData.deckSize} cards`, {
      font: '16px monospace',
      color: '#ffffff',
    });
    deckInfo.setOrigin(0.5, 0.5);

    // Placeholder card list
    const cardList = [
      'Timecraft: Temporal Shift',
      'Mind/Resolve: Focused Concentration',
      'Social: Empathetic Connection',
      'Physical: Quick Reflexes',
      'Timecraft: Paradox Shield',
      'Mind/Resolve: Mental Fortress',
      'Social: Persuasive Argument',
      'Physical: Endurance Boost',
    ];

    let yPosition = 160;
    cardList.slice(0, playerData.deckSize).forEach((card, index) => {
      const cardText = this.add.text(width / 2, yPosition, `${index + 1}. ${card}`, {
        font: '14px monospace',
        color: '#cccccc',
      });
      cardText.setOrigin(0.5, 0.5);
      yPosition += 25;
    });

    const closeButton = this.add.text(width / 2, height - 60, 'Press ESC or click here to close', {
      font: '16px monospace',
      color: '#ffff00',
    });
    closeButton.setOrigin(0.5, 0.5);
    closeButton.setInteractive({ useHandCursor: true });

    const closeDeckReview = () => {
      overlay.destroy();
      title.destroy();
      deckInfo.destroy();
      closeButton.destroy();
      // Destroy all card text elements - we need to track them
      this.children.list.forEach(child => {
        if (child !== this.children.list[0] && child !== this.children.list[1]) {
          // Keep hub title and description
          const text = child as Phaser.GameObjects.Text;
          if (
            text.text &&
            text.text.includes('.') &&
            cardList.some(card => text.text.includes(card.split(':')[0]))
          ) {
            child.destroy();
          }
        }
      });
    };

    closeButton.on('pointerdown', closeDeckReview);

    // ESC key to close
    const escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey?.on('down', closeDeckReview);
  }

  talkToNurse(): void {
    const { width, height } = this.cameras.main;

    // Nurse dialogue data
    const dialogues = [
      {
        text: 'Good morning, Penny. How are you feeling today?',
        options: [
          {
            text: "I'm fine, just confused about what happened.",
            response:
              "That's completely normal after an accident. Your memories might be a bit jumbled.",
          },
          {
            text: 'I keep having these strange dreams...',
            response:
              'Sometimes our minds process trauma through dreams. Would you like to talk about them?',
          },
          {
            text: 'When can I leave?',
            response: 'We need to run a few more tests first. Patience is important for recovery.',
          },
        ],
      },
      {
        text: 'The doctor will be in to see you shortly.',
        options: [
          {
            text: 'I feel different since the accident.',
            response: 'In what way? Sometimes head injuries can cause subtle changes.',
          },
          {
            text: 'Time feels... strange.',
            response:
              'Temporal disorientation is common with concussions. It should improve with rest.',
          },
        ],
      },
    ];

    // Select random dialogue
    const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];

    // Create dialogue overlay
    const overlay = this.add.rectangle(width / 2, height - 150, width - 40, 200, 0x000000, 0.95);

    const nurseName = this.add.text(30, height - 230, 'NURSE:', {
      font: '16px monospace',
      color: '#00ff00',
    });

    const dialogueText = this.add.text(30, height - 200, dialogue.text, {
      font: '14px monospace',
      color: '#ffffff',
      wordWrap: { width: width - 60 },
    });

    let yPosition = height - 160;
    const optionButtons: Phaser.GameObjects.Text[] = [];

    dialogue.options.forEach((option, index) => {
      const optionText = this.add.text(50, yPosition, `${index + 1}. ${option.text}`, {
        font: '12px monospace',
        color: '#cccccc',
      });
      optionText.setInteractive({ useHandCursor: true });

      optionText.on('pointerover', () => {
        optionText.setColor('#00ff00');
      });

      optionText.on('pointerout', () => {
        optionText.setColor('#cccccc');
      });

      optionText.on('pointerdown', () => {
        // Show response
        dialogueText.setText(option.response);

        // Remove options
        optionButtons.forEach(btn => btn.destroy());

        // Add continue button
        const continueBtn = this.add.text(width - 100, height - 60, 'Continue', {
          font: '14px monospace',
          color: '#ffff00',
        });
        continueBtn.setInteractive({ useHandCursor: true });
        continueBtn.on('pointerdown', closeDialogue);
      });

      optionButtons.push(optionText);
      yPosition += 25;
    });

    const closeDialogue = () => {
      overlay.destroy();
      nurseName.destroy();
      dialogueText.destroy();
      optionButtons.forEach(btn => btn.destroy());

      // Find and destroy continue button if it exists
      const continueBtn = this.children.list.find(child => {
        const text = child as Phaser.GameObjects.Text;
        return text.text === 'Continue' && text.x === width - 100;
      });
      if (continueBtn) continueBtn.destroy();
    };

    // Add close button
    const closeButton = this.add.text(width - 60, height - 230, 'X', {
      font: '16px monospace',
      color: '#ff0000',
    });
    closeButton.setInteractive({ useHandCursor: true });
    closeButton.on('pointerdown', closeDialogue);
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
