import { CONFIG } from './config.js';
import { Engine } from './game/engine.js';
import { Renderer } from './game/renderer.js';
import { Input } from './game/input.js';
import { Player } from './game/player.js';
import { Enemy } from './game/enemy.js';
import { Boss } from './game/boss.js';
import { Projectile } from './game/projectile.js';
import { PowerUp, POWERUP_TYPES } from './game/powerup.js';
import { UI } from './game/ui.js';
import { LEVELS } from './data/levels.js';
import { circlesCollide } from './utils/collision.js';
import { normalize, subtract, distance } from './utils/vector.js';

// --- Game State ---
const STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  WAVE_ANNOUNCE: 'wave_announce',
  BOSS_WARNING: 'boss_warning',
  GAME_OVER: 'game_over',
  LEVEL_COMPLETE: 'level_complete',
};

let state = STATE.MENU;
let player;
let enemies = [];
let projectiles = [];
let powerups = [];
let boss = null;
let score = 0;
let highScore = parseInt(localStorage.getItem('llm-hunter-highscore') || '0');
let currentLevel = 0;
let currentWave = 0;
let spawnQueue = [];
let spawnTimer = 0;
let announceTimer = 0;
let announceText = '';
let particles = [];

// --- Init ---
const canvas = document.getElementById('game');
const renderer = new Renderer(canvas);
const input = new Input(canvas);
const ui = new UI(renderer);
const engine = new Engine(update, render);

function startGame() {
  player = new Player(renderer.width / 2, renderer.height / 2);
  enemies = [];
  projectiles = [];
  powerups = [];
  boss = null;
  score = 0;
  currentLevel = 0;
  currentWave = 0;
  particles = [];
  startWave();
}

function startWave() {
  const level = LEVELS[currentLevel];
  const totalWaves = level.waves.length + 1; // +1 for boss

  if (currentWave < level.waves.length) {
    // Normal wave
    const wave = level.waves[currentWave];
    spawnQueue = [];
    for (const group of wave.enemies) {
      for (let i = 0; i < group.count; i++) {
        spawnQueue.push({ ...group.type });
      }
    }
    // Shuffle spawn queue
    for (let i = spawnQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [spawnQueue[i], spawnQueue[j]] = [spawnQueue[j], spawnQueue[i]];
    }
    spawnTimer = 0;
    announceText = `Wave ${currentWave + 1}`;
    announceTimer = 2;
    state = STATE.WAVE_ANNOUNCE;
  } else {
    // Boss wave
    announceTimer = 2.5;
    state = STATE.BOSS_WARNING;
  }
}

function spawnBoss() {
  const level = LEVELS[currentLevel];
  const side = Math.floor(Math.random() * 4);
  let x, y;
  const margin = CONFIG.ENEMY.SPAWN_MARGIN;

  switch (side) {
    case 0: x = Math.random() * renderer.width; y = -margin; break;
    case 1: x = renderer.width + margin; y = Math.random() * renderer.height; break;
    case 2: x = Math.random() * renderer.width; y = renderer.height + margin; break;
    case 3: x = -margin; y = Math.random() * renderer.height; break;
  }

  boss = new Boss(x, y, level.boss);
}

function spawnEnemy(data) {
  const margin = CONFIG.ENEMY.SPAWN_MARGIN;
  const side = Math.floor(Math.random() * 4);
  let x, y;

  switch (side) {
    case 0: x = Math.random() * renderer.width; y = -margin; break;
    case 1: x = renderer.width + margin; y = Math.random() * renderer.height; break;
    case 2: x = Math.random() * renderer.width; y = renderer.height + margin; break;
    case 3: x = -margin; y = Math.random() * renderer.height; break;
  }

  enemies.push(new Enemy(x, y, data));
}

function spawnPowerUp(x, y) {
  if (Math.random() > CONFIG.POWERUP.DROP_CHANCE) return;
  const types = Object.keys(POWERUP_TYPES);
  const type = types[Math.floor(Math.random() * types.length)];
  powerups.push(new PowerUp(x, y, type));
}

function findNearestEnemy(from) {
  let nearest = null;
  let minDist = Infinity;

  const targets = boss && boss.alive ? [...enemies, boss] : enemies;

  for (const e of targets) {
    if (!e.alive) continue;
    const d = distance(from, e);
    if (d < minDist) {
      minDist = d;
      nearest = e;
    }
  }
  return nearest;
}

function addParticle(x, y, color, count = 5) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 150;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.3 + Math.random() * 0.3,
      maxLife: 0.3 + Math.random() * 0.3,
      color,
      radius: 2 + Math.random() * 3,
    });
  }
}

// --- Update ---
function update(dt) {
  if (state === STATE.MENU) return;

  if (state === STATE.WAVE_ANNOUNCE) {
    announceTimer -= dt;
    if (announceTimer <= 0) state = STATE.PLAYING;
    return;
  }

  if (state === STATE.BOSS_WARNING) {
    announceTimer -= dt;
    if (announceTimer <= 0) {
      spawnBoss();
      state = STATE.PLAYING;
    }
    return;
  }

  if (state === STATE.GAME_OVER || state === STATE.LEVEL_COMPLETE) return;

  // Player
  player.update(dt, input.mouse);

  // Clamp player to screen
  player.x = Math.max(player.radius, Math.min(renderer.width - player.radius, player.x));
  player.y = Math.max(player.radius + 50, Math.min(renderer.height - player.radius, player.y));

  // Auto-shoot
  if (player.canShoot()) {
    const target = findNearestEnemy(player);
    if (target) {
      const dir = normalize(subtract(target, player));
      const symbol = player.nextSymbol();
      projectiles.push(new Projectile(
        player.x, player.y,
        dir.x, dir.y,
        player.damage, symbol
      ));
      player.shoot();
    }
  }

  // Spawn enemies from queue
  if (spawnQueue.length > 0 && !boss) {
    const level = LEVELS[currentLevel];
    const wave = level.waves[currentWave];
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnEnemy(spawnQueue.shift());
      spawnTimer = wave.spawnInterval;
    }
  }

  // Update enemies
  for (const e of enemies) {
    e.update(dt, player);
  }

  // Update boss
  if (boss && boss.alive) {
    boss.update(dt, player);

    // Boss projectiles hit player
    for (const bp of boss.projectiles) {
      if (circlesCollide(bp, player)) {
        if (player.takeDamage(1)) {
          addParticle(player.x, player.y, '#ef4444', 8);
        }
        bp.alive = false;
      }
    }
  }

  // Update projectiles
  for (const p of projectiles) {
    p.update(dt);
  }

  // Update powerups
  for (const pu of powerups) {
    pu.update(dt);
  }

  // Update particles
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
  }
  particles = particles.filter(p => p.life > 0);

  // --- Collisions ---

  // Projectiles vs enemies
  for (const p of projectiles) {
    if (!p.alive) continue;

    // Check regular enemies
    for (const e of enemies) {
      if (!e.alive) continue;
      if (circlesCollide(p, e)) {
        e.takeDamage(p.damage);
        p.alive = false;
        addParticle(p.x, p.y, '#61afef', 3);
        if (!e.alive) {
          score += e.points;
          addParticle(e.x, e.y, e.color, 8);
          spawnPowerUp(e.x, e.y);
        }
        break;
      }
    }

    // Check boss
    if (p.alive && boss && boss.alive) {
      if (circlesCollide(p, boss)) {
        boss.takeDamage(p.damage);
        p.alive = false;
        addParticle(p.x, p.y, '#61afef', 3);
        if (!boss.alive) {
          score += boss.points;
          addParticle(boss.x, boss.y, boss.color, 20);
        }
      }
    }
  }

  // Enemies vs player
  for (const e of enemies) {
    if (!e.alive) continue;
    if (circlesCollide(e, player)) {
      if (player.takeDamage(1)) {
        addParticle(player.x, player.y, '#ef4444', 8);
      }
      e.alive = false;
      addParticle(e.x, e.y, e.color, 5);
    }
  }

  // Boss body vs player
  if (boss && boss.alive && circlesCollide(boss, player)) {
    if (player.takeDamage(1)) {
      addParticle(player.x, player.y, '#ef4444', 8);
    }
  }

  // Player vs powerups
  for (const pu of powerups) {
    if (!pu.alive) continue;
    if (circlesCollide(pu, player)) {
      pu.alive = false;
      applyPowerUp(pu.type);
      addParticle(pu.x, pu.y, pu.data.color, 8);
    }
  }

  // Clean up dead entities
  enemies = enemies.filter(e => e.alive);
  projectiles = projectiles.filter(p => p.alive);
  powerups = powerups.filter(p => p.alive);

  // Check player death
  if (!player.alive) {
    state = STATE.GAME_OVER;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('llm-hunter-highscore', String(highScore));
    }
    return;
  }

  // Check wave/level completion
  if (boss && !boss.alive) {
    // Level complete!
    state = STATE.LEVEL_COMPLETE;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('llm-hunter-highscore', String(highScore));
    }
    return;
  }

  if (!boss && spawnQueue.length === 0 && enemies.length === 0) {
    // Wave complete, next wave
    currentWave++;
    startWave();
  }
}

function applyPowerUp(type) {
  switch (type) {
    case 'COFFEE':
      player.applySpeedBoost(POWERUP_TYPES.COFFEE.duration);
      break;
    case 'STACKOVERFLOW':
      // Damage all enemies on screen
      for (const e of enemies) {
        e.takeDamage(2);
        if (!e.alive) {
          score += e.points;
          addParticle(e.x, e.y, e.color, 5);
        }
      }
      if (boss && boss.alive) {
        boss.takeDamage(5);
        if (!boss.alive) {
          score += boss.points;
          addParticle(boss.x, boss.y, boss.color, 15);
        }
      }
      break;
    case 'GIT_REVERT':
      player.heal(1);
      break;
  }
}

// --- Render ---
function render() {
  renderer.clear();

  if (state === STATE.MENU) {
    ui.drawStartScreen();
    return;
  }

  // Powerups (under everything)
  for (const pu of powerups) {
    pu.render(renderer.ctx);
  }

  // Enemies
  for (const e of enemies) {
    e.render(renderer.ctx);
  }

  // Boss
  if (boss && boss.alive) {
    boss.render(renderer.ctx);
  }

  // Projectiles
  for (const p of projectiles) {
    p.render(renderer.ctx);
  }

  // Particles
  for (const p of particles) {
    renderer.ctx.save();
    renderer.ctx.globalAlpha = p.life / p.maxLife;
    renderer.ctx.fillStyle = p.color;
    renderer.ctx.beginPath();
    renderer.ctx.arc(p.x, p.y, p.radius * (p.life / p.maxLife), 0, Math.PI * 2);
    renderer.ctx.fill();
    renderer.ctx.restore();
  }

  // Player
  if (player) {
    player.render(renderer.ctx);
  }

  // HUD
  if (player && state !== STATE.MENU) {
    const level = LEVELS[currentLevel];
    const totalWaves = level.waves.length + 1;
    ui.drawHUD(player, score, currentWave + 1, totalWaves);
  }

  // Overlays
  if (state === STATE.WAVE_ANNOUNCE) {
    const alpha = Math.min(1, announceTimer);
    ui.drawWaveAnnouncement(announceText, alpha);
  }

  if (state === STATE.BOSS_WARNING) {
    const alpha = Math.min(1, announceTimer / 2);
    ui.drawBossWarning(alpha);
  }

  if (state === STATE.GAME_OVER) {
    ui.drawGameOver(score, highScore);
  }

  if (state === STATE.LEVEL_COMPLETE) {
    ui.drawLevelComplete(score);
  }
}

// --- Click handler ---
function handleClick() {
  if (state === STATE.MENU) {
    startGame();
  } else if (state === STATE.GAME_OVER || state === STATE.LEVEL_COMPLETE) {
    state = STATE.MENU;
  }
}

// Start
engine.start();

// Check clicks every frame via input system
setInterval(() => {
  if (input.consumeClick()) {
    handleClick();
  }
}, 16);
