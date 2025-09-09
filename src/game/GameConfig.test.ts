import { describe, it, expect } from 'vitest';
import { gameConfig } from './GameConfig';

describe('GameConfig', () => {
  it('should have correct dimensions', () => {
    expect(gameConfig.width).toBe(1024);
    expect(gameConfig.height).toBe(768);
  });

  it('should have retro rendering settings', () => {
    expect(gameConfig.render?.pixelArt).toBe(true);
    expect(gameConfig.render?.antialias).toBe(false);
  });

  it('should have proper scaling configuration', () => {
    expect(gameConfig.scale?.mode).toBe('FIT');
    expect(gameConfig.scale?.autoCenter).toBe('CENTER_BOTH');
  });

  it('should have black background', () => {
    expect(gameConfig.backgroundColor).toBe('#000000');
  });
});
