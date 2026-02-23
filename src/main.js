import { CONFIG } from './config.js';
import { Engine } from './game/engine.js';
import { Renderer } from './game/renderer.js';
import { Input } from './game/input.js';
import { Audio } from './game/audio.js';
import { Player } from './game/player.js';
import { Enemy } from './game/enemy.js';
import { Boss } from './game/boss.js';
import { Projectile } from './game/projectile.js';
import { PowerUp, POWERUP_TYPES, randomPowerUpType } from './game/powerup.js';
import { UI } from './game/ui.js';
import { EffectsManager } from './game/effects.js';
import { resolveCollisions } from './game/collisions.js';
import { LEVELS } from './data/levels.js';
import { pickRandomUpgrades } from './data/upgrades.js';
import { distance, normalize, subtract } from './utils/vector.js';

// --- Game State ---
const STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  WAVE_ANNOUNCE: 'wave_announce',
  BOSS_WARNING: 'boss_warning',
  UPGRADE_SELECT: 'upgrade_select',
  GAME_OVER: 'game_over',
  LEVEL_COMPLETE: 'level_complete',
  VICTORY: 'victory',
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
let hitstopTimer = 0;
let bossWasEnraged = false;
let waveEnemyTotal = 0;
let upgradeChoices = [];
let upgradeHover = -1;
let overlayFade = 0;

// --- Init ---
const canvas = document.getElementById('game');
const renderer = new Renderer(canvas);
const input = new Input(canvas);
const audio = new Audio();
const ui = new UI(renderer);
const fx = new EffectsManager();
const engine = new Engine(update, render);

// Collision callbacks
const collisionCallbacks = {
  onAudio: (name) => audio.play(name),
  onScore: (pts) => { score += pts; },
  onShake: (i, d) => renderer.shake(i, d),
  onHitstop: (d) => { hitstopTimer = d; },
  onSpawnPowerUp: (x, y) => spawnPowerUp(x, y),
  onApplyPowerUp: (type) => applyPowerUp(type),
};

function startGame() {
  player = new Player(renderer.width / 2, renderer.height / 2);
  enemies = [];
  projectiles = [];
  powerups = [];
  boss = null;
  score = 0;
  currentLevel = 0;
  currentWave = 0;
  hitstopTimer = 0;
  bossWasEnraged = false;
  fx.reset();
  startWave();
}

function startWave() {
  const level = LEVELS[currentLevel];

  if (currentWave < level.waves.length) {
    const wave = level.waves[currentWave];
    spawnQueue = [];
    for (const group of wave.enemies) {
      for (let i = 0; i < group.count; i++) {
        spawnQueue.push({ ...group.type });
      }
    }
    waveEnemyTotal = spawnQueue.length;
    // Shuffle spawn queue
    for (let i = spawnQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [spawnQueue[i], spawnQueue[j]] = [spawnQueue[j], spawnQueue[i]];
    }
    spawnTimer = 0;
    announceText = currentWave === 0
      ? `${level.name} — Wave 1`
      : `Wave ${currentWave + 1}`;
    announceTimer = currentWave === 0 ? 2.0 : 1.2;
    state = STATE.PLAYING;
  } else {
    waveEnemyTotal = 0;
    announceTimer = 1.5;
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
  audio.play('boss');
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

  const ix = Math.max(8, Math.min(renderer.width - 8, x));
  const iy = Math.max(58, Math.min(renderer.height - 8, y));
  fx.addSpawnIndicator(ix, iy, data.color || '#fff');

  // Difficulty scaling: HP +15% per wave, speed +5% per wave
  const scaledData = { ...data };
  if (currentWave > 0) {
    scaledData.hp = Math.ceil(data.hp * (1 + currentWave * 0.15));
    scaledData.speed = Math.round(data.speed * (1 + currentWave * 0.05));
  }
  enemies.push(new Enemy(x, y, scaledData));
}

function spawnPowerUp(x, y) {
  if (Math.random() > CONFIG.POWERUP.DROP_CHANCE) return;
  const type = randomPowerUpType();
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

function getUpgradeCardIndex(mouse) {
  const w = renderer.width;
  const h = renderer.height;
  const cardW = Math.min(220, (w - 80) / 3 - 30);
  const cardH = 240;
  const gap = 30;
  const totalW = upgradeChoices.length * cardW + (upgradeChoices.length - 1) * gap;
  const startX = (w - totalW) / 2;
  const startY = h / 2 - cardH / 2 + 10;

  for (let i = 0; i < upgradeChoices.length; i++) {
    const cx = startX + i * (cardW + gap);
    if (mouse.x >= cx && mouse.x <= cx + cardW &&
        mouse.y >= startY && mouse.y <= startY + cardH) {
      return i;
    }
  }
  return -1;
}

function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('llm-hunter-highscore', String(highScore));
  }
}

// --- Update ---
function update(dt) {
  renderer.updateShake(dt);

  // Process input every tick
  if (input.consumeClick()) handleClick();
  const key = input.consumeKey();
  if (key && state === STATE.UPGRADE_SELECT) {
    const idx = key - 1;
    if (idx >= 0 && idx < upgradeChoices.length) {
      applyUpgrade(upgradeChoices[idx]);
      audio.play('powerup');
      startWave();
    }
  }

  if (state === STATE.MENU) return;

  // Wave announcement timer (skip for BOSS_WARNING — has its own below)
  if (announceTimer > 0 && state !== STATE.BOSS_WARNING) announceTimer -= dt;

  if (state === STATE.BOSS_WARNING) {
    announceTimer -= dt;
    if (announceTimer <= 0) {
      spawnBoss();
      state = STATE.PLAYING;
    }
    return;
  }

  if (state === STATE.UPGRADE_SELECT) {
    upgradeHover = getUpgradeCardIndex(input.mouse);
    overlayFade = Math.min(overlayFade + dt * 4, 1);
    return;
  }

  if (state === STATE.GAME_OVER || state === STATE.LEVEL_COMPLETE || state === STATE.VICTORY) {
    overlayFade = Math.min(overlayFade + dt * 4, 1);
    return;
  }

  // Hitstop — freeze gameplay but keep rendering
  if (hitstopTimer > 0) {
    hitstopTimer -= dt;
    fx.updateDeathAnimsOnly(dt);
    return;
  }

  // Player
  player.update(dt, input.mouse);
  player.x = Math.max(player.radius, Math.min(renderer.width - player.radius, player.x));
  player.y = Math.max(player.radius + 50, Math.min(renderer.height - player.radius, player.y));

  // Auto-shoot
  if (player.canShoot()) {
    const target = findNearestEnemy(player);
    if (target) {
      const dir = normalize(subtract(target, player));
      const baseAngle = Math.atan2(dir.y, dir.x);
      const shots = player.multiShot || 1;
      const spreadAngle = shots > 1 ? 0.15 : 0;

      for (let s = 0; s < shots; s++) {
        const offset = (s - (shots - 1) / 2) * spreadAngle;
        const angle = baseAngle + offset;
        const symbol = player.nextSymbol();
        const proj = new Projectile(
          player.x, player.y,
          Math.cos(angle), Math.sin(angle),
          player.damage, symbol
        );
        if (player.projectileSpeedMult !== 1) {
          proj.speed *= player.projectileSpeedMult;
        }
        proj.pierce = player.pierce;
        proj.bounces = player.bounces;
        projectiles.push(proj);
      }
      player.shoot();
      audio.play('shoot');
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

  // Update entities
  for (const e of enemies) e.update(dt, player);
  for (const p of projectiles) p.update(dt);
  for (const pu of powerups) pu.update(dt);

  // Update boss
  if (boss && boss.alive) {
    boss.update(dt, player);
    boss.x = Math.max(boss.radius, Math.min(renderer.width - boss.radius, boss.x));
    boss.y = Math.max(boss.radius + 50, Math.min(renderer.height - boss.radius, boss.y));

    if (boss.enraged && !bossWasEnraged) {
      bossWasEnraged = true;
      audio.play('enrage');
      fx.addFloatingText(boss.x, boss.y - boss.radius - 20, 'ENRAGED!', '#f38ba8', 20);
      renderer.shake(CONFIG.SCREEN_SHAKE.BOSS_KILL_INTENSITY * 0.6, CONFIG.SCREEN_SHAKE.BOSS_KILL_DURATION * 0.5);
      hitstopTimer = 0.15;
    }

    while (boss.pendingMinions.length > 0) {
      spawnEnemy(boss.pendingMinions.shift());
    }
  }

  // Effects
  fx.update(dt);

  // Collisions
  resolveCollisions({ projectiles, enemies, boss, player, powerups }, fx, collisionCallbacks);

  // Check player death
  if (!player.alive) {
    state = STATE.GAME_OVER;
    overlayFade = 0;
    saveHighScore();
    return;
  }

  // Check wave/level completion
  if (boss && !boss.alive) {
    // Check if there's a next level
    if (currentLevel + 1 < LEVELS.length) {
      state = STATE.LEVEL_COMPLETE;
    } else {
      state = STATE.VICTORY;
    }
    overlayFade = 0;
    saveHighScore();
    return;
  }

  if (!boss && spawnQueue.length === 0 && enemies.length === 0) {
    player.stats.wavesCleared++;
    currentWave++;
    if (currentWave > 0) {
      upgradeChoices = pickRandomUpgrades(3, player);
      upgradeHover = -1;
      overlayFade = 0;
      state = STATE.UPGRADE_SELECT;
    } else {
      startWave();
    }
  }
}

function applyPowerUp(type) {
  switch (type) {
    case 'COFFEE':
      player.applySpeedBoost(POWERUP_TYPES.COFFEE.duration);
      break;
    case 'STACKOVERFLOW':
      for (const e of enemies) {
        e.takeDamage(2);
        if (!e.alive) {
          score += e.points;
          player.stats.kills++;
          fx.addDeathAnim(e.x, e.y, e.radius, e.color, e.label);
          fx.addParticle(e.x, e.y, e.color, 8);
          fx.addScoreText(e.x, e.y - e.radius - 15, e.points);
          audio.play('kill');
        }
      }
      if (boss && boss.alive) {
        boss.takeDamage(5);
        if (!boss.alive) {
          score += boss.points;
          player.stats.kills++;
          player.stats.bossKills++;
          fx.addDeathAnim(boss.x, boss.y, boss.radius, boss.color, boss.label);
          fx.addParticle(boss.x, boss.y, boss.color, 35);
          fx.addFloatingText(boss.x, boss.y - boss.radius - 20, `+${boss.points}`, '#fab387', 28, 1.5, -30);
          audio.play('bossKill');
          fx.addVignette(CONFIG.COLORS.IDENTITY_GREEN, 0.6);
        }
      }
      renderer.shake(CONFIG.SCREEN_SHAKE.HIT_INTENSITY, CONFIG.SCREEN_SHAKE.HIT_DURATION);
      break;
    case 'GIT_REVERT':
      player.heal(1);
      // Heal AoE (npm audit fix upgrade)
      if (player.healAoe) {
        const aoeRadius = 100;
        fx.addParticle(player.x, player.y, CONFIG.COLORS.HEAL_PINK, 15);
        for (const e of enemies) {
          if (!e.alive) continue;
          if (distance(player, e) <= aoeRadius) {
            e.takeDamage(2);
            fx.addParticle(e.x, e.y, CONFIG.COLORS.HEAL_PINK, 4);
            if (!e.alive) {
              score += e.points;
              player.stats.kills++;
              fx.addDeathAnim(e.x, e.y, e.radius, e.color, e.label);
              fx.addScoreText(e.x, e.y - e.radius - 15, e.points);
              audio.play('kill');
            }
          }
        }
      }
      break;
  }
}

// --- Render ---
function render() {
  renderer.clear();

  if (state === STATE.MENU) {
    ui.drawStartScreen(1 / 60);
    return;
  }

  const ctx = renderer.ctx;

  // Under layer: spawn indicators, death anims
  fx.renderUnder(ctx);

  // Powerups
  for (const pu of powerups) pu.render(ctx);

  // Enemies
  for (const e of enemies) e.render(ctx);

  // Boss
  if (boss && boss.alive) boss.render(ctx);

  // Projectiles
  for (const p of projectiles) p.render(ctx);

  // Over layer: particles, floating texts, vignette
  fx.renderOver(ctx, renderer);

  // Player
  if (player) player.render(ctx);

  // HUD
  if (player && state !== STATE.MENU) {
    const level = LEVELS[currentLevel];
    const totalWaves = level.waves.length + 1;
    let waveProgress;
    if (boss) {
      waveProgress = boss.alive ? (1 - boss.hp / boss.maxHp) : 1;
    } else if (state === STATE.BOSS_WARNING) {
      waveProgress = 1;
    } else if (waveEnemyTotal > 0) {
      const remaining = spawnQueue.length + enemies.length;
      waveProgress = 1 - remaining / waveEnemyTotal;
    }
    ui.drawHUD(player, score, currentWave + 1, totalWaves, waveProgress);
  }

  // Overlays
  if (announceTimer > 0 && state === STATE.PLAYING) {
    ui.drawWaveAnnouncement(announceText, Math.min(1, announceTimer));
  }

  if (state === STATE.BOSS_WARNING) {
    const level = LEVELS[currentLevel];
    ui.drawBossWarning(Math.min(1, announceTimer / 1.5), level.boss.name);
  }

  if (state === STATE.UPGRADE_SELECT) {
    ctx.save();
    ctx.globalAlpha = overlayFade;
    drawUpgradeScreen();
    ctx.restore();
  }

  if (state === STATE.GAME_OVER) {
    ctx.save();
    ctx.globalAlpha = overlayFade;
    ui.drawGameOver(score, highScore, player ? player.stats : null);
    ctx.restore();
  }

  if (state === STATE.LEVEL_COMPLETE) {
    const level = LEVELS[currentLevel];
    const nextLevel = LEVELS[currentLevel + 1];
    ctx.save();
    ctx.globalAlpha = overlayFade;
    ui.drawLevelComplete(score, player ? player.stats : null, level.name, nextLevel ? nextLevel.name : null);
    ctx.restore();
  }

  if (state === STATE.VICTORY) {
    ctx.save();
    ctx.globalAlpha = overlayFade;
    ui.drawVictoryScreen(score, highScore, player ? player.stats : null);
    ctx.restore();
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, y);
      line = word + ' ';
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, y);
}

function drawUpgradeScreen() {
  const ctx = renderer.ctx;
  const w = renderer.width;
  const h = renderer.height;

  ctx.fillStyle = CONFIG.COLORS.OVERLAY_BG;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.font = `bold 28px ${CONFIG.FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('CHOOSE UPGRADE', w / 2, h / 2 - 150);

  ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
  ctx.font = `14px ${CONFIG.FONT}`;
  ctx.fillText('// pick one to continue', w / 2, h / 2 - 120);

  const cardW = Math.min(220, (w - 80) / 3 - 30);
  const cardH = 240;
  const gap = 30;
  const totalW = upgradeChoices.length * cardW + (upgradeChoices.length - 1) * gap;
  const startX = (w - totalW) / 2;
  const startY = h / 2 - cardH / 2 + 10;

  for (let i = 0; i < upgradeChoices.length; i++) {
    const up = upgradeChoices[i];
    const cx = startX + i * (cardW + gap);
    const hovered = upgradeHover === i;

    if (hovered) {
      ctx.save();
      ctx.shadowColor = CONFIG.COLORS.ACCENT;
      ctx.shadowBlur = 16;
      ctx.fillStyle = 'rgba(69,71,90,0.95)';
      ctx.beginPath();
      ctx.roundRect(cx, startY, cardW, cardH, 8);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = hovered ? 'rgba(69,71,90,0.95)' : 'rgba(49,50,68,0.85)';
    ctx.strokeStyle = hovered ? CONFIG.COLORS.ACCENT : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = hovered ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(cx, startY, cardW, cardH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = hovered ? CONFIG.COLORS.ACCENT : CONFIG.COLORS.TEXT;
    ctx.font = `bold 42px ${CONFIG.FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(up.icon, cx + cardW / 2, startY + 65);

    ctx.fillStyle = CONFIG.COLORS.ACCENT;
    ctx.font = `bold 14px ${CONFIG.FONT}`;
    ctx.fillText(up.name, cx + cardW / 2, startY + 115);

    ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
    ctx.font = `12px ${CONFIG.FONT}`;
    wrapText(ctx, up.description, cx + cardW / 2, startY + 145, cardW - 24, 16);

    ctx.fillStyle = hovered ? CONFIG.COLORS.ACCENT : 'rgba(255,255,255,0.2)';
    ctx.font = `13px ${CONFIG.FONT}`;
    ctx.fillText(`[${i + 1}]`, cx + cardW / 2, startY + cardH - 18);
  }
}

// --- Click handler ---
function applyUpgrade(upgrade) {
  upgrade.apply(player);
  player._upgradeStacks[upgrade.id] = (player._upgradeStacks[upgrade.id] || 0) + 1;
}

function handleClick() {
  audio.init();
  if (state === STATE.MENU) {
    startGame();
  } else if (state === STATE.UPGRADE_SELECT) {
    const idx = getUpgradeCardIndex(input.mouse);
    if (idx >= 0 && idx < upgradeChoices.length) {
      applyUpgrade(upgradeChoices[idx]);
      audio.play('powerup');
      startWave();
    }
  } else if (state === STATE.LEVEL_COMPLETE) {
    // Advance to next level (keep player, score, upgrades)
    currentLevel++;
    currentWave = 0;
    enemies = [];
    projectiles = [];
    powerups = [];
    boss = null;
    bossWasEnraged = false;
    fx.reset();
    hitstopTimer = 0;
    startWave();
  } else if (state === STATE.GAME_OVER || state === STATE.VICTORY) {
    startGame();
  }
}

// Start
engine.start();
