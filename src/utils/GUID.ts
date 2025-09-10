/**
 * GUID/UUID generation utility
 * Generates unique identifiers for players, games, and entities
 */

export function generateGUID(): string {
  // Simple UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generatePlayerId(): string {
  return `player_${Date.now()}_${generateShortId()}`;
}

export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8);
}

export function generateGameSessionId(): string {
  return `session_${Date.now()}_${generateShortId()}`;
}

export function isValidGUID(guid: string): boolean {
  const guidRegex = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
  return guidRegex.test(guid);
}
