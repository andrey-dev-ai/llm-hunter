import { CONFIG } from '../config.js';
import { normalize, subtract, distance } from '../utils/vector.js';

const BOSS_PHRASES = [
  'As an AI...',
  "I can't do that",
  'Let me help you',
  'Hallucinating...',
  '🤖 Beep boop',
  'Context window full',
  'Rate limited!',
];

export class Boss {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.name = data.name;
    this.hp = data.hp;
    this.maxHp = data.hp;
    this.speed = data.speed;
    this.points = data.points;
    this.radius = data.radius || 50;
    this.color = data.color || '#10a37f';
    this.label = data.label || data.name;
    this.alive = true;
    this.isBoss = true;
    this._hitFlash = 0;
    this._phase = 0;
    this._phraseTimer = 0;
    this._currentPhrase = '';
    this._phraseAlpha = 0;
    this._shootTimer = 0;
    this.projectiles = []; // boss shoots back
  }

  takeDamage(amount) {
    this.hp -= amount;
    this._hitFlash = 0.1;
    if (this.hp <= 0) {
      this.alive = false;
    }
  }

  update(dt, playerPos) {
    // Move towards player (slower)
    const dir = normalize(subtract(playerPos, this));
    this.x += dir.x * this.speed * dt;
    this.y += dir.y * this.speed * dt;

    if (this._hitFlash > 0) this._hitFlash -= dt;
    this._phase += dt * 1.5;

    // Show random phrases
    this._phraseTimer -= dt;
    if (this._phraseTimer <= 0) {
      this._currentPhrase = BOSS_PHRASES[Math.floor(Math.random() * BOSS_PHRASES.length)];
      this._phraseAlpha = 1;
      this._phraseTimer = 2 + Math.random() * 3;
    }
    if (this._phraseAlpha > 0) this._phraseAlpha -= dt * 0.5;

    // Boss shoots "prompts" at player
    this._shootTimer -= dt;
    if (this._shootTimer <= 0 && this.alive) {
      const toPlayer = normalize(subtract(playerPos, this));
      this.projectiles.push({
        x: this.x,
        y: this.y,
        dirX: toPlayer.x,
        dirY: toPlayer.y,
        speed: CONFIG.BOSS.PROJECTILE_SPEED,
        radius: 8,
        alive: true,
        age: 0,
        text: '>_',
      });
      this._shootTimer = CONFIG.BOSS.SHOOT_RATE;
    }

    // Update boss projectiles
    for (const p of this.projectiles) {
      p.x += p.dirX * p.speed * dt;
      p.y += p.dirY * p.speed * dt;
      p.age += dt;
      if (p.age > 5) p.alive = false;
    }
    this.projectiles = this.projectiles.filter(p => p.alive);
  }

  render(ctx) {
    const pulse = 1 + Math.sin(this._phase) * 0.08;
    const r = this.radius * pulse;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Aura / glow
    const gradient = ctx.createRadialGradient(0, 0, r, 0, 0, r + 30);
    gradient.addColorStop(0, this.color + '40');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, r + 30, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = this._hitFlash > 0 ? '#fff' : this.color;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = `bold 18px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, 0, 0);

    // HP bar
    const barWidth = r * 2.5;
    const barHeight = 6;
    const barY = -r - 15;
    const hpRatio = this.hp / this.maxHp;

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
    ctx.fillStyle = hpRatio > 0.5 ? '#4ade80' : hpRatio > 0.25 ? '#fbbf24' : '#ef4444';
    ctx.fillRect(-barWidth / 2, barY, barWidth * hpRatio, barHeight);

    // Phrase bubble
    if (this._phraseAlpha > 0 && this._currentPhrase) {
      ctx.globalAlpha = this._phraseAlpha;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      const tw = ctx.measureText(this._currentPhrase).width + 16;
      ctx.beginPath();
      ctx.roundRect(-tw / 2, -r - 40, tw, 22, 6);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.fillText(this._currentPhrase, 0, -r - 26);
    }

    ctx.restore();

    // Render boss projectiles
    for (const p of this.projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = '#ef4444';
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.text, 0, 0);
      ctx.restore();
    }
  }
}
