import { CONFIG } from '../config.js';

const SYMBOL_COLORS = {
  '{}': '#e06c75',   // red (like brackets in code)
  '</>': '#61afef',   // blue (like JSX)
  '()': '#c678dd',   // purple (like functions)
  ';;': '#98c379',   // green (like strings)
  '//': '#5c6370',   // gray (like comments)
};

const TRAIL_LENGTH = 4;
const TRAIL_ALPHAS = [0.04, 0.10, 0.20, 0.35];
const TRAIL_SCALES = [0.5, 0.65, 0.8, 0.9];

export class Projectile {
  constructor(x, y, dirX, dirY, damage, symbol) {
    this.x = x;
    this.y = y;
    this.dirX = dirX;
    this.dirY = dirY;
    this.speed = CONFIG.PROJECTILE.SPEED;
    this.damage = damage;
    this.radius = CONFIG.PROJECTILE.RADIUS;
    this.symbol = symbol || '{}';
    this.alive = true;
    this.age = 0;
    this._trail = [];
  }

  update(dt) {
    // Record trail position before moving
    this._trail.push({ x: this.x, y: this.y });
    if (this._trail.length > TRAIL_LENGTH) this._trail.shift();

    this.x += this.dirX * this.speed * dt;
    this.y += this.dirY * this.speed * dt;
    this.age += dt;

    if (this.age > CONFIG.PROJECTILE.LIFETIME) {
      this.alive = false;
    }
  }

  render(ctx) {
    const color = SYMBOL_COLORS[this.symbol] || '#cdd6f4';

    ctx.save();

    // Trail ghost images
    for (let i = 0; i < this._trail.length; i++) {
      const t = this._trail[i];
      const alpha = TRAIL_ALPHAS[i] || 0.04;
      const scale = TRAIL_SCALES[i] || 0.5;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.radius * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main projectile with glow
    ctx.globalAlpha = 1;
    ctx.translate(this.x, this.y);

    // Green identity glow
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = CONFIG.COLORS.IDENTITY_GREEN;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Color glow
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
    ctx.fill();

    // Symbol text
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.font = `bold ${CONFIG.PROJECTILE.FONT_SIZE}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, 0, 0);

    ctx.restore();
  }
}
