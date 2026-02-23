import { CONFIG } from '../config.js';
import { normalize, subtract, distance } from '../utils/vector.js';

// Shape drawing helpers
function drawHexagon(ctx, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawOctagon(ctx, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 8;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export class Enemy {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.name = data.name;
    this.hp = data.hp;
    this.maxHp = data.hp;
    this.speed = data.speed;
    this.points = data.points;
    this.radius = data.radius || CONFIG.ENEMY.BASE_RADIUS;
    this.color = data.color || '#666';
    this.label = data.label || data.name;
    this.behavior = data.behavior || 'chase';
    this.shape = data.shape || 'circle';
    this.alive = true;
    this._hitFlash = 0;
    this._phase = Math.random() * Math.PI * 2;
    // Dash behavior state
    this._dashTimer = 1 + Math.random() * 2;
    this._isDashing = false;
    this._dashDuration = 0;
    this._dashTelegraph = false; // true during 0.3s warning before dash
    // Orbit direction (1 or -1)
    this._orbitDir = Math.random() > 0.5 ? 1 : -1;
    // Spawn animation
    this._spawnTimer = 0.3;
  }

  takeDamage(amount) {
    this.hp -= amount;
    this._hitFlash = 0.1;
    if (this.hp <= 0) {
      this.alive = false;
    }
  }

  update(dt, playerPos) {
    // Spawn animation — don't move or deal damage
    if (this._spawnTimer > 0) {
      this._spawnTimer -= dt;
      this._phase += dt * 2;
      return;
    }

    const dir = normalize(subtract(playerPos, this));

    switch (this.behavior) {
      case 'orbit': {
        // Spiral approach: move towards player with perpendicular offset
        const dist = distance(playerPos, this);
        // Orbit strength increases as enemy gets closer
        const orbitStrength = Math.min(1, 120 / Math.max(dist, 1));
        const perpX = -dir.y * this._orbitDir;
        const perpY = dir.x * this._orbitDir;
        const moveX = dir.x * (1 - orbitStrength * 0.6) + perpX * orbitStrength;
        const moveY = dir.y * (1 - orbitStrength * 0.6) + perpY * orbitStrength;
        this.x += moveX * this.speed * dt;
        this.y += moveY * this.speed * dt;
        break;
      }
      case 'dash': {
        // Alternate between slow creep → telegraph → fast dash
        if (this._isDashing) {
          this.x += dir.x * this.speed * 2.5 * dt;
          this.y += dir.y * this.speed * 2.5 * dt;
          this._dashDuration -= dt;
          if (this._dashDuration <= 0) {
            this._isDashing = false;
            this._dashTelegraph = false;
            this._dashTimer = 1.5 + Math.random() * 1.5;
          }
        } else if (this._dashTelegraph) {
          // Telegraph phase — freeze in place, visual warning
          this._dashTimer -= dt;
          if (this._dashTimer <= 0) {
            this._isDashing = true;
            this._dashTelegraph = false;
            this._dashDuration = 0.3 + Math.random() * 0.2;
          }
        } else {
          this.x += dir.x * this.speed * 0.3 * dt;
          this.y += dir.y * this.speed * 0.3 * dt;
          this._dashTimer -= dt;
          if (this._dashTimer <= 0) {
            this._dashTelegraph = true;
            this._dashTimer = 0.3; // 0.3s telegraph before dash
          }
        }
        break;
      }
      default: {
        // chase — straight to player
        this.x += dir.x * this.speed * dt;
        this.y += dir.y * this.speed * dt;
        break;
      }
    }

    if (this._hitFlash > 0) this._hitFlash -= dt;
    this._phase += dt * 2;
  }

  get isSpawning() {
    return this._spawnTimer > 0;
  }

  _drawBody(ctx, r) {
    switch (this.shape) {
      case 'roundRect': {
        const size = r * 1.6;
        ctx.beginPath();
        ctx.roundRect(-size / 2, -size / 2, size, size, r * 0.3);
        break;
      }
      case 'hexagon':
        drawHexagon(ctx, r);
        break;
      case 'octagon':
        drawOctagon(ctx, r);
        break;
      default:
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        break;
    }
  }

  render(ctx) {
    const pulse = 1 + Math.sin(this._phase) * 0.05;
    let r = this.radius * pulse;

    // Spawn animation
    let spawnAlpha = 1;
    let spawnScale = 1;
    if (this._spawnTimer > 0) {
      const t = 1 - (this._spawnTimer / 0.3); // 0→1 over 300ms
      if (t < 0.33) {
        // Phase 1: scale 0→1.2, alpha 0→0.8
        const p = t / 0.33;
        const eased = 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2);
        spawnScale = eased * 1.2;
        spawnAlpha = p * 0.8;
      } else {
        // Phase 2: scale 1.2→1.0, alpha 0.8→1.0
        const p = (t - 0.33) / 0.67;
        spawnScale = 1.2 - 0.2 * p;
        spawnAlpha = 0.8 + 0.2 * p;
      }
      r *= spawnScale;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = spawnAlpha;

    // Spawn glow ring
    if (this._spawnTimer > 0) {
      const t = 1 - (this._spawnTimer / 0.3);
      const glowR = this.radius * (1 + t * 1.5);
      const glowAlpha = 0.4 * (1 - t);
      ctx.save();
      ctx.globalAlpha = glowAlpha * spawnAlpha;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, glowR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Dash telegraph warning glow
    if (this._dashTelegraph) {
      const tPulse = 1 - (this._dashTimer / 0.3); // 0→1
      const warnR = r + 8 + tPulse * 10;
      ctx.save();
      ctx.globalAlpha = (0.3 + tPulse * 0.5) * spawnAlpha;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2 + tPulse * 2;
      ctx.beginPath();
      ctx.arc(0, 0, warnR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Shadow
    ctx.save();
    ctx.globalAlpha = 0.3 * spawnAlpha;
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.translate(2, 4);
    ctx.scale(1, 0.6);
    this._drawBody(ctx, r);
    ctx.fill();
    ctx.restore();

    // Body
    ctx.fillStyle = this._hitFlash > 0 ? '#fff' : this.color;
    this._drawBody(ctx, r);
    ctx.fill();

    // Border / HP arc (always circle overlay for readability)
    const hpRatio = this.hp / this.maxHp;
    if (hpRatio < 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + Math.PI * 2 * hpRatio;
      ctx.strokeStyle = hpRatio > 0.5 ? '#a6e3a1' : hpRatio > 0.25 ? '#f9e2af' : '#f38ba8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, r, startAngle, endAngle);
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2;
      this._drawBody(ctx, r);
      ctx.stroke();
    }

    // Label
    const fontSize = Math.max(9, Math.min(14, r * 0.7));
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${fontSize}px ${CONFIG.FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, 0, 0);

    ctx.restore();
  }
}
