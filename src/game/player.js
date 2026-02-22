import { CONFIG } from '../config.js';

const CODE_SYMBOLS = ['{}', '</>', '()', ';;', '//'];

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = CONFIG.PLAYER.RADIUS;
    this.hp = CONFIG.PLAYER.MAX_HP;
    this.maxHp = CONFIG.PLAYER.MAX_HP;
    this.shootCooldown = 0;
    this.shootRate = CONFIG.PLAYER.SHOOT_RATE;
    this.damage = CONFIG.PLAYER.DAMAGE;
    this.baseSpeed = CONFIG.PLAYER.SPEED;
    this.multiShot = 1;
    this.projectileSpeedMult = 1;
    this.invulnerable = 0;
    this.speedBoostTimer = 0;
    this._symbolIndex = 0;
    this._bobPhase = 0;
    // Knockback
    this._knockbackVx = 0;
    this._knockbackVy = 0;
    this._knockbackTimer = 0;
    // Stats
    this.stats = { kills: 0, powerups: 0, wavesCleared: 0, bossKills: 0 };
  }

  get alive() {
    return this.hp > 0;
  }

  nextSymbol() {
    const sym = CODE_SYMBOLS[this._symbolIndex % CODE_SYMBOLS.length];
    this._symbolIndex++;
    return sym;
  }

  takeDamage(amount) {
    if (this.invulnerable > 0) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.invulnerable = CONFIG.PLAYER.INVULNERABLE_TIME;
    return true;
  }

  applyKnockback(fromX, fromY, force) {
    const dx = this.x - fromX;
    const dy = this.y - fromY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    this._knockbackVx = (dx / dist) * force;
    this._knockbackVy = (dy / dist) * force;
    this._knockbackTimer = CONFIG.KNOCKBACK.DURATION;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  applySpeedBoost(duration) {
    this.speedBoostTimer = duration;
  }

  update(dt, mousePos) {
    // Apply knockback
    if (this._knockbackTimer > 0) {
      const t = this._knockbackTimer / CONFIG.KNOCKBACK.DURATION;
      this.x += this._knockbackVx * t * dt;
      this.y += this._knockbackVy * t * dt;
      this._knockbackTimer -= dt;
    }

    // Move towards mouse
    const dx = mousePos.x - this.x;
    const dy = mousePos.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 5) {
      const speed = this.baseSpeed;
      const move = Math.min(dist, speed * dt);
      this.x += (dx / dist) * move;
      this.y += (dy / dist) * move;
    }

    // Cooldowns
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.invulnerable > 0) this.invulnerable -= dt;
    if (this.speedBoostTimer > 0) this.speedBoostTimer -= dt;

    // Animation
    this._bobPhase += dt * 3;
  }

  canShoot() {
    // Use rate for speed boost (fixes dead code bug)
    return this.shootCooldown <= 0 && this.alive;
  }

  shoot() {
    const rate = this.speedBoostTimer > 0 ? this.shootRate * 0.5 : this.shootRate;
    this.shootCooldown = rate;
  }

  render(ctx) {
    if (!this.alive) return;

    const blink = this.invulnerable > 0 && Math.sin(this.invulnerable * 20) > 0;
    if (blink) return;

    const bob = Math.sin(this._bobPhase) * 2;

    ctx.save();
    ctx.translate(this.x, this.y + bob);

    // Head (circle)
    ctx.fillStyle = CONFIG.COLORS.PLAYER_SKIN;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Hair (top arc)
    ctx.fillStyle = CONFIG.COLORS.PLAYER_HAIR;
    ctx.beginPath();
    ctx.arc(0, -2, this.radius, Math.PI, Math.PI * 2);
    ctx.fill();

    // Headphones band
    ctx.strokeStyle = CONFIG.COLORS.PLAYER_HEADPHONES;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -2, this.radius + 4, Math.PI + 0.3, -0.3);
    ctx.stroke();

    // Headphone pads
    ctx.fillStyle = CONFIG.COLORS.PLAYER_HEADPHONES;
    ctx.beginPath();
    ctx.ellipse(-this.radius - 2, 2, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(this.radius + 2, 2, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glasses
    ctx.strokeStyle = CONFIG.COLORS.PLAYER_GLASSES;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-12, -4, 10, 8, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(2, -4, 10, 8, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(2, 0);
    ctx.stroke();

    // Glasses shine
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(-10, -3, 3, 3);
    ctx.fillRect(4, -3, 3, 3);

    // Mouth (small smile)
    ctx.strokeStyle = CONFIG.COLORS.PLAYER_SKIN_DARK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 6, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.restore();

    // Speed boost indicator
    if (this.speedBoostTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
