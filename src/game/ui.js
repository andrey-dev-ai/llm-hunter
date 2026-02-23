import { CONFIG } from '../config.js';

const F = CONFIG.FONT;

/**
 * HUD, overlays, and UI elements
 */

const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : ''
);

// Matrix-style falling code symbols
const CODE_SYMBOLS = ['{', '}', ';', '=', '=>', 'const', 'let', 'if', '()', '</', '/>', '&&', '||', '++', '!=', '[]', '0', '1'];

export class UI {
  constructor(renderer) {
    this.renderer = renderer;
    this.ctx = renderer.ctx;
    this._codeColumns = null; // lazy init for falling code
  }

  _initCodeColumns() {
    const w = this.renderer.width;
    const cols = Math.floor(w / 60); // ~60px per column
    this._codeColumns = [];
    for (let i = 0; i < cols; i++) {
      this._codeColumns.push({
        x: (i + 0.5) * (w / cols),
        y: Math.random() * this.renderer.height,
        speed: 30 + Math.random() * 50,
        chars: Array.from({ length: 6 + Math.floor(Math.random() * 6) }, () =>
          CODE_SYMBOLS[Math.floor(Math.random() * CODE_SYMBOLS.length)]
        ),
      });
    }
  }

  drawHUD(player, score, waveNum, waveTotal, waveProgress) {
    const ctx = this.ctx;
    const w = this.renderer.width;

    // Top bar background
    ctx.fillStyle = CONFIG.COLORS.HUD_BG;
    ctx.fillRect(0, 0, w, 50);
    ctx.fillStyle = CONFIG.COLORS.HUD_BORDER;
    ctx.fillRect(0, 50, w, 1);

    // HP hearts (compact mode for high maxHP)
    const maxHeartArea = w / 3 - 40; // max space before score
    const heartSize = player.maxHp > 10 ? 14 : 20;
    const heartGap = player.maxHp > 10 ? 3 : 6;
    const maxVisible = Math.floor(maxHeartArea / (heartSize + heartGap));

    if (player.maxHp > maxVisible) {
      // Fallback: one heart + numeric display
      this._drawHeart(ctx, 20, 25, 10, player.hp > 0 ? CONFIG.COLORS.HP_FULL : CONFIG.COLORS.HUD_BORDER);
      ctx.fillStyle = CONFIG.COLORS.TEXT;
      ctx.font = `bold 16px ${F}`;
      ctx.textAlign = 'left';
      ctx.fillText(`${player.hp}/${player.maxHp}`, 38, 30);
    } else {
      for (let i = 0; i < player.maxHp; i++) {
        const hx = 20 + i * (heartSize + heartGap);
        const hy = 25;
        if (i < player.hp) {
          this._drawHeart(ctx, hx, hy, heartSize / 2, CONFIG.COLORS.HP_FULL);
        } else {
          this._drawHeart(ctx, hx, hy, heartSize / 2, CONFIG.COLORS.HUD_BORDER);
        }
      }
    }

    // Score
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = `bold 18px ${F}`;
    ctx.textAlign = 'center';
    ctx.fillText(`Score: ${score}`, w / 2, 22);

    // Wave indicator
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = `bold 14px ${F}`;
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
      ctx.fillStyle = CONFIG.COLORS.ACCENT;
      ctx.fillRect(barX, barY, barW * waveProgress, barH);
    }
  }

  drawStartScreen(dt) {
    const ctx = this.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;

    ctx.fillStyle = CONFIG.COLORS.OVERLAY_BG;
    ctx.fillRect(0, 0, w, h);

    // --- Falling code background (Matrix-style) ---
    if (!this._codeColumns) this._initCodeColumns();

    const frameDt = dt || 0.016;
    ctx.font = `13px ${F}`;
    ctx.textAlign = 'center';
    for (const col of this._codeColumns) {
      col.y += col.speed * frameDt;
      if (col.y > h + 100) {
        col.y = -col.chars.length * 22;
        // Refresh symbols
        for (let c = 0; c < col.chars.length; c++) {
          col.chars[c] = CODE_SYMBOLS[Math.floor(Math.random() * CODE_SYMBOLS.length)];
        }
      }
      for (let c = 0; c < col.chars.length; c++) {
        const cy = col.y + c * 22;
        if (cy < -20 || cy > h + 20) continue;
        const fadeFromCenter = Math.abs(cy - h / 2) / (h / 2);
        ctx.globalAlpha = 0.12 + fadeFromCenter * 0.08;
        ctx.fillStyle = CONFIG.COLORS.GRID;
        ctx.fillText(col.chars[c], col.x, cy);
      }
    }
    ctx.globalAlpha = 1;

    // --- Title with glow ---
    ctx.font = `bold 48px ${F}`;
    ctx.textAlign = 'center';
    const titleY = h / 2 - 60;
    const llmW = ctx.measureText('LLM ').width;
    const hunterW = ctx.measureText('Hunter').width;
    const titleStartX = w / 2 - (llmW + hunterW) / 2;
    ctx.textAlign = 'left';

    // "LLM " with blue glow
    ctx.save();
    ctx.shadowColor = CONFIG.COLORS.ACCENT;
    ctx.shadowBlur = 20;
    ctx.fillStyle = CONFIG.COLORS.ACCENT;
    ctx.fillText('LLM ', titleStartX, titleY);
    ctx.restore();

    // "Hunter" with green glow
    ctx.save();
    ctx.shadowColor = CONFIG.COLORS.IDENTITY_GREEN;
    ctx.shadowBlur = 20;
    ctx.fillStyle = CONFIG.COLORS.IDENTITY_GREEN;
    ctx.fillText('Hunter', titleStartX + llmW, titleY);
    ctx.restore();

    ctx.textAlign = 'center';

    // --- Subtitle ---
    ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
    ctx.font = `bold 20px ${F}`;
    ctx.fillText(CONFIG.GAME.SUBTITLE, w / 2, h / 2 - 20);

    // --- Code decoration with syntax highlighting ---
    // while (alive) { shoot(code); }
    ctx.font = `16px ${F}`;
    const codeParts = [
      { text: 'while', color: '#c678dd' },      // keyword — purple
      { text: ' (', color: CONFIG.COLORS.TEXT_LIGHT },
      { text: 'alive', color: '#e06c75' },       // variable — red
      { text: ') { ', color: CONFIG.COLORS.TEXT_LIGHT },
      { text: 'shoot', color: '#61afef' },       // function — blue
      { text: '(', color: CONFIG.COLORS.TEXT_LIGHT },
      { text: 'code', color: '#98c379' },        // string — green
      { text: '); }', color: CONFIG.COLORS.TEXT_LIGHT },
    ];
    // Measure total width for centering
    let totalCodeW = 0;
    for (const part of codeParts) totalCodeW += ctx.measureText(part.text).width;
    let codeX = w / 2 - totalCodeW / 2;
    ctx.textAlign = 'left';
    for (const part of codeParts) {
      ctx.fillStyle = part.color;
      ctx.fillText(part.text, codeX, h / 2 + 20);
      codeX += ctx.measureText(part.text).width;
    }
    ctx.textAlign = 'center';

    // --- CTA (pulsing green — always visible) ---
    const startPulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(Date.now() / 400));
    ctx.save();
    ctx.globalAlpha = startPulse;
    ctx.shadowColor = CONFIG.COLORS.IDENTITY_GREEN;
    ctx.shadowBlur = 10;
    ctx.fillStyle = CONFIG.COLORS.IDENTITY_GREEN;
    ctx.font = `bold 18px ${F}`;
    ctx.fillText('> ' + CONFIG.GAME.START_TEXT + ' _', w / 2, h / 2 + 65);
    ctx.restore();

    // --- Controls hint ---
    ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
    ctx.font = `14px ${F}`;
    ctx.fillText('Mouse = Move  |  Auto-fire = ON', w / 2, h / 2 + 110);

    // --- Mobile warning ---
    if (isMobile) {
      ctx.fillStyle = CONFIG.COLORS.IDENTITY_RED;
      ctx.font = `bold 14px ${F}`;
      ctx.fillText('Best played on desktop with mouse!', w / 2, h / 2 + 140);
    }
  }

  drawGameOver(score, highScore, stats) {
    const ctx = this.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;

    ctx.fillStyle = CONFIG.COLORS.OVERLAY_BG;
    ctx.fillRect(0, 0, w, h);

    // Death message with strikethrough
    ctx.fillStyle = CONFIG.COLORS.HP_LOW;
    ctx.font = `bold 16px ${F}`;
    ctx.textAlign = 'center';
    const deathMsg = '// ' + CONFIG.GAME.DEATH_MESSAGE;
    ctx.fillText(deathMsg, w / 2, h / 2 - 110);
    const msgW = ctx.measureText(deathMsg).width;
    ctx.strokeStyle = CONFIG.COLORS.HP_LOW;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - msgW / 2, h / 2 - 110);
    ctx.lineTo(w / 2 + msgW / 2, h / 2 - 110);
    ctx.stroke();

    // Game Over — chromatic aberration
    ctx.font = `bold 42px ${F}`;
    ctx.textAlign = 'center';
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ff0000';
    ctx.fillText('GAME OVER', w / 2 + 2, h / 2 - 60 + 1);
    ctx.fillStyle = '#0088ff';
    ctx.fillText('GAME OVER', w / 2 - 2, h / 2 - 60 - 1);
    ctx.restore();
    ctx.fillStyle = CONFIG.COLORS.IDENTITY_RED;
    ctx.fillText('GAME OVER', w / 2, h / 2 - 60);

    // Score
    ctx.fillStyle = CONFIG.COLORS.TEXT;
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
      ctx.fillStyle = CONFIG.COLORS.REWARD_GOLD;
      ctx.font = `bold 16px ${F}`;
      ctx.fillText('NEW HIGH SCORE!', w / 2, h / 2 + 40);
    }

    // Stats
    if (stats) {
      const sy = h / 2 + 65;
      ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
      ctx.font = `bold 15px ${F}`;
      const statLine = `Kills: ${stats.kills}  |  Waves: ${stats.wavesCleared}  |  Powerups: ${stats.powerups}`;
      ctx.fillText(statLine, w / 2, sy);
    }

    // Restart prompt (pulsing — always visible)
    const restartPulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(Date.now() / 400));
    ctx.save();
    ctx.globalAlpha = restartPulse;
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = `18px ${F}`;
    ctx.fillText('> Click to restart _', w / 2, h / 2 + 110);
    ctx.restore();
  }

  drawWaveAnnouncement(text, alpha) {
    const ctx = this.ctx;
    const w = this.renderer.width;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Background strip under HUD
    ctx.fillStyle = 'rgba(17,17,27,0.7)';
    ctx.fillRect(0, 55, w, 44);

    // Wave text
    ctx.fillStyle = CONFIG.COLORS.IDENTITY_GREEN;
    ctx.font = `bold 24px ${F}`;
    ctx.textAlign = 'center';
    ctx.fillText(text, w / 2, 82);

    ctx.restore();
  }

  drawBossWarning(alpha) {
    const ctx = this.ctx;
    const w = this.renderer.width;
    const h = this.renderer.height;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Subtle red tint on full screen
    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
    ctx.fillRect(0, 0, w, h);

    // Background strip under HUD
    ctx.fillStyle = 'rgba(17,17,27,0.8)';
    ctx.fillRect(0, 55, w, 52);

    ctx.fillStyle = CONFIG.COLORS.IDENTITY_RED;
    ctx.font = `bold 24px ${F}`;
    ctx.textAlign = 'center';
    ctx.fillText('WARNING: BOSS INCOMING', w / 2, 78);

    ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
    ctx.font = `14px ${F}`;
    ctx.fillText('ChatGPT has entered the chat', w / 2, 98);

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

    ctx.fillStyle = CONFIG.COLORS.REWARD_GOLD;
    ctx.font = `bold 42px ${F}`;
    ctx.fillText('LEVEL COMPLETE!', w / 2, h / 2 - 60);

    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = `24px ${F}`;
    ctx.fillText(`Score: ${score}`, w / 2, h / 2 - 15);

    // Stats
    if (stats) {
      ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
      ctx.font = `bold 15px ${F}`;
      const statLine = `Kills: ${stats.kills}  |  Waves: ${stats.wavesCleared}  |  Powerups: ${stats.powerups}`;
      ctx.fillText(statLine, w / 2, h / 2 + 15);
    }

    ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
    ctx.font = `16px ${F}`;
    ctx.fillText('The no-code invasion has been stopped...', w / 2, h / 2 + 50);
    ctx.fillText('...for now.', w / 2, h / 2 + 75);

    const againPulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(Date.now() / 400));
    ctx.save();
    ctx.globalAlpha = againPulse;
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = `18px ${F}`;
    ctx.fillText('> Click to play again _', w / 2, h / 2 + 120);
    ctx.restore();
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
