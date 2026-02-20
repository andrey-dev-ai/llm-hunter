import { CONFIG } from '../config.js';

/**
 * HUD and screen overlays
 */

export class UI {
  constructor(renderer) {
    this.renderer = renderer;
    this.ctx = renderer.ctx;
  }

  drawHUD(player, score, waveNum, waveTotal) {
    const ctx = this.ctx;
    const w = this.renderer.width;

    // Top bar background
    ctx.fillStyle = CONFIG.COLORS.HUD_BG;
    ctx.fillRect(0, 0, w, 50);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 50, w, 1);

    // HP hearts
    const heartSize = 20;
    for (let i = 0; i < player.maxHp; i++) {
      const hx = 20 + i * (heartSize + 6);
      const hy = 25;

      if (i < player.hp) {
        this._drawHeart(ctx, hx, hy, heartSize / 2, CONFIG.COLORS.HP_FULL);
      } else {
        this._drawHeart(ctx, hx, hy, heartSize / 2, '#ddd');
      }
    }

    // Score
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Score: ${score}`, w / 2, 32);

    // Wave indicator
    ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Wave ${waveNum}/${waveTotal}`, w - 20, 32);
  }

  drawStartScreen() {
    const ctx = this.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(245, 245, 245, 0.95)';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(CONFIG.GAME.TITLE, w / 2, h / 2 - 60);

    // Subtitle
    ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
    ctx.font = '20px monospace';
    ctx.fillText(CONFIG.GAME.SUBTITLE, w / 2, h / 2 - 20);

    // Code decoration
    ctx.fillStyle = '#e06c75';
    ctx.font = '16px monospace';
    ctx.fillText('while (alive) { shoot(code); }', w / 2, h / 2 + 20);

    // Start prompt (blinking)
    if (Math.sin(Date.now() / 500) > 0) {
      ctx.fillStyle = CONFIG.COLORS.TEXT;
      ctx.font = '18px monospace';
      ctx.fillText('> ' + CONFIG.GAME.START_TEXT + ' _', w / 2, h / 2 + 80);
    }

    // Controls hint
    ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
    ctx.font = '14px monospace';
    ctx.fillText('Mouse = Move  |  Auto-fire = ON', w / 2, h / 2 + 130);
  }

  drawGameOver(score, highScore) {
    const ctx = this.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;

    ctx.fillStyle = 'rgba(245, 245, 245, 0.92)';
    ctx.fillRect(0, 0, w, h);

    // Death message
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('// ' + CONFIG.GAME.DEATH_MESSAGE, w / 2, h / 2 - 80);

    // Game Over
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 42px monospace';
    ctx.fillText('GAME OVER', w / 2, h / 2 - 30);

    // Score
    ctx.font = '24px monospace';
    ctx.fillText(`Score: ${score}`, w / 2, h / 2 + 20);

    // High score
    if (highScore > 0) {
      ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
      ctx.font = '16px monospace';
      ctx.fillText(`Best: ${highScore}`, w / 2, h / 2 + 55);
    }

    // New high score!
    if (score >= highScore && score > 0) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('NEW HIGH SCORE!', w / 2, h / 2 + 85);
    }

    // Restart prompt
    if (Math.sin(Date.now() / 500) > 0) {
      ctx.fillStyle = CONFIG.COLORS.TEXT;
      ctx.font = '18px monospace';
      ctx.fillText('> Click to try again _', w / 2, h / 2 + 130);
    }
  }

  drawWaveAnnouncement(text, alpha) {
    const ctx = this.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, w / 2, h / 2 - 20);
    ctx.restore();
  }

  drawBossWarning(alpha) {
    const ctx = this.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Red tint
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WARNING: BOSS INCOMING', w / 2, h / 2 - 20);

    ctx.font = '18px monospace';
    ctx.fillText('ChatGPT has entered the chat', w / 2, h / 2 + 20);

    ctx.restore();
  }

  drawLevelComplete(score) {
    const ctx = this.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;

    ctx.fillStyle = 'rgba(245, 245, 245, 0.92)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('// git push --force', w / 2, h / 2 - 80);

    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 42px monospace';
    ctx.fillText('LEVEL COMPLETE!', w / 2, h / 2 - 30);

    ctx.font = '24px monospace';
    ctx.fillText(`Score: ${score}`, w / 2, h / 2 + 20);

    ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
    ctx.font = '16px monospace';
    ctx.fillText('The no-code invasion has been stopped...', w / 2, h / 2 + 60);
    ctx.fillText('...for now.', w / 2, h / 2 + 85);

    if (Math.sin(Date.now() / 500) > 0) {
      ctx.fillStyle = CONFIG.COLORS.TEXT;
      ctx.font = '18px monospace';
      ctx.fillText('> Click to play again _', w / 2, h / 2 + 130);
    }
  }

  _drawHeart(ctx, x, y, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    ctx.bezierCurveTo(x, y - size * 0.3, x - size, y - size * 0.3, x - size, y + size * 0.1);
    ctx.bezierCurveTo(x - size, y + size * 0.6, x, y + size, x, y + size);
    ctx.bezierCurveTo(x, y + size, x + size, y + size * 0.6, x + size, y + size * 0.1);
    ctx.bezierCurveTo(x + size, y - size * 0.3, x, y - size * 0.3, x, y + size * 0.3);
    ctx.fill();
    ctx.restore();
  }
}
