import type { EnemyIntent } from '../scenes/CombatScene';

export interface EnemyData {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  aiType: 'aggressive' | 'defensive' | 'balanced' | 'special';
  baseDamage: number;
  description: string;
  flavorText: string[];
}

export const ENEMY_DATA: Record<string, EnemyData> = {
  test_enemy: {
    id: 'test_enemy',
    name: 'Temporal Anomaly',
    health: 50,
    maxHealth: 50,
    aiType: 'balanced',
    baseDamage: 8,
    description: 'A ripple in time that manifests as hostile energy',
    flavorText: [
      'The air shimmers as reality bends around this anomaly.',
      'You feel time itself becoming unstable in its presence.',
      'The temporal distortion seems to react to your presence.',
    ],
  },
  weak_enemy: {
    id: 'weak_enemy',
    name: 'Time Echo',
    health: 30,
    maxHealth: 30,
    aiType: 'aggressive',
    baseDamage: 5,
    description: 'A faint echo of temporal energy, less dangerous but still hostile',
    flavorText: [
      'A shadowy figure flickers in and out of existence.',
      'This seems to be an echo from another timeline.',
      'The echo grows stronger as you approach.',
    ],
  },
  strong_enemy: {
    id: 'strong_enemy',
    name: 'Temporal Guardian',
    health: 80,
    maxHealth: 80,
    aiType: 'defensive',
    baseDamage: 12,
    description: 'A powerful entity that protects the timeline from interference',
    flavorText: [
      'A imposing figure materializes, crackling with temporal energy.',
      'This guardian seems determined to prevent timeline disruption.',
      "The guardian's presence makes the air feel heavy with time.",
    ],
  },
};

export function getEnemyIntent(enemy: EnemyData, turnCount: number): EnemyIntent {
  const damage = enemy.baseDamage + Math.floor(turnCount / 3);

  switch (enemy.aiType) {
    case 'aggressive':
      // Attacks more frequently
      return turnCount % 2 === 0
        ? { type: 'attack', value: damage, description: `${enemy.name} prepares to attack!` }
        : {
            type: 'attack',
            value: Math.floor(damage * 0.7),
            description: `${enemy.name} prepares a quick strike!`,
          };

    case 'defensive':
      // Mix of attack and defend
      return turnCount % 3 === 0
        ? {
            type: 'defend',
            value: Math.floor(damage * 0.8),
            description: `${enemy.name} prepares to defend!`,
          }
        : { type: 'attack', value: damage, description: `${enemy.name} prepares to attack!` };

    case 'balanced':
      // Alternating pattern
      return turnCount % 2 === 0
        ? { type: 'attack', value: damage, description: `${enemy.name} prepares to attack!` }
        : {
            type: 'defend',
            value: Math.floor(damage * 0.6),
            description: `${enemy.name} prepares to defend!`,
          };

    case 'special':
      // Complex pattern with special abilities (for future expansion)
      return turnCount % 4 === 0
        ? {
            type: 'special',
            value: damage * 1.5,
            description: `${enemy.name} prepares a special attack!`,
          }
        : { type: 'attack', value: damage, description: `${enemy.name} prepares to attack!` };

    default:
      return { type: 'attack', value: damage, description: `${enemy.name} prepares to attack!` };
  }
}
