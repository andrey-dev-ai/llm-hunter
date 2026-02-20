import { CONFIG } from '../config.js';
import { normalize, subtract } from '../utils/vector.js';

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
    this.alive = true;
    this._hitFlash = 0;
    this._phase = Math.random() * Math.PI * 2;
  }

  takeDamage(amount) {
    this.hp -= amount;
    this._hitFlash = 0.1;
    if (this.hp <= 0) {
      this.alive = false;
    }
  }

  update(dt, playerPos) {
    // Move towards player
    const dir = normalize(subtract(playerPos, this));
    this.x += dir.x * this.speed * dt;
    this.y += dir.y * this.speed * dt;

    if (this._hitFlash > 0) this._hitFlash -= dt;
    this._phase += dt * 2;
  }

  render(ctx) {
    const pulse = 1 + Math.sin(this._phase) * 0.05;
    const r = this.radius * pulse;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(2, 4, r, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body circle
    ctx.fillStyle = this._hitFlash > 0 ? '#fff' : this.color;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // Label
    const fontSize = Math.max(9, Math.min(14, r * 0.7));
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, 0, 0);

    // HP bar (if damaged)
    if (this.hp < this.maxHp) {
      const barWidth = r * 2;
      const barHeight = 4;
      const barY = -r - 8;
      const hpRatio = this.hp / this.maxHp;

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

      ctx.fillStyle = hpRatio > 0.5 ? '#4ade80' : hpRatio > 0.25 ? '#fbbf24' : '#ef4444';
      ctx.fillRect(-barWidth / 2, barY, barWidth * hpRatio, barHeight);
    }

    ctx.restore();
  }
}
