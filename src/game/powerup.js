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

    // Body
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = this.data.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Icon text
    ctx.fillStyle = this.data.color;
    ctx.font = `bold 11px ${CONFIG.FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.data.icon, 0, 0);

    ctx.restore();
  }
}
