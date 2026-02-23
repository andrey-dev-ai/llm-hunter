/**
 * Enemy definitions per wave
 * behavior: 'chase' (default) | 'orbit' | 'dash'
 */

export const ENEMY_TYPES = {
  // Wave 1 — No-code tools (chase) — roundRect (app icons)
  WIX:         { name: 'Wix',         label: 'Wix',    hp: 1, speed: 85,  points: 10, radius: 16, color: '#0c6efc', behavior: 'chase', shape: 'roundRect' },
  SQUARESPACE: { name: 'Squarespace', label: 'Sqsp',   hp: 1, speed: 75,  points: 10, radius: 16, color: '#4a4a5e', behavior: 'chase', shape: 'roundRect' },
  WORDPRESS:   { name: 'WordPress',   label: 'WP',     hp: 1, speed: 70,  points: 10, radius: 18, color: '#21759b', behavior: 'chase', shape: 'roundRect' },
  WEBFLOW:     { name: 'Webflow',     label: 'Wflw',   hp: 1, speed: 80,  points: 10, radius: 15, color: '#4353ff', behavior: 'chase', shape: 'roundRect' },
  BUBBLE:      { name: 'Bubble',      label: 'Bbbl',   hp: 1, speed: 75,  points: 10, radius: 16, color: '#2d6e2d', behavior: 'chase', shape: 'roundRect' },

  // Wave 2 — Automation tools (orbit) — hexagon (workflow nodes)
  ZAPIER:      { name: 'Zapier',      label: 'Zap',    hp: 2, speed: 155, points: 25, radius: 20, color: '#ff4a00', behavior: 'orbit', shape: 'hexagon' },
  MAKE:        { name: 'Make',        label: 'Make',   hp: 2, speed: 140, points: 25, radius: 20, color: '#6d00cc', behavior: 'orbit', shape: 'hexagon' },
  N8N:         { name: 'n8n',         label: 'n8n',    hp: 2, speed: 150, points: 25, radius: 18, color: '#ea4b71', behavior: 'orbit', shape: 'hexagon' },
  AIRTABLE:    { name: 'Airtable',    label: 'Air',    hp: 2, speed: 130, points: 25, radius: 20, color: '#18bfff', behavior: 'orbit', shape: 'hexagon' },

  // Wave 3 — AI coding tools (dash) — octagon (danger signs)
  CURSOR:      { name: 'Cursor',      label: 'Crsr',   hp: 3, speed: 155, points: 50, radius: 22, color: '#585b8a', behavior: 'dash', shape: 'octagon' },
  COPILOT:     { name: 'Copilot',     label: 'Cplt',   hp: 3, speed: 145, points: 50, radius: 22, color: '#1f6feb', behavior: 'dash', shape: 'octagon' },
  BOLT:        { name: 'Bolt',        label: 'Bolt',   hp: 3, speed: 170, points: 50, radius: 20, color: '#7c3aed', behavior: 'dash', shape: 'octagon' },
  V0:          { name: 'v0',          label: 'v0',     hp: 3, speed: 160, points: 50, radius: 20, color: '#45475a', behavior: 'dash', shape: 'octagon' },
  REPLIT:      { name: 'Replit',      label: 'Repl',   hp: 3, speed: 135, points: 50, radius: 22, color: '#f26207', behavior: 'dash', shape: 'octagon' },
};

// Boss minion type (small tokens spawned during fight)
export const MINION_TYPES = {
  TOKEN: { name: 'Token', label: 'tkn', hp: 1, speed: 135, points: 5, radius: 12, color: '#10a37f', behavior: 'chase' },
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
