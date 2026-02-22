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
          { type: ENEMY_TYPES.SQUARESPACE, count: 5 },
          { type: ENEMY_TYPES.WORDPRESS, count: 5 },
          { type: ENEMY_TYPES.WEBFLOW, count: 3 },
          { type: ENEMY_TYPES.BUBBLE, count: 2 },
        ],
        spawnInterval: 0.6,
      },
      {
        enemies: [
          { type: ENEMY_TYPES.ZAPIER, count: 7 },
          { type: ENEMY_TYPES.MAKE, count: 6 },
          { type: ENEMY_TYPES.N8N, count: 6 },
          { type: ENEMY_TYPES.AIRTABLE, count: 5 },
        ],
        spawnInterval: 0.7,
      },
      {
        enemies: [
          { type: ENEMY_TYPES.CURSOR, count: 7 },
          { type: ENEMY_TYPES.COPILOT, count: 6 },
          { type: ENEMY_TYPES.BOLT, count: 5 },
          { type: ENEMY_TYPES.V0, count: 5 },
          { type: ENEMY_TYPES.REPLIT, count: 5 },
        ],
        spawnInterval: 0.45,
      },
    ],
    boss: BOSS_TYPES.CHATGPT,
  },
];
