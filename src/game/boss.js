import { CONFIG } from '../config.js';
import { normalize, subtract, distance } from '../utils/vector.js';
import { MINION_TYPES } from '../data/enemies.js';

// Fallback phrases if boss data doesn't provide them
const DEFAULT_PHRASES = ['...', '???', '!!!'];
const DEFAULT_ENRAGE_PHRASES = ['OVERLOAD!', 'MAX POWER!'];
const PROMPT_TEXTS = ['>_', '>>>', '$_', '...'];

export class Boss {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.name = data.name;
    this.hp = data.hp;
    this.maxHp = data.hp;
    this.baseSpeed = data.speed;
    this.speed = data.speed;
    this.points = data.points;
    this.radius = data.radius || 50;
    this.color = data.color || '#10a37f';
    this.label = data.label || data.name;
    this._phrases = data.phrases || DEFAULT_PHRASES;
    this._enragePhrases = data.enragePhrases || DEFAULT_ENRAGE_PHRASES;
    this._minionType = data.minionType || 'TOKEN';
    this.alive = true;
    this.isBoss = true;
    this.enraged = false;
    this._hitFlash = 0;
    this._phase = 0;
    this._phraseTimer = 0;
    this._currentPhrase = '';
    this._phraseAlpha = 0;
    this._shootTimer = 0;
    this._chargeTimer = 0;
    this._charging = false;
    this._minionTimer = CONFIG.BOSS.MINION_INTERVAL;
    this.pendingMinions = [];
    this.projectiles = [];
  }

  takeDamage(amount) {
    this.hp -= amount;
    this._hitFlash = 0.1;
    if (this.hp <= 0) {
      this.alive = false;
      this.projectiles = [];
    }
  }

  update(dt, playerPos) {
    // Check enrage phase
    const hpRatio = this.hp / this.maxHp;
    if (!this.enraged && hpRatio <= CONFIG.BOSS.ENRAGE_THRESHOLD) {
      this.enraged = true;
      this._currentPhrase = 'ENRAGED!';
      this._phraseAlpha = 2;
    }

    // Speed depends on phase
    this.speed = this.enraged
      ? this.baseSpeed * CONFIG.BOSS.ENRAGE_SPEED_MULT
      : this.baseSpeed;

    // Move towards player
    const dir = normalize(subtract(playerPos, this));
    this.x += dir.x * this.speed * dt;
    this.y += dir.y * this.speed * dt;

    if (this._hitFlash > 0) this._hitFlash -= dt;
    this._phase += dt * (this.enraged ? 3 : 1.5);

    // Show random phrases
    this._phraseTimer -= dt;
    if (this._phraseTimer <= 0) {
      const phrases = this.enraged ? this._enragePhrases : this._phrases;
      this._currentPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      this._phraseAlpha = 1;
      this._phraseTimer = this.enraged ? 1.5 + Math.random() * 2 : 2 + Math.random() * 3;
    }
    if (this._phraseAlpha > 0) this._phraseAlpha -= dt * 0.5;

    // Shoot at player (with telegraph charge-up)
    const shootRate = this.enraged
      ? CONFIG.BOSS.SHOOT_RATE * CONFIG.BOSS.ENRAGE_SHOOT_MULT
      : CONFIG.BOSS.SHOOT_RATE;

    if (this._charging) {
      this._chargeTimer -= dt;
      if (this._chargeTimer <= 0) {
        // Fire!
        this._charging = false;
        const toPlayer = normalize(subtract(playerPos, this));
        const text = PROMPT_TEXTS[Math.floor(Math.random() * PROMPT_TEXTS.length)];

        if (this.enraged) {
          const spread = CONFIG.BOSS.SPREAD_ANGLE;
          for (let i = -1; i <= 1; i++) {
            const angle = Math.atan2(toPlayer.y, toPlayer.x) + i * spread;
            this.projectiles.push({
              x: this.x, y: this.y,
              dirX: Math.cos(angle), dirY: Math.sin(angle),
              speed: CONFIG.BOSS.PROJECTILE_SPEED,
              radius: 8, alive: true, age: 0, text,
            });
          }
        } else {
          this.projectiles.push({
            x: this.x, y: this.y,
            dirX: toPlayer.x, dirY: toPlayer.y,
            speed: CONFIG.BOSS.PROJECTILE_SPEED,
            radius: 8, alive: true, age: 0, text,
          });
        }
        this._shootTimer = shootRate;
      }
    } else {
      this._shootTimer -= dt;
      if (this._shootTimer <= 0 && this.alive) {
        this._charging = true;
        this._chargeTimer = 0.3;
      }
    }

    // Spawn minions in phase 2
    if (this.enraged && this.alive) {
      this._minionTimer -= dt;
      if (this._minionTimer <= 0) {
        // Spawn 2-3 minions of boss-specific type
        const count = 2 + Math.floor(Math.random() * 2);
        const mType = MINION_TYPES[this._minionType] || MINION_TYPES.TOKEN;
        for (let i = 0; i < count; i++) {
          this.pendingMinions.push({ ...mType });
        }
        this._minionTimer = CONFIG.BOSS.MINION_INTERVAL;
      }
    }

    // Update boss projectiles
    for (const p of this.projectiles) {
      p.x += p.dirX * p.speed * dt;
      p.y += p.dirY * p.speed * dt;
      p.age += dt;
      if (p.age > 5) p.alive = false;
    }
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      if (!this.projectiles[i].alive) {
        this.projectiles[i] = this.projectiles[this.projectiles.length - 1];
        this.projectiles.pop();
      }
    }
  }

  render(ctx) {
    const pulseSpeed = this.enraged ? 2 : 1;
    const pulseAmp = this.enraged ? 0.12 : 0.08;
    const pulse = 1 + Math.sin(this._phase * pulseSpeed) * pulseAmp;
    const r = this.radius * pulse;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Telegraph charge-up glow
    if (this._charging) {
      const chargeT = 1 - (this._chargeTimer / 0.3); // 0→1
      const chargeR = r + 10 + chargeT * 15;
      ctx.save();
      ctx.globalAlpha = 0.3 + chargeT * 0.4;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2 + chargeT * 3;
      ctx.beginPath();
      ctx.arc(0, 0, chargeR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Aura / glow (bigger and redder when enraged)
    const glowSize = this.enraged ? 50 : 30;
    const glowColor = this.enraged ? '#ef444440' : this.color + '40';
    const gradient = ctx.createRadialGradient(0, 0, r, 0, 0, r + glowSize);
    gradient.addColorStop(0, glowColor);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, r + glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const bodyColor = this.enraged
      ? (Math.sin(this._phase * 4) > 0 ? '#ef4444' : this.color)
      : this.color;
    ctx.fillStyle = this._hitFlash > 0 ? '#fff' : bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = this.enraged ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.3)';
    ctx.lineWidth = this.enraged ? 4 : 3;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating symbol ring
    const symbols = ['{', '}', '<', '>', '(', ')', '[', ']'];
    const ringR = r + 25;
    ctx.save();
    ctx.globalAlpha = this.enraged ? 0.5 : 0.35;
    ctx.fillStyle = this.enraged ? '#ef4444' : '#fff';
    ctx.font = `bold 14px ${CONFIG.FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const rotSpeed = this.enraged ? 0.5 : 0.3;
    for (let i = 0; i < symbols.length; i++) {
      const angle = (Math.PI * 2 / symbols.length) * i + this._phase * rotSpeed;
      const sx = Math.cos(angle) * ringR;
      const sy = Math.sin(angle) * ringR;
      ctx.fillText(symbols[i], sx, sy);
    }
    ctx.restore();

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = `bold 18px ${CONFIG.FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, 0, 0);

    // HP bar (wider, taller, rounded)
    const barWidth = r * 3;
    const barHeight = 10;
    const barY = -r - 18;
    const hpRatio = this.hp / this.maxHp;
    const hpColor = hpRatio > 0.5 ? '#a6e3a1' : hpRatio > 0.25 ? '#f9e2af' : '#f38ba8';

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(-barWidth / 2, barY, barWidth, barHeight, 3);
    ctx.fill();
    ctx.fillStyle = hpColor;
    ctx.beginPath();
    ctx.roundRect(-barWidth / 2, barY, barWidth * hpRatio, barHeight, 3);
    ctx.fill();

    // HP text
    ctx.fillStyle = '#fff';
    ctx.font = `bold 10px ${CONFIG.FONT}`;
    ctx.fillText(`${this.hp}/${this.maxHp}`, 0, barY + barHeight / 2 + 1);

    // Phrase bubble
    if (this._phraseAlpha > 0 && this._currentPhrase) {
      ctx.globalAlpha = Math.min(1, this._phraseAlpha);
      ctx.fillStyle = this.enraged ? 'rgba(239,68,68,0.8)' : 'rgba(0,0,0,0.7)';
      ctx.font = this.enraged ? `bold 13px ${CONFIG.FONT}` : `13px ${CONFIG.FONT}`;
      const tw = ctx.measureText(this._currentPhrase).width + 16;
      ctx.beginPath();
      ctx.roundRect(-tw / 2, -r - 44, tw, 22, 6);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(this._currentPhrase, 0, -r - 26);
    }

    ctx.restore();

    // Render boss projectiles (with trail)
    for (const p of this.projectiles) {
      // Trail (3 ghost images)
      for (let t = 3; t >= 1; t--) {
        const trailX = p.x - p.dirX * p.speed * 0.02 * t;
        const trailY = p.y - p.dirY * p.speed * 0.02 * t;
        ctx.save();
        ctx.translate(trailX, trailY);
        ctx.globalAlpha = 0.1 * (4 - t);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius - t, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // Main body
      ctx.save();
      ctx.translate(p.x, p.y);
      // Larger glow
      const pulseR = p.radius + 6 + Math.sin(p.age * 12) * 2;
      ctx.fillStyle = '#ef4444';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
      // Text with outline
      ctx.font = `bold 18px ${CONFIG.FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#1e1e2e';
      ctx.lineWidth = 2;
      ctx.strokeText(p.text, 0, 0);
      ctx.fillStyle = '#fff';
      ctx.fillText(p.text, 0, 0);
      ctx.restore();
    }
  }
}
