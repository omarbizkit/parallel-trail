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

    // Skip loading problematic PNG files - create programmatically instead
    this.load.on('fileerror', (file: Phaser.Loader.File) => {
      console.warn(`Failed to load asset: ${file.key} from ${file.src}`);
    });

    // We'll create all textures programmatically to avoid WebGL format issues

    // TODO: Load additional assets as they become available
    // this.load.image('background', 'src/assets/images/background.png');
    // this.load.image('card-back', 'src/assets/images/card-back.png');
    // this.load.audio('title-theme', 'src/assets/audio/title-theme.mp3');
  }

  create(): void {
    this.loadingState.assetsLoaded = true;

    // Create fallback assets if originals failed to load
    this.createFallbackAssets();

    // Add a small delay for better user experience
    this.time.delayedCall(500, () => {
      console.log('BootScene: Preparing to transition to TitleScene');
      this.loadingState.transitionReady = true;
      this.transitionToTitleScene();
    });
  }

  private createFallbackAssets(): void {
    // Always create programmatic textures to avoid WebGL format issues
    this.createProgrammaticTextures();
  }

  private createProgrammaticTextures(): void {
    try {
      // Create a clean white pixel texture
      const pixelCanvas = this.createPixelCanvas();
      this.textures.addCanvas('pixel', pixelCanvas);

      // Create a simple logo placeholder
      const logoCanvas = this.createLogoCanvas();
      this.textures.addCanvas('logo', logoCanvas);

      // Configure these textures to prevent WebGL warnings
      this.configureTextureFiltering();
    } catch (error) {
      console.error('BootScene: Error creating programmatic textures:', error);
    }
  }

  private configureTextureFiltering(): void {
    // Set texture filtering to prevent mipmap generation warnings
    const textures = ['pixel', 'logo'];
    textures.forEach(textureKey => {
      try {
        if (this.textures.exists(textureKey)) {
          const texture = this.textures.get(textureKey);
          if (texture && texture.source[0]) {
            // Disable mipmapping and set to nearest neighbor filtering
            const source = texture.source[0];
            source.setFilter(Phaser.Textures.FilterMode.NEAREST);
            console.log(`BootScene: Configured filtering for ${textureKey}`);
          }
        }
      } catch (error) {
        console.warn(`BootScene: Failed to configure filtering for ${textureKey}:`, error);
      }
    });
  }

  private createPixelCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 2; // Power of 2 to avoid WebGL warnings
    canvas.height = 2;
    const context = canvas.getContext('2d', { alpha: true });
    if (context) {
      // Create a clean white pixel with proper alpha
      context.clearRect(0, 0, 2, 2);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, 2, 2);
    }
    return canvas;
  }

  private createLogoCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 64; // Power of 2 dimensions
    canvas.height = 64;
    const context = canvas.getContext('2d', { alpha: true });
    if (context) {
      // Clear the canvas
      context.clearRect(0, 0, 64, 64);

      // Create a simple logo placeholder - green text on transparent background
      context.fillStyle = '#00ff00';
      context.font = '12px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('PT', 32, 32);
    }
    return canvas;
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
