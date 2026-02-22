/**
 * Enemy definitions per wave
 * behavior: 'chase' (default) | 'orbit' | 'dash'
 */

export const ENEMY_TYPES = {
  // Wave 1 — No-code tools (chase — straight at player)
  WIX:         { name: 'Wix',         label: 'Wix',    hp: 1, speed: 85,  points: 10, radius: 16, color: '#0c6efc', behavior: 'chase' },
  SQUARESPACE: { name: 'Squarespace', label: 'Sqsp',   hp: 1, speed: 75,  points: 10, radius: 16, color: '#000000', behavior: 'chase' },
  WORDPRESS:   { name: 'WordPress',   label: 'WP',     hp: 1, speed: 70,  points: 10, radius: 18, color: '#21759b', behavior: 'chase' },
  WEBFLOW:     { name: 'Webflow',     label: 'Wflw',   hp: 1, speed: 80,  points: 10, radius: 15, color: '#4353ff', behavior: 'chase' },
  BUBBLE:      { name: 'Bubble',      label: 'Bbbl',   hp: 1, speed: 75,  points: 10, radius: 16, color: '#0d0d0d', behavior: 'chase' },

  // Wave 2 — Automation tools (orbit — spiral approach)
  ZAPIER:      { name: 'Zapier',      label: 'Zap',    hp: 2, speed: 120, points: 25, radius: 20, color: '#ff4a00', behavior: 'orbit' },
  MAKE:        { name: 'Make',        label: 'Make',   hp: 2, speed: 110, points: 25, radius: 20, color: '#6d00cc', behavior: 'orbit' },
  N8N:         { name: 'n8n',         label: 'n8n',    hp: 2, speed: 115, points: 25, radius: 18, color: '#ea4b71', behavior: 'orbit' },
  AIRTABLE:    { name: 'Airtable',    label: 'Air',    hp: 2, speed: 100, points: 25, radius: 20, color: '#18bfff', behavior: 'orbit' },

  // Wave 3 — AI coding tools (dash — slow creep + burst)
  CURSOR:      { name: 'Cursor',      label: 'Crsr',   hp: 3, speed: 155, points: 50, radius: 22, color: '#000000', behavior: 'dash' },
  COPILOT:     { name: 'Copilot',     label: 'Cplt',   hp: 3, speed: 145, points: 50, radius: 22, color: '#1f6feb', behavior: 'dash' },
  BOLT:        { name: 'Bolt',        label: 'Bolt',   hp: 3, speed: 170, points: 50, radius: 20, color: '#7c3aed', behavior: 'dash' },
  V0:          { name: 'v0',          label: 'v0',     hp: 3, speed: 160, points: 50, radius: 20, color: '#000000', behavior: 'dash' },
  REPLIT:      { name: 'Replit',      label: 'Repl',   hp: 3, speed: 135, points: 50, radius: 22, color: '#f26207', behavior: 'dash' },
};

// Boss minion type (small tokens spawned during fight)
export const MINION_TYPES = {
  TOKEN: { name: 'Token', label: 'tkn', hp: 1, speed: 180, points: 5, radius: 12, color: '#10a37f', behavior: 'chase' },
};

export const BOSS_TYPES = {
  CHATGPT: {
    name: 'ChatGPT',
    label: 'ChatGPT',
    hp: 50,
    speed: 100,
    points: 500,
    radius: 50,
    color: '#10a37f',
  },
};
