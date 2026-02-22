import { CONFIG } from '../config.js';

/**
 * Canvas renderer with screen shake support
 */

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this._resize();
    window.addEventListener('resize', () => this._resize());
    // Screen shake
    this._shakeIntensity = 0;
    this._shakeTimer = 0;
    this._shakeOffsetX = 0;
    this._shakeOffsetY = 0;
  }

  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  get width() { return this.canvas.width; }
  get height() { return this.canvas.height; }

  shake(intensity, duration) {
    this._shakeIntensity = intensity;
    this._shakeTimer = duration;
  }

  updateShake(dt) {
    if (this._shakeTimer > 0) {
      this._shakeTimer -= dt;
      const t = this._shakeTimer / 0.15; // normalized
      this._shakeOffsetX = (Math.random() - 0.5) * 2 * this._shakeIntensity * t;
      this._shakeOffsetY = (Math.random() - 0.5) * 2 * this._shakeIntensity * t;
    } else {
      this._shakeOffsetX = 0;
      this._shakeOffsetY = 0;
    }
  }

  applyShake() {
    if (this._shakeOffsetX !== 0 || this._shakeOffsetY !== 0) {
      this.ctx.translate(this._shakeOffsetX, this._shakeOffsetY);
    }
  }

  clear() {
    // Reset transform before clear
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Batched grid pattern (single path + single stroke)
    this.ctx.strokeStyle = CONFIG.COLORS.GRID;
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    const gridSize = 40;
    for (let x = 0; x < this.width; x += gridSize) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }
    for (let y = 0; y < this.height; y += gridSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
    }
    this.ctx.stroke();

    // Apply shake offset after clearing
    this.applyShake();
  }

  drawCircle(x, y, radius, color, alpha = 1) {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawText(text, x, y, { color = CONFIG.COLORS.TEXT, size = 16, align = 'left', font = CONFIG.FONT } = {}) {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px ${font}`;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  drawGlow(x, y, radius, color) {
    this.ctx.save();
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }
}
