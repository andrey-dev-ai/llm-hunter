import { ENEMY_TYPES, BOSS_TYPES } from './enemies.js';

/**
 * Level definitions
 * Each level has waves of enemies, ending with a boss
 */

export const LEVELS = [
  {
    name: 'No-Code Invasion',
    subtitle: 'They said you don\'t need to code...',
    waves: [
      {
        enemies: [
          { type: ENEMY_TYPES.WIX, count: 5 },
          { type: ENEMY_TYPES.SQUARESPACE, count: 4 },
          { type: ENEMY_TYPES.WORDPRESS, count: 5 },
          { type: ENEMY_TYPES.WEBFLOW, count: 3 },
          { type: ENEMY_TYPES.BUBBLE, count: 3 },
        ],
        spawnInterval: 1.8,
      },
      {
        enemies: [
          { type: ENEMY_TYPES.ZAPIER, count: 5 },
          { type: ENEMY_TYPES.MAKE, count: 4 },
          { type: ENEMY_TYPES.N8N, count: 4 },
          { type: ENEMY_TYPES.AIRTABLE, count: 3 },
        ],
        spawnInterval: 1.4,
      },
      {
        enemies: [
          { type: ENEMY_TYPES.CURSOR, count: 4 },
          { type: ENEMY_TYPES.COPILOT, count: 4 },
          { type: ENEMY_TYPES.BOLT, count: 3 },
          { type: ENEMY_TYPES.V0, count: 3 },
          { type: ENEMY_TYPES.REPLIT, count: 3 },
        ],
        spawnInterval: 1.0,
      },
    ],
    boss: BOSS_TYPES.CHATGPT,
  },
];
