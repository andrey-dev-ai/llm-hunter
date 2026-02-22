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
import { LEVELS } from './data/levels.js';
import { pickRandomUpgrades } from './data/upgrades.js';
import { circlesCollide } from './utils/collision.js';
import { normalize, subtract, distance } from './utils/vector.js';

// --- Game State ---
const STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  WAVE_ANNOUNCE: 'wave_announce',
  BOSS_WARNING: 'boss_warning',
  UPGRADE_SELECT: 'upgrade_select',
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
let floatingTexts = [];
let deathAnims = [];
let hitstopTimer = 0;
let bossWasEnraged = false;
let waveEnemyTotal = 0;
let upgradeChoices = [];
let upgradeHover = -1;

// --- Init ---
const canvas = document.getElementById('game');
const renderer = new Renderer(canvas);
const input = new Input(canvas);
const audio = new Audio();
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
  floatingTexts = [];
  deathAnims = [];
  hitstopTimer = 0;
  bossWasEnraged = false;
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
    announceText = `Wave ${currentWave + 1}`;
    announceTimer = 1.2;
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

  enemies.push(new Enemy(x, y, data));
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

function addParticle(x, y, color, count = 5) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 150;
    const life = 0.3 + Math.random() * 0.3;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      color,
      radius: 2 + Math.random() * 3,
    });
  }
}

function addFloatingText(x, y, text, color, size = 14) {
  floatingTexts.push({ x, y, text, color, size, life: 1.0, vy: -60 });
}

function addDeathAnim(x, y, radius, color, label) {
  deathAnims.push({ x, y, radius, color, label, age: 0, duration: 0.2 });
}

function getUpgradeCardIndex(mouse) {
  const w = renderer.width;
  const h = renderer.height;
  const cardW = 180;
  const cardH = 200;
  const gap = 30;
  const totalW = upgradeChoices.length * cardW + (upgradeChoices.length - 1) * gap;
  const startX = (w - totalW) / 2;
  const startY = h / 2 - cardH / 2 + 20;

  for (let i = 0; i < upgradeChoices.length; i++) {
    const cx = startX + i * (cardW + gap);
    if (mouse.x >= cx && mouse.x <= cx + cardW &&
        mouse.y >= startY && mouse.y <= startY + cardH) {
      return i;
    }
  }
  return -1;
}

// --- Update ---
function update(dt) {
  renderer.updateShake(dt);

  if (state === STATE.MENU) return;

  // Wave announcement timer (non-blocking — gameplay continues)
  if (announceTimer > 0) announceTimer -= dt;

  if (state === STATE.BOSS_WARNING) {
    announceTimer -= dt;
    if (announceTimer <= 0) {
      spawnBoss();
      state = STATE.PLAYING;
    }
    return;
  }

  if (state === STATE.UPGRADE_SELECT) {
    // Update hover based on mouse position
    upgradeHover = getUpgradeCardIndex(input.mouse);
    return;
  }

  if (state === STATE.GAME_OVER || state === STATE.LEVEL_COMPLETE) return;

  // Hitstop — freeze gameplay but keep rendering
  if (hitstopTimer > 0) {
    hitstopTimer -= dt;
    // Still update death anims during hitstop
    for (let i = deathAnims.length - 1; i >= 0; i--) {
      deathAnims[i].age += dt;
      if (deathAnims[i].age >= deathAnims[i].duration) {
        deathAnims[i] = deathAnims[deathAnims.length - 1];
        deathAnims.pop();
      }
    }
    return;
  }

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
      const baseAngle = Math.atan2(dir.y, dir.x);
      const shots = player.multiShot || 1;
      const spreadAngle = shots > 1 ? 0.15 : 0; // radians between shots

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

  // Update enemies
  for (const e of enemies) {
    e.update(dt, player);
  }

  // Update boss
  if (boss && boss.alive) {
    boss.update(dt, player);

    // Clamp boss to screen
    boss.x = Math.max(boss.radius, Math.min(renderer.width - boss.radius, boss.x));
    boss.y = Math.max(boss.radius + 50, Math.min(renderer.height - boss.radius, boss.y));

    if (boss.enraged && !bossWasEnraged) {
      bossWasEnraged = true;
      audio.play('enrage');
      addFloatingText(boss.x, boss.y - boss.radius - 20, 'ENRAGED!', '#f38ba8', 20);
      renderer.shake(CONFIG.SCREEN_SHAKE.BOSS_KILL_INTENSITY * 0.6, CONFIG.SCREEN_SHAKE.BOSS_KILL_DURATION * 0.5);
      hitstopTimer = 0.15; // dramatic pause on enrage
    }

    while (boss.pendingMinions.length > 0) {
      spawnEnemy(boss.pendingMinions.shift());
    }

    for (const bp of boss.projectiles) {
      if (circlesCollide(bp, player)) {
        if (player.takeDamage(1)) {
          addParticle(player.x, player.y, '#f38ba8', 8);
          audio.play('playerHit');
          player.applyKnockback(bp.x, bp.y, CONFIG.KNOCKBACK.BOSS_FORCE);
          renderer.shake(CONFIG.SCREEN_SHAKE.HIT_INTENSITY, CONFIG.SCREEN_SHAKE.HIT_DURATION);
          addFloatingText(player.x, player.y - 25, '-1', '#f38ba8', 18);
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

  // Update particles (swap-remove instead of .filter for less GC)
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) {
      particles[i] = particles[particles.length - 1];
      particles.pop();
    }
  }

  // Update floating texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.life -= dt;
    if (ft.life <= 0) {
      floatingTexts[i] = floatingTexts[floatingTexts.length - 1];
      floatingTexts.pop();
    }
  }

  // Update death animations
  for (let i = deathAnims.length - 1; i >= 0; i--) {
    deathAnims[i].age += dt;
    if (deathAnims[i].age >= deathAnims[i].duration) {
      deathAnims[i] = deathAnims[deathAnims.length - 1];
      deathAnims.pop();
    }
  }

  // --- Collisions ---

  // Projectiles vs enemies
  for (const p of projectiles) {
    if (!p.alive) continue;

    for (const e of enemies) {
      if (!e.alive) continue;
      if (circlesCollide(p, e)) {
        e.takeDamage(p.damage);
        p.alive = false;
        addParticle(p.x, p.y, '#89b4fa', 3);
        addFloatingText(e.x, e.y - e.radius - 5, `-${p.damage}`, '#89b4fa');
        if (!e.alive) {
          score += e.points;
          player.stats.kills++;
          addDeathAnim(e.x, e.y, e.radius, e.color, e.label);
          addParticle(e.x, e.y, e.color, 8);
          addFloatingText(e.x, e.y - e.radius - 15, `+${e.points}`, '#f9e2af', 12);
          spawnPowerUp(e.x, e.y);
          audio.play('kill');
          renderer.shake(CONFIG.SCREEN_SHAKE.KILL_INTENSITY, CONFIG.SCREEN_SHAKE.KILL_DURATION);
          hitstopTimer = e.maxHp >= 3
            ? CONFIG.HITSTOP.STRONG_KILL_DURATION
            : CONFIG.HITSTOP.KILL_DURATION;
        }
        break;
      }
    }

    if (p.alive && boss && boss.alive) {
      if (circlesCollide(p, boss)) {
        boss.takeDamage(p.damage);
        p.alive = false;
        addParticle(p.x, p.y, '#89b4fa', 3);
        addFloatingText(boss.x, boss.y - boss.radius - 5, `-${p.damage}`, '#89b4fa');
        if (!boss.alive) {
          score += boss.points;
          player.stats.kills++;
          player.stats.bossKills++;
          addDeathAnim(boss.x, boss.y, boss.radius, boss.color, boss.label);
          addParticle(boss.x, boss.y, boss.color, 20);
          addFloatingText(boss.x, boss.y - boss.radius - 20, `+${boss.points}`, '#f9e2af', 22);
          audio.play('bossKill');
          renderer.shake(CONFIG.SCREEN_SHAKE.BOSS_KILL_INTENSITY, CONFIG.SCREEN_SHAKE.BOSS_KILL_DURATION);
          hitstopTimer = CONFIG.HITSTOP.BOSS_KILL_DURATION;
        }
      }
    }
  }

  // Enemies vs player (with knockback) — skip spawning enemies
  for (const e of enemies) {
    if (!e.alive || e.isSpawning) continue;
    if (circlesCollide(e, player)) {
      if (player.takeDamage(1)) {
        addParticle(player.x, player.y, '#f38ba8', 8);
        audio.play('playerHit');
        player.applyKnockback(e.x, e.y, CONFIG.KNOCKBACK.ENEMY_FORCE);
        renderer.shake(CONFIG.SCREEN_SHAKE.HIT_INTENSITY, CONFIG.SCREEN_SHAKE.HIT_DURATION);
        addFloatingText(player.x, player.y - 25, '-1', '#f38ba8', 18);
      }
      e.alive = false;
      addDeathAnim(e.x, e.y, e.radius, e.color, e.label);
      addParticle(e.x, e.y, e.color, 5);
    }
  }

  // Boss body vs player (with knockback)
  if (boss && boss.alive && circlesCollide(boss, player)) {
    if (player.takeDamage(1)) {
      addParticle(player.x, player.y, '#f38ba8', 8);
      audio.play('playerHit');
      player.applyKnockback(boss.x, boss.y, CONFIG.KNOCKBACK.BOSS_FORCE);
      renderer.shake(CONFIG.SCREEN_SHAKE.HIT_INTENSITY, CONFIG.SCREEN_SHAKE.HIT_DURATION);
      addFloatingText(player.x, player.y - 25, '-1', '#f38ba8', 18);
    }
  }

  // Player vs powerups
  for (const pu of powerups) {
    if (!pu.alive) continue;
    if (circlesCollide(pu, player)) {
      pu.alive = false;
      applyPowerUp(pu.type);
      addParticle(pu.x, pu.y, pu.data.color, 8);
      audio.play('powerup');
      player.stats.powerups++;
      addFloatingText(player.x, player.y - 35, pu.data.description, pu.data.color, 14);
    }
  }

  // Clean up dead entities (swap-remove for less GC)
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (!enemies[i].alive) {
      enemies[i] = enemies[enemies.length - 1];
      enemies.pop();
    }
  }
  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (!projectiles[i].alive) {
      projectiles[i] = projectiles[projectiles.length - 1];
      projectiles.pop();
    }
  }
  for (let i = powerups.length - 1; i >= 0; i--) {
    if (!powerups[i].alive) {
      powerups[i] = powerups[powerups.length - 1];
      powerups.pop();
    }
  }

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
    state = STATE.LEVEL_COMPLETE;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('llm-hunter-highscore', String(highScore));
    }
    return;
  }

  if (!boss && spawnQueue.length === 0 && enemies.length === 0) {
    player.stats.wavesCleared++;
    currentWave++;
    if (currentWave > 0) {
      // Show upgrade selection between waves
      upgradeChoices = pickRandomUpgrades(3, player);
      upgradeHover = -1;
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
          addDeathAnim(e.x, e.y, e.radius, e.color, e.label);
          addParticle(e.x, e.y, e.color, 8);
          addFloatingText(e.x, e.y - e.radius - 15, `+${e.points}`, '#f9e2af', 12);
          audio.play('kill');
        }
      }
      if (boss && boss.alive) {
        boss.takeDamage(5);
        if (!boss.alive) {
          score += boss.points;
          player.stats.kills++;
          player.stats.bossKills++;
          addDeathAnim(boss.x, boss.y, boss.radius, boss.color, boss.label);
          addParticle(boss.x, boss.y, boss.color, 20);
          addFloatingText(boss.x, boss.y - boss.radius - 20, `+${boss.points}`, '#f9e2af', 22);
          audio.play('bossKill');
        }
      }
      renderer.shake(CONFIG.SCREEN_SHAKE.HIT_INTENSITY, CONFIG.SCREEN_SHAKE.HIT_DURATION);
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

  // Death animations
  for (const da of deathAnims) {
    const t = da.age / da.duration; // 0→1
    const flashPhase = t < 0.25; // first 25% = white flash
    const scale = 1 + t * 0.6; // expand to 1.6x
    const alpha = 1 - t; // fade out

    renderer.ctx.save();
    renderer.ctx.globalAlpha = alpha;
    renderer.ctx.translate(da.x, da.y);

    // Body
    renderer.ctx.fillStyle = flashPhase ? '#fff' : da.color;
    renderer.ctx.beginPath();
    renderer.ctx.arc(0, 0, da.radius * scale, 0, Math.PI * 2);
    renderer.ctx.fill();

    // Label (fades with body)
    if (!flashPhase) {
      const fontSize = Math.max(9, Math.min(14, da.radius * 0.7));
      renderer.ctx.fillStyle = '#fff';
      renderer.ctx.font = `bold ${fontSize}px ${CONFIG.FONT}`;
      renderer.ctx.textAlign = 'center';
      renderer.ctx.textBaseline = 'middle';
      renderer.ctx.fillText(da.label, 0, 0);
    }

    renderer.ctx.restore();
  }

  // Projectiles
  for (const p of projectiles) {
    p.render(renderer.ctx);
  }

  // Particles
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    renderer.ctx.save();
    renderer.ctx.globalAlpha = alpha;
    renderer.ctx.fillStyle = p.color;
    renderer.ctx.beginPath();
    renderer.ctx.arc(p.x, p.y, p.radius * alpha, 0, Math.PI * 2);
    renderer.ctx.fill();
    renderer.ctx.restore();
  }

  // Floating texts
  for (const ft of floatingTexts) {
    renderer.ctx.save();
    renderer.ctx.globalAlpha = Math.min(1, ft.life * 2);
    renderer.ctx.fillStyle = ft.color;
    renderer.ctx.font = `bold ${ft.size}px ${CONFIG.FONT}`;
    renderer.ctx.textAlign = 'center';
    renderer.ctx.textBaseline = 'middle';
    renderer.ctx.fillText(ft.text, ft.x, ft.y);
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
    let waveProgress;
    if (boss) {
      waveProgress = boss.alive ? (1 - boss.hp / boss.maxHp) : 1;
    } else if (waveEnemyTotal > 0) {
      const remaining = spawnQueue.length + enemies.length;
      waveProgress = 1 - remaining / waveEnemyTotal;
    }
    ui.drawHUD(player, score, currentWave + 1, totalWaves, waveProgress);
  }

  // Overlays
  if (announceTimer > 0 && state === STATE.PLAYING) {
    const alpha = Math.min(1, announceTimer);
    ui.drawWaveAnnouncement(announceText, alpha);
  }

  if (state === STATE.BOSS_WARNING) {
    const alpha = Math.min(1, announceTimer / 1.5);
    ui.drawBossWarning(alpha);
  }

  if (state === STATE.UPGRADE_SELECT) {
    drawUpgradeScreen();
  }

  if (state === STATE.GAME_OVER) {
    ui.drawGameOver(score, highScore, player ? player.stats : null);
  }

  if (state === STATE.LEVEL_COMPLETE) {
    ui.drawLevelComplete(score, player ? player.stats : null);
  }
}

function drawUpgradeScreen() {
  const ctx = renderer.ctx;
  const w = renderer.width;
  const h = renderer.height;

  // Overlay
  ctx.fillStyle = CONFIG.COLORS.OVERLAY_BG;
  ctx.fillRect(0, 0, w, h);

  // Title
  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.font = `bold 28px ${CONFIG.FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('CHOOSE UPGRADE', w / 2, h / 2 - 130);

  ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
  ctx.font = `14px ${CONFIG.FONT}`;
  ctx.fillText('// pick one to continue', w / 2, h / 2 - 100);

  // Cards
  const cardW = 180;
  const cardH = 200;
  const gap = 30;
  const totalW = upgradeChoices.length * cardW + (upgradeChoices.length - 1) * gap;
  const startX = (w - totalW) / 2;
  const startY = h / 2 - cardH / 2 + 20;

  for (let i = 0; i < upgradeChoices.length; i++) {
    const up = upgradeChoices[i];
    const cx = startX + i * (cardW + gap);
    const hovered = upgradeHover === i;

    // Card background
    ctx.fillStyle = hovered ? 'rgba(69,71,90,0.95)' : 'rgba(49,50,68,0.85)';
    ctx.strokeStyle = hovered ? CONFIG.COLORS.ACCENT : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = hovered ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(cx, startY, cardW, cardH, 8);
    ctx.fill();
    ctx.stroke();

    // Icon
    ctx.fillStyle = hovered ? CONFIG.COLORS.ACCENT : CONFIG.COLORS.TEXT;
    ctx.font = `bold 34px ${CONFIG.FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(up.icon, cx + cardW / 2, startY + 55);

    // Name
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = `bold 14px ${CONFIG.FONT}`;
    ctx.fillText(up.name, cx + cardW / 2, startY + 100);

    // Description
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = `14px ${CONFIG.FONT}`;
    ctx.fillText(up.description, cx + cardW / 2, startY + 130);

    // Number hint
    ctx.fillStyle = hovered ? CONFIG.COLORS.ACCENT : 'rgba(255,255,255,0.2)';
    ctx.font = `13px ${CONFIG.FONT}`;
    ctx.fillText(`[${i + 1}]`, cx + cardW / 2, startY + cardH - 15);
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
  } else if (state === STATE.GAME_OVER || state === STATE.LEVEL_COMPLETE) {
    startGame(); // One-click restart
  }
}

// Start
engine.start();

// Use rAF-aligned click polling instead of setInterval
function pollClicks() {
  if (input.consumeClick()) {
    handleClick();
  }
  // Keyboard shortcuts for upgrade selection
  const key = input.consumeKey();
  if (key && state === STATE.UPGRADE_SELECT) {
    const idx = key - 1;
    if (idx >= 0 && idx < upgradeChoices.length) {
      applyUpgrade(upgradeChoices[idx]);
      audio.play('powerup');
      startWave();
    }
  }
  requestAnimationFrame(pollClicks);
}
pollClicks();
