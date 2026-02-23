/**
 * All game constants in one place — easy to balance
 */

export const CONFIG = {
  COLORS: {
    BACKGROUND: '#1e1e2e',
    GRID: '#2a2a3e',
    TEXT: '#cdd6f4',
    TEXT_LIGHT: '#6c7086',
    PLAYER_SKIN: '#fcd9b6',
    PLAYER_SKIN_DARK: '#c4956a',
    PLAYER_HAIR: '#4a3728',
    PLAYER_HEADPHONES: '#cdd6f4',
    PLAYER_GLASSES: '#89b4fa',
    HUD_BG: 'rgba(49,50,68,0.85)',
    HUD_BORDER: '#45475a',
    HP_FULL: '#a6e3a1',
    HP_LOW: '#f38ba8',
    OVERLAY_BG: 'rgba(17,17,27,0.92)',
    ACCENT: '#89b4fa',
    WARNING: '#f9e2af',
    IDENTITY_GREEN: '#50fa7b',
    IDENTITY_RED: '#ff5555',
    HEAL_PINK: '#f5c2e7',
    REWARD_GOLD: '#f9e2af',
  },

  FONT: "'JetBrains Mono', monospace",

  PLAYER: {
    RADIUS: 18,
    MAX_HP: 8,
    SPEED: 220,
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
    SHOOT_RATE: 1.0,       // seconds between boss shots
    PROJECTILE_SPEED: 380,
    ENRAGE_THRESHOLD: 0.5, // phase 2 at 50% HP
    MINION_INTERVAL: 5,    // seconds between minion spawns (phase 2)
    ENRAGE_SPEED_MULT: 1.5,
    ENRAGE_SHOOT_MULT: 0.6, // faster shooting in phase 2
    SPREAD_ANGLE: 0.5,     // radians for spread shot (wider cone in enrage)
  },

  KNOCKBACK: {
    ENEMY_FORCE: 150,      // pixels pushed back from enemy
    BOSS_FORCE: 250,       // pixels pushed back from boss
    DURATION: 0.15,        // seconds of knockback effect
  },

  SCREEN_SHAKE: {
    HIT_INTENSITY: 6,      // pixels
    HIT_DURATION: 0.15,
    KILL_INTENSITY: 3,
    KILL_DURATION: 0.08,
    BOSS_KILL_INTENSITY: 15,
    BOSS_KILL_DURATION: 0.4,
  },

  HITSTOP: {
    KILL_DURATION: 0.025,       // 25ms freeze on normal kill
    STRONG_KILL_DURATION: 0.045, // 45ms on strong enemy (tier 3)
    BOSS_KILL_DURATION: 0.12,   // 120ms on boss kill
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
