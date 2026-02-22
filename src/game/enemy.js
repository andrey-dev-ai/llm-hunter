import { CONFIG } from '../config.js';
import { normalize, subtract, distance } from '../utils/vector.js';

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
    this.alive = true;
    this._hitFlash = 0;
    this._phase = Math.random() * Math.PI * 2;
    // Dash behavior state
    this._dashTimer = 1 + Math.random() * 2;
    this._isDashing = false;
    this._dashDuration = 0;
    // Orbit direction (1 or -1)
    this._orbitDir = Math.random() > 0.5 ? 1 : -1;
  }

  takeDamage(amount) {
    this.hp -= amount;
    this._hitFlash = 0.1;
    if (this.hp <= 0) {
      this.alive = false;
    }
  }

  update(dt, playerPos) {
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
        // Alternate between slow creep and fast dash
        if (this._isDashing) {
          this.x += dir.x * this.speed * 2.5 * dt;
          this.y += dir.y * this.speed * 2.5 * dt;
          this._dashDuration -= dt;
          if (this._dashDuration <= 0) {
            this._isDashing = false;
            this._dashTimer = 1.5 + Math.random() * 1.5;
          }
        } else {
          this.x += dir.x * this.speed * 0.3 * dt;
          this.y += dir.y * this.speed * 0.3 * dt;
          this._dashTimer -= dt;
          if (this._dashTimer <= 0) {
            this._isDashing = true;
            this._dashDuration = 0.3 + Math.random() * 0.2;
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

  render(ctx) {
    const pulse = 1 + Math.sin(this._phase) * 0.05;
    const r = this.radius * pulse;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(2, 4, r, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body circle
    ctx.fillStyle = this._hitFlash > 0 ? '#fff' : this.color;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Border / HP arc
    const hpRatio = this.hp / this.maxHp;
    if (hpRatio < 1) {
      // Background arc (full circle)
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      // HP arc (colored, from top clockwise)
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + Math.PI * 2 * hpRatio;
      ctx.strokeStyle = hpRatio > 0.5 ? '#a6e3a1' : hpRatio > 0.25 ? '#f9e2af' : '#f38ba8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, r, startAngle, endAngle);
      ctx.stroke();
    } else {
      // Full HP — subtle border
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Label
    const fontSize = Math.max(9, Math.min(14, r * 0.7));
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, 0, 0);

    ctx.restore();
  }
}
