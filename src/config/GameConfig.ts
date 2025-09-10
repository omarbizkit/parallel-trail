/**
 * Game configuration for character names, storage options, and global settings
 * Easily modifiable for future adjustments
 */

export const CHARACTER_CONFIG = {
  defaultName: 'Penelope "Penny" Torres',
  alternateNames: ['Penelope Torres', 'Penny Torres', 'Penny', 'Penelope "Penny" T.'] as string[],
  allowCustomNames: true,
  maxNameLength: 30,
} as const;

export const STORAGE_CONFIG = {
  provider: 'file' as 'file' | 'postgresql' | 'supabase',
  file: {
    playerDataPath: './data/player-data.json',
    globalScoresPath: './data/global-scores.json',
    metaProgressionPath: './data/meta-progression.json',
  },
  postgresql: {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || 'parallel_trail',
    username: process.env.PG_USERNAME || 'postgres',
    password: process.env.PG_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
} as const;

export const GLOBAL_SCORES_CONFIG = {
  enabled: true,
  categories: [
    'highest_day_reached',
    'fastest_completion',
    'most_cards_collected',
    'least_damage_taken',
    'most_successful_combats',
  ] as string[],
  maxTopScores: 100,
  anonymousMode: false,
} as const;

export const PLAYER_META_CONFIG = {
  enableGlobalScores: true,
  generateAnonymousPlayerId: true,
  persistBetweenRuns: true,
  resetOnNewGame: false,
} as const;
