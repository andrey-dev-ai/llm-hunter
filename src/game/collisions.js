import { CONFIG } from '../config.js';
import { circlesCollide } from '../utils/collision.js';
import { distance } from '../utils/vector.js';

/**
 * Handle player taking damage (with shield support).
 * Returns true if damage was applied, 'shielded' if shield absorbed it, false if invulnerable.
 */
function handlePlayerHit(player, fromX, fromY, knockbackForce, fx, onAudio, onShake) {
  const result = player.takeDamage(1);
  if (result === 'shielded') {
    fx.addParticle(player.x, player.y, '#89b4fa', 12);
    fx.addFloatingText(player.x, player.y - 30, 'SHIELDED!', '#89b4fa', 16, 0.8);
    onAudio('powerup');
    onShake(CONFIG.SCREEN_SHAKE.KILL_INTENSITY, CONFIG.SCREEN_SHAKE.KILL_DURATION);
    return false; // no damage taken
  }
  if (result === true) {
    fx.addParticle(player.x, player.y, '#f38ba8', 8);
    onAudio('playerHit');
    player.applyKnockback(fromX, fromY, knockbackForce);
    onShake(CONFIG.SCREEN_SHAKE.HIT_INTENSITY, CONFIG.SCREEN_SHAKE.HIT_DURATION);
    fx.addFloatingText(player.x, player.y - 25, '-1', '#f38ba8', 18);
    return true;
  }
  return false; // invulnerable
}

/**
 * Handle enemy kill — score, effects, kill counter AoE.
 */
function handleEnemyKill(e, player, enemies, fx, callbacks) {
  const { onScore, onAudio, onShake, onHitstop, onSpawnPowerUp } = callbacks;
  onScore(e.points);
  player.stats.kills++;
  fx.addDeathAnim(e.x, e.y, e.radius, e.color, e.label);
  fx.addParticle(e.x, e.y, e.color, 8);
  fx.addScoreText(e.x, e.y - e.radius - 15, e.points);
  onSpawnPowerUp(e.x, e.y);
  onAudio('kill');
  onShake(CONFIG.SCREEN_SHAKE.KILL_INTENSITY, CONFIG.SCREEN_SHAKE.KILL_DURATION);
  onHitstop(e.maxHp >= 3
    ? CONFIG.HITSTOP.STRONG_KILL_DURATION
    : CONFIG.HITSTOP.KILL_DURATION);

  // Kill counter AoE (Stack Overflow upgrade)
  if (player.killAoeEnabled) {
    player._killCounter++;
    if (player._killCounter >= 5) {
      player._killCounter = 0;
      const aoeRadius = 120;
      fx.addParticle(e.x, e.y, '#fab387', 20);
      fx.addFloatingText(e.x, e.y - 30, 'AoE!', '#fab387', 16, 0.8);
      onShake(CONFIG.SCREEN_SHAKE.HIT_INTENSITY * 1.5, CONFIG.SCREEN_SHAKE.HIT_DURATION);
      for (const target of enemies) {
        if (!target.alive || target === e) continue;
        if (distance(e, target) <= aoeRadius) {
          target.takeDamage(2);
          fx.addParticle(target.x, target.y, '#fab387', 4);
          if (!target.alive) {
            handleEnemyKill(target, player, enemies, fx, callbacks);
          }
        }
      }
    }
  }
}

/**
 * Find nearest alive enemy to a point, optionally excluding a set.
 */
function findNearest(from, enemies, boss, exclude) {
  let nearest = null;
  let minDist = Infinity;
  for (const e of enemies) {
    if (!e.alive || (exclude && exclude.has(e))) continue;
    const d = distance(from, e);
    if (d < minDist) { minDist = d; nearest = e; }
  }
  if (boss && boss.alive && !(exclude && exclude.has(boss))) {
    const d = distance(from, boss);
    if (d < minDist) { nearest = boss; }
  }
  return nearest;
}

/**
 * Resolves all game collisions.
 */
export function resolveCollisions(world, fx, callbacks) {
  const { projectiles, enemies, boss, player, powerups } = world;
  const { onAudio, onScore, onShake, onHitstop, onSpawnPowerUp, onApplyPowerUp } = callbacks;

  // --- Projectiles vs enemies ---
  for (const p of projectiles) {
    if (!p.alive) continue;

    for (const e of enemies) {
      if (!e.alive) continue;
      if (p._hitEnemies.has(e)) continue; // already pierced through this one
      if (circlesCollide(p, e)) {
        e.takeDamage(p.damage);
        p._hitEnemies.add(e);
        fx.addParticle(p.x, p.y, '#89b4fa', 3);
        fx.addFloatingText(e.x, e.y - e.radius - 5, `-${p.damage}`, '#89b4fa', 10, 0.4, -80);

        if (!e.alive) {
          handleEnemyKill(e, player, enemies, fx, callbacks);
        }

        // Pierce: projectile continues if pierce > 0
        if (p.pierce > 0) {
          p.pierce--;
        } else if (p.bounces > 0) {
          // Ricochet: redirect to nearest enemy
          p.bounces--;
          const next = findNearest(p, enemies, boss, p._hitEnemies);
          if (next) {
            const dx = next.x - p.x;
            const dy = next.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            p.dirX = dx / dist;
            p.dirY = dy / dist;
          } else {
            p.alive = false;
          }
        } else {
          p.alive = false;
        }
        if (!p.alive) break;
      }
    }

    // Projectiles vs boss
    if (p.alive && boss && boss.alive && !p._hitEnemies.has(boss)) {
      if (circlesCollide(p, boss)) {
        boss.takeDamage(p.damage);
        p._hitEnemies.add(boss);
        fx.addParticle(p.x, p.y, '#89b4fa', 3);
        fx.addFloatingText(boss.x, boss.y - boss.radius - 5, `-${p.damage}`, '#89b4fa', 12, 0.5, -70);
        if (!boss.alive) {
          onScore(boss.points);
          player.stats.kills++;
          player.stats.bossKills++;
          fx.addDeathAnim(boss.x, boss.y, boss.radius, boss.color, boss.label);
          fx.addParticle(boss.x, boss.y, boss.color, 35);
          fx.addFloatingText(boss.x, boss.y - boss.radius - 20, `+${boss.points}`, '#fab387', 28, 1.5, -30);
          onAudio('bossKill');
          onShake(CONFIG.SCREEN_SHAKE.BOSS_KILL_INTENSITY, CONFIG.SCREEN_SHAKE.BOSS_KILL_DURATION);
          onHitstop(CONFIG.HITSTOP.BOSS_KILL_DURATION);
          fx.addVignette(CONFIG.COLORS.IDENTITY_GREEN, 0.6);
        }

        if (p.pierce > 0) {
          p.pierce--;
        } else if (p.bounces > 0) {
          p.bounces--;
          const next = findNearest(p, enemies, boss, p._hitEnemies);
          if (next) {
            const dx = next.x - p.x;
            const dy = next.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            p.dirX = dx / dist;
            p.dirY = dy / dist;
          } else {
            p.alive = false;
          }
        } else {
          p.alive = false;
        }
      }
    }
  }

  // --- Enemies vs player (contact kills) ---
  for (const e of enemies) {
    if (!e.alive || e.isSpawning) continue;
    if (circlesCollide(e, player)) {
      handlePlayerHit(player, e.x, e.y, CONFIG.KNOCKBACK.ENEMY_FORCE, fx, onAudio, onShake);
      e.alive = false;
      onScore(e.points);
      player.stats.kills++;
      fx.addDeathAnim(e.x, e.y, e.radius, e.color, e.label);
      fx.addParticle(e.x, e.y, e.color, 5);
      onSpawnPowerUp(e.x, e.y);
      onAudio('kill');
    }
  }

  // --- Boss body vs player ---
  if (boss && boss.alive && circlesCollide(boss, player)) {
    handlePlayerHit(player, boss.x, boss.y, CONFIG.KNOCKBACK.BOSS_FORCE, fx, onAudio, onShake);
  }

  // --- Boss projectiles vs player ---
  if (boss && boss.alive) {
    for (const bp of boss.projectiles) {
      if (circlesCollide(bp, player)) {
        handlePlayerHit(player, bp.x, bp.y, CONFIG.KNOCKBACK.BOSS_FORCE, fx, onAudio, onShake);
        bp.alive = false;
      }
    }
  }

  // --- Player vs powerups ---
  for (const pu of powerups) {
    if (!pu.alive) continue;
    if (circlesCollide(pu, player)) {
      pu.alive = false;
      onApplyPowerUp(pu.type);
      fx.addParticle(pu.x, pu.y, pu.data.color, 12);
      onAudio('powerup');
      player.stats.powerups++;
      fx.addFloatingText(player.x, player.y - 35, pu.data.description, pu.data.color, 14);
      fx.addVignette(pu.data.color, 0.4);
    }
  }

  // --- Clean up dead entities (swap-remove) ---
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
}
