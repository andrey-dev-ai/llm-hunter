import { ENEMY_TYPES, BOSS_TYPES } from './enemies.js';

/**
 * Level definitions
 * Each level has waves of enemies, ending with a boss
 */

export const LEVELS = [
  // === LEVEL 1 — No-Code Invasion ===
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
          { type: ENEMY_TYPES.WEBFLOW, count: 3 },
          { type: ENEMY_TYPES.WIX, count: 3 },
        ],
        spawnInterval: 0.5,
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

  // === LEVEL 2 — The AI Uprising ===
  {
    name: 'The AI Uprising',
    subtitle: 'The models are getting smarter...',
    waves: [
      {
        enemies: [
          { type: ENEMY_TYPES.CLAUDE, count: 6 },
          { type: ENEMY_TYPES.DALLE, count: 5 },
          { type: ENEMY_TYPES.PERPLEXITY, count: 4 },
        ],
        spawnInterval: 0.55,
      },
      {
        enemies: [
          { type: ENEMY_TYPES.GEMINI, count: 6 },
          { type: ENEMY_TYPES.MIDJOURNEY, count: 5 },
          { type: ENEMY_TYPES.CLAUDE, count: 4 },
        ],
        spawnInterval: 0.5,
      },
      {
        enemies: [
          { type: ENEMY_TYPES.DEVIN, count: 5 },
          { type: ENEMY_TYPES.PERPLEXITY, count: 5 },
          { type: ENEMY_TYPES.GEMINI, count: 4 },
          { type: ENEMY_TYPES.DALLE, count: 3 },
        ],
        spawnInterval: 0.45,
      },
      {
        enemies: [
          { type: ENEMY_TYPES.MIDJOURNEY, count: 6 },
          { type: ENEMY_TYPES.DEVIN, count: 4 },
          { type: ENEMY_TYPES.CLAUDE, count: 4 },
          { type: ENEMY_TYPES.GEMINI, count: 3 },
        ],
        spawnInterval: 0.4,
      },
    ],
    boss: BOSS_TYPES.CLAUDE_BOSS,
  },

  // === LEVEL 3 — The Singularity ===
  {
    name: 'The Singularity',
    subtitle: 'There is no going back...',
    waves: [
      {
        enemies: [
          { type: ENEMY_TYPES.GPT5, count: 4 },
          { type: ENEMY_TYPES.OPUS, count: 4 },
          { type: ENEMY_TYPES.SWARM, count: 10 },
        ],
        spawnInterval: 0.5,
      },
      {
        enemies: [
          { type: ENEMY_TYPES.SORA, count: 6 },
          { type: ENEMY_TYPES.OPUS, count: 5 },
          { type: ENEMY_TYPES.GPT5, count: 3 },
        ],
        spawnInterval: 0.45,
      },
      {
        enemies: [
          { type: ENEMY_TYPES.SWARM, count: 15 },
          { type: ENEMY_TYPES.ULTRON, count: 3 },
          { type: ENEMY_TYPES.SORA, count: 5 },
        ],
        spawnInterval: 0.4,
      },
      {
        enemies: [
          { type: ENEMY_TYPES.GPT5, count: 5 },
          { type: ENEMY_TYPES.OPUS, count: 5 },
          { type: ENEMY_TYPES.SORA, count: 5 },
          { type: ENEMY_TYPES.DEVIN, count: 4 },
        ],
        spawnInterval: 0.35,
      },
      {
        enemies: [
          { type: ENEMY_TYPES.ULTRON, count: 4 },
          { type: ENEMY_TYPES.SORA, count: 6 },
          { type: ENEMY_TYPES.SWARM, count: 20 },
          { type: ENEMY_TYPES.OPUS, count: 4 },
        ],
        spawnInterval: 0.3,
      },
    ],
    boss: BOSS_TYPES.AGI,
  },
];
