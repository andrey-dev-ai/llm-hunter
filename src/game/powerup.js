import { CONFIG } from '../config.js';

export const POWERUP_TYPES = {
  COFFEE: {
    name: 'Coffee',
    icon: 'coffee',
    color: '#92400e',
    duration: 5,
    description: 'Fire rate x2!',
    weight: 4,  // most common
  },
  STACKOVERFLOW: {
    name: 'Stack Overflow',
    icon: 'SO',
    color: '#f48024',
    description: 'Answer found! AOE damage!',
    weight: 3,
  },
  GIT_REVERT: {
    name: 'Git Revert',
    icon: '+HP',
    color: '#4ade80',
    description: 'git revert HEAD~1',
    weight: 2,  // rarest — healing is valuable
  },
};

// Pre-compute weighted array for O(1) random pick
const _weightedPool = [];
for (const [key, val] of Object.entries(POWERUP_TYPES)) {
  for (let i = 0; i < val.weight; i++) _weightedPool.push(key);
}

export function randomPowerUpType() {
  return _weightedPool[Math.floor(Math.random() * _weightedPool.length)];
}

export class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.data = POWERUP_TYPES[type];
    this.radius = 15;
    this.alive = true;
    this.age = 0;
    this._phase = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.age += dt;
    this._phase += dt * 3;

    if (this.age > CONFIG.POWERUP.LIFETIME) {
      this.alive = false;
    }
  }

  render(ctx) {
    const bob = Math.sin(this._phase) * 3;
    const blink = this.age > CONFIG.POWERUP.LIFETIME - 2 && Math.sin(this.age * 10) > 0;
    if (blink) return;

    ctx.save();
    ctx.translate(this.x, this.y + bob);

    // Glow
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = this.data.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    const r = this.radius;

    if (this.type === 'COFFEE') {
      // Filled roundRect (cup shape)
      const size = r * 1.7;
      ctx.fillStyle = this.data.color;
      ctx.beginPath();
      ctx.roundRect(-size / 2, -size / 2, size, size, 5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-size / 2, -size / 2, size, size, 5);
      ctx.stroke();
    } else if (this.type === 'STACKOVERFLOW') {
      // Filled circle + pulsating AOE ring
      ctx.fillStyle = this.data.color;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      // Pulsating AOE ring preview
      const aoePulse = 0.5 + Math.sin(this._phase * 1.5) * 0.5;
      ctx.save();
      ctx.globalAlpha = 0.15 + aoePulse * 0.15;
      ctx.strokeStyle = this.data.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r + 12 + aoePulse * 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (this.type === 'GIT_REVERT') {
      // Filled circle with cross/plus symbol
      ctx.fillStyle = this.data.color;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      // Cross/plus symbol
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 6);
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();
    } else {
      // Fallback: default circle
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = this.data.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Icon text
    ctx.fillStyle = this.type === 'GIT_REVERT' ? this.data.color : '#fff';
    ctx.font = `bold 13px ${CONFIG.FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (this.type !== 'GIT_REVERT') {
      ctx.fillText(this.data.icon, 0, 0);
    }

    ctx.restore();
  }
}
