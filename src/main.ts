import Phaser from 'phaser';
import { gameConfig } from './game/GameConfig';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { HubScene } from './scenes/HubScene';

// Configure game scenes
gameConfig.scene = [BootScene, TitleScene, HubScene];

// Create and start the game
const game = new Phaser.Game(gameConfig);

export default game;
