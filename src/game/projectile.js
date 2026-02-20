import { CONFIG } from '../config.js';

const SYMBOL_COLORS = {
  '{}': '#e06c75',   // red (like brackets in code)
  '</>': '#61afef',   // blue (like JSX)
  '()': '#c678dd',   // purple (like functions)
  ';;': '#98c379',   // green (like strings)
  '//': '#5c6370',   // gray (like comments)
};

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
  }

  update(dt) {
    this.x += this.dirX * this.speed * dt;
    this.y += this.dirY * this.speed * dt;
    this.age += dt;

    // Remove if off screen (with generous margin)
    if (this.age > CONFIG.PROJECTILE.LIFETIME) {
      this.alive = false;
    }
  }

  render(ctx) {
    const color = SYMBOL_COLORS[this.symbol] || '#333';

    ctx.save();
    ctx.translate(this.x, this.y);

    // Glow
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
