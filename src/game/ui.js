import { CONFIG } from '../config.js';

const F = CONFIG.FONT;

/**
 * HUD, overlays, and UI elements
 */

const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : ''
);

export class UI {
  constructor(renderer) {
    this.renderer = renderer;
    this.ctx = renderer.ctx;
  }

  drawHUD(player, score, waveNum, waveTotal, waveProgress) {
    const ctx = this.ctx;
    const w = this.renderer.width;

    // Top bar background
    ctx.fillStyle = CONFIG.COLORS.HUD_BG;
    ctx.fillRect(0, 0, w, 50);
    ctx.fillStyle = CONFIG.COLORS.HUD_BORDER;
    ctx.fillRect(0, 50, w, 1);

    // HP hearts
    const heartSize = 20;
    for (let i = 0; i < player.maxHp; i++) {
      const hx = 20 + i * (heartSize + 6);
      const hy = 25;

      if (i < player.hp) {
        this._drawHeart(ctx, hx, hy, heartSize / 2, CONFIG.COLORS.HP_FULL);
      } else {
        this._drawHeart(ctx, hx, hy, heartSize / 2, CONFIG.COLORS.HUD_BORDER);
      }
    }

    // Score
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = `bold 18px ${F}`;
    ctx.textAlign = 'center';
    ctx.fillText(`Score: ${score}`, w / 2, 22);

    // Wave indicator
    ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
    ctx.font = `14px ${F}`;
    ctx.textAlign = 'right';
    ctx.fillText(`Wave ${waveNum}/${waveTotal}`, w - 20, 22);

    // Wave progress bar
    if (waveProgress !== undefined) {
      const barW = 140;
      const barH = 6;
      const barX = w - 20 - barW;
      const barY = 34;
      ctx.fillStyle = CONFIG.COLORS.HUD_BORDER;
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = CONFIG.COLORS.IDENTITY_GREEN;
      ctx.fillRect(barX, barY, barW * waveProgress, barH);
    }
  }

  drawStartScreen() {
    const ctx = this.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;

    ctx.fillStyle = CONFIG.COLORS.OVERLAY_BG;
    ctx.fillRect(0, 0, w, h);

    // Title — dual color identity
    ctx.font = `bold 48px ${F}`;
    ctx.textAlign = 'center';
    const titleY = h / 2 - 60;
    const llmW = ctx.measureText('LLM ').width;
    const hunterW = ctx.measureText('Hunter').width;
    const titleStartX = w / 2 - (llmW + hunterW) / 2;
    ctx.textAlign = 'left';
    ctx.fillStyle = CONFIG.COLORS.ACCENT;
    ctx.fillText('LLM ', titleStartX, titleY);
    ctx.fillStyle = CONFIG.COLORS.IDENTITY_GREEN;
    ctx.fillText('Hunter', titleStartX + llmW, titleY);
    ctx.textAlign = 'center';

    // Subtitle
    ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
    ctx.font = `20px ${F}`;
    ctx.fillText(CONFIG.GAME.SUBTITLE, w / 2, h / 2 - 20);

    // Code decoration
    ctx.fillStyle = '#e06c75';
    ctx.font = `16px ${F}`;
    ctx.fillText('while (alive) { shoot(code); }', w / 2, h / 2 + 20);

    // Start prompt (blinking green cursor)
    if (Math.sin(Date.now() / 500) > 0) {
      ctx.fillStyle = CONFIG.COLORS.TEXT;
      ctx.font = `18px ${F}`;
      ctx.fillText('> ' + CONFIG.GAME.START_TEXT, w / 2 - 5, h / 2 + 80);
      ctx.fillStyle = CONFIG.COLORS.IDENTITY_GREEN;
      ctx.fillText(' _', w / 2 + ctx.measureText('> ' + CONFIG.GAME.START_TEXT).width / 2 - 5, h / 2 + 80);
    }

    // Controls hint
    ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
    ctx.font = `14px ${F}`;
    ctx.fillText('Mouse = Move  |  Auto-fire = ON', w / 2, h / 2 + 130);

    // Mobile warning
    if (isMobile) {
      ctx.fillStyle = '#ef4444';
      ctx.font = `bold 14px ${F}`;
      ctx.fillText('Best played on desktop with mouse!', w / 2, h / 2 + 160);
    }
  }

  drawGameOver(score, highScore, stats) {
    const ctx = this.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;

    ctx.fillStyle = CONFIG.COLORS.OVERLAY_BG;
    ctx.fillRect(0, 0, w, h);

    // Death message
    ctx.fillStyle = CONFIG.COLORS.HP_LOW;
    ctx.font = `bold 16px ${F}`;
    ctx.textAlign = 'center';
    ctx.fillText('// ' + CONFIG.GAME.DEATH_MESSAGE, w / 2, h / 2 - 110);

    // Game Over
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = `bold 42px ${F}`;
    ctx.fillText('GAME OVER', w / 2, h / 2 - 60);

    // Score
    ctx.font = `24px ${F}`;
    ctx.fillText(`Score: ${score}`, w / 2, h / 2 - 15);

    // High score
    if (highScore > 0) {
      ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
      ctx.font = `16px ${F}`;
      ctx.fillText(`Best: ${highScore}`, w / 2, h / 2 + 15);
    }

    // New high score!
    if (score >= highScore && score > 0) {
      ctx.fillStyle = CONFIG.COLORS.WARNING;
      ctx.font = `bold 16px ${F}`;
      ctx.fillText('NEW HIGH SCORE!', w / 2, h / 2 + 40);
    }

    // Stats
    if (stats) {
      const sy = h / 2 + 65;
      ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
      ctx.font = `13px ${F}`;
      const statLine = `Kills: ${stats.kills}  |  Waves: ${stats.wavesCleared}  |  Powerups: ${stats.powerups}`;
      ctx.fillText(statLine, w / 2, sy);
    }

    // Restart prompt
    if (Math.sin(Date.now() / 500) > 0) {
      ctx.fillStyle = CONFIG.COLORS.TEXT;
      ctx.font = `18px ${F}`;
      ctx.fillText('> Click to restart _', w / 2, h / 2 + 110);
    }
  }

  drawWaveAnnouncement(text, alpha) {
    const ctx = this.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = `bold 32px ${F}`;
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

    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ef4444';
    ctx.font = `bold 36px ${F}`;
    ctx.textAlign = 'center';
    ctx.fillText('WARNING: BOSS INCOMING', w / 2, h / 2 - 20);

    ctx.font = `18px ${F}`;
    ctx.fillText('ChatGPT has entered the chat', w / 2, h / 2 + 20);

    ctx.restore();
  }

  drawLevelComplete(score, stats) {
    const ctx = this.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;

    ctx.fillStyle = CONFIG.COLORS.OVERLAY_BG;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = CONFIG.COLORS.HP_FULL;
    ctx.font = `bold 16px ${F}`;
    ctx.textAlign = 'center';
    ctx.fillText('// git push --force', w / 2, h / 2 - 110);

    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = `bold 42px ${F}`;
    ctx.fillText('LEVEL COMPLETE!', w / 2, h / 2 - 60);

    ctx.font = `24px ${F}`;
    ctx.fillText(`Score: ${score}`, w / 2, h / 2 - 15);

    // Stats
    if (stats) {
      ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
      ctx.font = `13px ${F}`;
      const statLine = `Kills: ${stats.kills}  |  Waves: ${stats.wavesCleared}  |  Powerups: ${stats.powerups}`;
      ctx.fillText(statLine, w / 2, h / 2 + 15);
    }

    ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
    ctx.font = `16px ${F}`;
    ctx.fillText('The no-code invasion has been stopped...', w / 2, h / 2 + 50);
    ctx.fillText('...for now.', w / 2, h / 2 + 75);

    if (Math.sin(Date.now() / 500) > 0) {
      ctx.fillStyle = CONFIG.COLORS.TEXT;
      ctx.font = `18px ${F}`;
      ctx.fillText('> Click to play again _', w / 2, h / 2 + 120);
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
