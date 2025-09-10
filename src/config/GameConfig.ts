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
    host: (typeof process !== 'undefined' ? process.env.PG_HOST : undefined) || 'localhost',
    port: parseInt((typeof process !== 'undefined' ? process.env.PG_PORT : undefined) || '5432'),
    database:
      (typeof process !== 'undefined' ? process.env.PG_DATABASE : undefined) || 'parallel_trail',
    username: (typeof process !== 'undefined' ? process.env.PG_USERNAME : undefined) || 'postgres',
    password: (typeof process !== 'undefined' ? process.env.PG_PASSWORD : undefined) || '',
    ssl: (typeof process !== 'undefined' ? process.env.NODE_ENV : undefined) === 'production',
  },
  supabase: {
    url: (typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined) || '',
    anonKey: (typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined) || '',
    serviceRoleKey:
      (typeof process !== 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined) || '',
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
