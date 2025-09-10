import type { Types } from 'phaser';

export const gameConfig: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#000000',
  render: {
    pixelArt: true,
    antialias: false,
    mipmapFilter: 'NEAREST', // Prevent mipmap generation warnings
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  audio: {
    disableWebAudio: false, // Allow WebAudio but handle gracefully
  },
};
