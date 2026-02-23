import { CONFIG } from '../config.js';

/**
 * Manages all visual effects: particles, floating texts, death anims,
 * spawn indicators, and screen vignette.
 */
export class EffectsManager {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.deathAnims = [];
    this.spawnIndicators = [];
    this.vignette = null;
  }

  reset() {
    this.particles = [];
    this.floatingTexts = [];
    this.deathAnims = [];
    this.spawnIndicators = [];
    this.vignette = null;
  }

  addParticle(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      const life = 0.3 + Math.random() * 0.3;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        color,
        radius: 2 + Math.random() * 3,
      });
    }
  }

  addFloatingText(x, y, text, color, size = 14, life = 1.0, vy = -60) {
    this.floatingTexts.push({ x, y, text, color, size, life, maxLife: life, vy });
  }

  addVignette(color, duration = 0.5) {
    this.vignette = { color, alpha: 0.15, life: duration, maxLife: duration };
  }

  addDeathAnim(x, y, radius, color, label) {
    this.deathAnims.push({ x, y, radius, color, label, age: 0, duration: 0.2 });
  }

  addSpawnIndicator(x, y, color) {
    this.spawnIndicators.push({ x, y, color, life: 0.5, maxLife: 0.5 });
  }

  /** Score-tiered floating text for kill rewards */
  addScoreText(x, y, points) {
    const color = points >= 50 ? '#fab387' : '#f9e2af';
    const size = points >= 50 ? 18 : points >= 25 ? 14 : 11;
    const life = points >= 50 ? 1.0 : points >= 25 ? 0.8 : 0.6;
    const vy = points >= 50 ? -45 : points >= 25 ? -60 : -80;
    this.addFloatingText(x, y, `+${points}`, color, size, life, vy);
  }

  updateDeathAnimsOnly(dt) {
    for (let i = this.deathAnims.length - 1; i >= 0; i--) {
      this.deathAnims[i].age += dt;
      if (this.deathAnims[i].age >= this.deathAnims[i].duration) {
        this.deathAnims[i] = this.deathAnims[this.deathAnims.length - 1];
        this.deathAnims.pop();
      }
    }
  }

  update(dt) {
    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles[i] = this.particles[this.particles.length - 1];
        this.particles.pop();
      }
    }

    // Floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts[i] = this.floatingTexts[this.floatingTexts.length - 1];
        this.floatingTexts.pop();
      }
    }

    // Vignette
    if (this.vignette) {
      this.vignette.life -= dt;
      if (this.vignette.life <= 0) this.vignette = null;
    }

    // Death animations
    this.updateDeathAnimsOnly(dt);

    // Spawn indicators
    for (let i = this.spawnIndicators.length - 1; i >= 0; i--) {
      this.spawnIndicators[i].life -= dt;
      if (this.spawnIndicators[i].life <= 0) {
        this.spawnIndicators[i] = this.spawnIndicators[this.spawnIndicators.length - 1];
        this.spawnIndicators.pop();
      }
    }
  }

  /** Render effects that go UNDER game entities (spawn indicators, death anims) */
  renderUnder(ctx) {
    // Spawn indicators
    for (const si of this.spawnIndicators) {
      const t = 1 - (si.life / si.maxLife);
      const alpha = 0.4 + t * 0.4;
      ctx.save();
      ctx.translate(si.x, si.y);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = si.color;
      ctx.beginPath();
      ctx.arc(0, 0, 6 + t * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha * 0.5;
      ctx.strokeStyle = si.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 10 + t * 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Death animations
    for (const da of this.deathAnims) {
      const t = da.age / da.duration;
      const flashPhase = t < 0.25;
      const scale = 1 + t * 0.6;
      const alpha = 1 - t;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(da.x, da.y);

      ctx.fillStyle = flashPhase ? '#fff' : da.color;
      ctx.beginPath();
      ctx.arc(0, 0, da.radius * scale, 0, Math.PI * 2);
      ctx.fill();

      if (!flashPhase) {
        const fontSize = Math.max(9, Math.min(14, da.radius * 0.7));
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${fontSize}px ${CONFIG.FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(da.label, 0, 0);
      }

      ctx.restore();
    }
  }

  /** Render effects that go OVER game entities (particles, texts, vignette) */
  renderOver(ctx, renderer) {
    // Particles
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Floating texts
    for (const ft of this.floatingTexts) {
      const lifeRatio = ft.life / (ft.maxLife || 1);
      ctx.save();
      ctx.globalAlpha = Math.min(1, lifeRatio * 2);
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${ft.size}px ${CONFIG.FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (ft.size >= 28) {
        ctx.strokeStyle = '#1e1e2e';
        ctx.lineWidth = 2;
        ctx.strokeText(ft.text, ft.x, ft.y);
      }
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // Vignette overlay
    if (this.vignette) {
      const w = renderer.width;
      const h = renderer.height;
      const t = this.vignette.life / this.vignette.maxLife;
      ctx.save();
      ctx.globalAlpha = this.vignette.alpha * t;
      const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, this.vignette.color);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }
}
