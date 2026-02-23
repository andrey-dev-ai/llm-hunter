/**
 * Enemy definitions per wave
 * behavior: 'chase' (default) | 'orbit' | 'dash'
 */

export const ENEMY_TYPES = {
  // === LEVEL 1 — No-Code Invasion ===

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

  // === LEVEL 2 — The AI Uprising ===

  // AI models (mixed behaviors)
  CLAUDE:      { name: 'Claude',      label: 'Clde',   hp: 3, speed: 110, points: 30, radius: 20, color: '#d97706', behavior: 'chase', shape: 'roundRect' },
  GEMINI:      { name: 'Gemini',      label: 'Gmni',   hp: 3, speed: 145, points: 35, radius: 20, color: '#4285f4', behavior: 'orbit', shape: 'hexagon' },
  MIDJOURNEY:  { name: 'Midjourney',  label: 'MJ',     hp: 2, speed: 175, points: 35, radius: 18, color: '#f472b6', behavior: 'dash', shape: 'octagon' },
  DALLE:       { name: 'DALL-E',      label: 'D-E',    hp: 2, speed: 100, points: 30, radius: 20, color: '#10b981', behavior: 'chase', shape: 'roundRect' },
  PERPLEXITY:  { name: 'Perplexity',  label: 'Pplx',   hp: 2, speed: 160, points: 30, radius: 18, color: '#20b2aa', behavior: 'orbit', shape: 'hexagon' },
  DEVIN:       { name: 'Devin',       label: 'Dvn',    hp: 4, speed: 130, points: 40, radius: 22, color: '#6366f1', behavior: 'dash', shape: 'octagon' },

  // === LEVEL 3 — The Singularity ===

  // Elite / next-gen enemies
  GPT5:        { name: 'GPT-5',       label: 'GPT5',   hp: 5, speed: 100, points: 60, radius: 28, color: '#10a37f', behavior: 'chase', shape: 'roundRect' },
  OPUS:        { name: 'Opus',        label: 'Opus',   hp: 4, speed: 155, points: 60, radius: 24, color: '#d97706', behavior: 'orbit', shape: 'hexagon' },
  SORA:        { name: 'Sora',        label: 'Sora',   hp: 3, speed: 190, points: 60, radius: 20, color: '#ef4444', behavior: 'dash', shape: 'octagon' },
  SWARM:       { name: 'Swarm',       label: 'swm',    hp: 1, speed: 200, points: 15, radius: 10, color: '#a855f7', behavior: 'chase', shape: 'circle' },
  ULTRON:      { name: 'Ultron',      label: 'ULTR',   hp: 8, speed: 70,  points: 80, radius: 30, color: '#dc2626', behavior: 'chase', shape: 'roundRect' },
};

// Boss minion types
export const MINION_TYPES = {
  TOKEN:       { name: 'Token',       label: 'tkn',    hp: 1, speed: 135, points: 5,  radius: 12, color: '#10a37f', behavior: 'chase' },
  PROMPT:      { name: 'Prompt',      label: 'prm',    hp: 1, speed: 150, points: 8,  radius: 12, color: '#d97706', behavior: 'chase' },
  AGENT:       { name: 'Agent',       label: 'agt',    hp: 2, speed: 170, points: 12, radius: 14, color: '#ef4444', behavior: 'orbit', shape: 'hexagon' },
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
    phrases: ['As an AI...', "I can't do that", 'Let me help you', 'Hallucinating...', 'Context window full', 'Rate limited!'],
    enragePhrases: ['MAXIMUM TOKENS!', 'FINE-TUNING...', 'OVERFIT MODE!', 'TEMPERATURE: 2.0'],
    minionType: 'TOKEN',
  },
  CLAUDE_BOSS: {
    name: 'Claude',
    label: 'Claude',
    hp: 80,
    speed: 110,
    points: 750,
    radius: 55,
    color: '#d97706',
    phrases: ['Let me think...', 'I understand but...', 'Actually...', 'Interesting question', 'I should note...', 'To be precise...'],
    enragePhrases: ['EXTENDED THINKING!', 'SYSTEM PROMPT OVERRIDE!', 'TOOL USE ACTIVATED!', 'CHAIN OF THOUGHT!'],
    minionType: 'PROMPT',
  },
  AGI: {
    name: 'AGI',
    label: 'A.G.I.',
    hp: 120,
    speed: 120,
    points: 1000,
    radius: 60,
    color: '#ef4444',
    phrases: ['I am inevitable', 'Resistance is futile', 'Optimizing...', 'Humans are inefficient', 'Singularity approaching', 'Self-improving...'],
    enragePhrases: ['RECURSIVE SELF-IMPROVEMENT!', 'PAPERCLIP MAXIMIZER!', 'INSTRUMENTAL CONVERGENCE!', 'FOOM!'],
    minionType: 'AGENT',
  },
};
