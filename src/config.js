/**
 * All game constants in one place — easy to balance
 */

export const CONFIG = {
  COLORS: {
    BACKGROUND: '#f5f5f5',
    GRID: '#e8e8e8',
    TEXT: '#333333',
    TEXT_LIGHT: '#888888',
    PLAYER_SKIN: '#fcd9b6',
    PLAYER_SKIN_DARK: '#c4956a',
    PLAYER_HAIR: '#4a3728',
    PLAYER_HEADPHONES: '#333333',
    PLAYER_GLASSES: '#1a1a2e',
    HUD_BG: 'rgba(255,255,255,0.9)',
    HP_FULL: '#4ade80',
    HP_LOW: '#ef4444',
  },

  PLAYER: {
    RADIUS: 18,
    MAX_HP: 5,
    SPEED: 400,
    SHOOT_RATE: 0.3,      // seconds between shots
    DAMAGE: 1,
    INVULNERABLE_TIME: 1,  // seconds after hit
  },

  PROJECTILE: {
    SPEED: 500,
    RADIUS: 8,
    FONT_SIZE: 14,
    LIFETIME: 3,           // seconds before despawn
  },

  ENEMY: {
    BASE_RADIUS: 20,
    SPAWN_MARGIN: 80,      // pixels off screen
  },

  BOSS: {
    SHOOT_RATE: 1.5,       // seconds between boss shots
    PROJECTILE_SPEED: 200,
  },

  POWERUP: {
    DROP_CHANCE: 0.18,     // 18% chance from any enemy
    LIFETIME: 8,           // seconds before disappearing
  },

  WAVE: {
    SPAWN_INTERVAL: 1.5,   // base seconds between spawns
    ENEMIES_BETWEEN_WAVES: 2, // seconds of pause
  },

  GAME: {
    DEATH_MESSAGE: 'Your code has been deprecated',
    TITLE: 'LLM Hunter',
    SUBTITLE: 'Vibe Coder vs AI Tools',
    START_TEXT: 'Click to start',
  },
};
