import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/mockData.ts',
      ],
      thresholds: {
        lines: 4,
        functions: 0,
        branches: 0,
        statements: 4,
      },
    },
  },
})