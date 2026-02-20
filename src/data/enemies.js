/**
 * Enemy definitions per wave
 */

export const ENEMY_TYPES = {
  // Wave 1 — No-code tools (slow, weak)
  WIX:         { name: 'Wix',         label: 'Wix',    hp: 1, speed: 60,  points: 10, radius: 16, color: '#0c6efc' },
  SQUARESPACE: { name: 'Squarespace', label: 'Sqsp',   hp: 1, speed: 55,  points: 10, radius: 16, color: '#000000' },
  WORDPRESS:   { name: 'WordPress',   label: 'WP',     hp: 1, speed: 50,  points: 10, radius: 18, color: '#21759b' },
  WEBFLOW:     { name: 'Webflow',     label: 'Wflw',   hp: 1, speed: 65,  points: 10, radius: 15, color: '#4353ff' },
  BUBBLE:      { name: 'Bubble',      label: 'Bbbl',   hp: 1, speed: 55,  points: 10, radius: 16, color: '#0d0d0d' },

  // Wave 2 — Automation tools (medium)
  ZAPIER:      { name: 'Zapier',      label: 'Zap',    hp: 2, speed: 80,  points: 25, radius: 20, color: '#ff4a00' },
  MAKE:        { name: 'Make',        label: 'Make',   hp: 2, speed: 75,  points: 25, radius: 20, color: '#6d00cc' },
  N8N:         { name: 'n8n',         label: 'n8n',    hp: 2, speed: 85,  points: 25, radius: 18, color: '#ea4b71' },
  AIRTABLE:    { name: 'Airtable',    label: 'Air',    hp: 2, speed: 70,  points: 25, radius: 20, color: '#18bfff' },

  // Wave 3 — AI coding tools (fast, tough)
  CURSOR:      { name: 'Cursor',      label: 'Crsr',   hp: 3, speed: 100, points: 50, radius: 22, color: '#000000' },
  COPILOT:     { name: 'Copilot',     label: 'Cplt',   hp: 3, speed: 95,  points: 50, radius: 22, color: '#1f6feb' },
  BOLT:        { name: 'Bolt',        label: 'Bolt',   hp: 3, speed: 110, points: 50, radius: 20, color: '#7c3aed' },
  V0:          { name: 'v0',          label: 'v0',     hp: 3, speed: 105, points: 50, radius: 20, color: '#000000' },
  REPLIT:      { name: 'Replit',      label: 'Repl',   hp: 3, speed: 90,  points: 50, radius: 22, color: '#f26207' },
};

export const BOSS_TYPES = {
  CHATGPT: {
    name: 'ChatGPT',
    label: 'ChatGPT',
    hp: 30,
    speed: 40,
    points: 500,
    radius: 50,
    color: '#10a37f',
  },
};
