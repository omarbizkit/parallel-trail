import { Scene } from 'phaser';
import { GameState } from '../systems/GameState';

export class HubScene extends Scene {
  private gameState: GameState;
  private hudElements: { [key: string]: Phaser.GameObjects.Text } = {};

  constructor() {
    super({ key: 'HubScene' });
    this.gameState = GameState.getInstance();
  }

  init(): void {
    this.gameState.setCurrentScene('HubScene');
    this.gameState.saveGame();
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
    const playerData = this.gameState.getPlayerData();
    const hudY = 30;

    // Clear existing HUD elements
    Object.values(this.hudElements).forEach(element => element.destroy());
    this.hudElements = {};

    // Health
    this.hudElements.health = this.add.text(20, hudY, `Health: ${playerData.health}/${playerData.maxHealth}`, {
      font: '14px monospace',
      color: '#ff0000',
    });

    // Time Energy
    this.hudElements.timeEnergy = this.add.text(20, hudY + 20, `Time Energy: ${playerData.timeEnergy}/${playerData.maxTimeEnergy}`, {
      font: '14px monospace',
      color: '#00ffff',
    });

    // Paradox Risk
    this.hudElements.paradoxRisk = this.add.text(20, hudY + 40, `Paradox Risk: ${playerData.paradoxRisk}%`, {
      font: '14px monospace',
      color: '#ffff00',
    });

    // Deck info
    this.hudElements.deckInfo = this.add.text(width - 150, hudY, `Deck: ${playerData.deckSize} cards`, {
      font: '14px monospace',
      color: '#ffffff',
    });

    // Day counter
    this.hudElements.day = this.add.text(width - 150, hudY + 20, `Day: ${playerData.day}`, {
      font: '14px monospace',
      color: '#cccccc',
    });
  }

  reviewDeck(): void {
    const { width, height } = this.cameras.main;
    
    // Create a simple deck review overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width - 100, height - 100, 0x000000, 0.9);
    
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
      'Physical: Endurance Boost'
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
        if (child !== this.children.list[0] && child !== this.children.list[1]) { // Keep hub title and description
          const text = child as Phaser.GameObjects.Text;
          if (text.text && text.text.includes('.') && cardList.some(card => text.text.includes(card.split(':')[0]))) {
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
        text: "Good morning, Penny. How are you feeling today?",
        options: [
          { text: "I'm fine, just confused about what happened.", response: "That's completely normal after an accident. Your memories might be a bit jumbled." },
          { text: "I keep having these strange dreams...", response: "Sometimes our minds process trauma through dreams. Would you like to talk about them?" },
          { text: "When can I leave?", response: "We need to run a few more tests first. Patience is important for recovery." }
        ]
      },
      {
        text: "The doctor will be in to see you shortly.",
        options: [
          { text: "I feel different since the accident.", response: "In what way? Sometimes head injuries can cause subtle changes." },
          { text: "Time feels... strange.", response: "Temporal disorientation is common with concussions. It should improve with rest." }
        ]
      }
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
