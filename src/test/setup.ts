import { vi, beforeEach, afterEach } from 'vitest';

// Mock Phaser for testing
global.Phaser = {
  AUTO: 'AUTO',
  Scale: {
    FIT: 'FIT',
    CENTER_BOTH: 'CENTER_BOTH',
  },
  Game: vi.fn(),
  Scene: vi.fn(),
} as unknown as typeof Phaser;

// Add any global test setup here
beforeEach(() => {
  // Reset any global state before each test
});

afterEach(() => {
  // Clean up after each test
});
