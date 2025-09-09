import { Scene } from 'phaser';

interface LoadingState {
  assetsLoaded: boolean;
  transitionReady: boolean;
}

export class BootScene extends Scene {
  private loadingState: LoadingState;

  constructor() {
    super({ key: 'BootScene' });
    this.loadingState = {
      assetsLoaded: false,
      transitionReady: false,
    };
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px monospace',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.add.text(width / 2, height / 2 - 5, '0%', {
      font: '18px monospace',
      color: '#ffffff',
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      percentText.setText(`${Math.floor(value * 100)}%`);
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Load assets here
    this.load.image('logo', 'src/assets/images/logo.png');

    // Load UI assets
    this.load.image('pixel', 'src/assets/images/pixel.png');

    // TODO: Load additional assets as they become available
    // this.load.image('background', 'src/assets/images/background.png');
    // this.load.image('card-back', 'src/assets/images/card-back.png');
    // this.load.audio('title-theme', 'src/assets/audio/title-theme.mp3');
  }

  create(): void {
    this.loadingState.assetsLoaded = true;

    // Add a small delay for better user experience
    this.time.delayedCall(500, () => {
      this.loadingState.transitionReady = true;
      this.transitionToTitleScene();
    });
  }

  transitionToTitleScene(): void {
    if (!this.loadingState.transitionReady) {
      return;
    }

    // Add fade out effect
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('TitleScene');
    });
  }
}
