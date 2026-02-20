# LLM Hunter

Browser arcade game: you're a **vibe coder** surviving waves of AI tools and LLM models. Vampire Survivors meets vibe coding.

**[Play Now](https://andrey-dev-ai.github.io/llm-hunter/)** | [Design Doc](docs/plans/2026-02-19-llm-hunter-design.md)

## What is this?

You're a developer (with glasses and headphones, of course). AI tools are attacking from all sides — Wix, Cursor, Copilot, ChatGPT... You fight back by auto-shooting code symbols: `{}`, `</>`, `()`, `;;`, `//`.

Survive 3 waves of no-code tools and defeat the ChatGPT boss to win.

## Tech Stack

- **Vanilla JavaScript** (ES6 modules)
- **HTML5 Canvas** 2D rendering
- **esbuild** bundler
- **GitHub Pages** hosting
- Zero runtime dependencies

## Quick Start

```bash
git clone https://github.com/andrey-dev-ai/llm-hunter.git
cd llm-hunter
npm install
npm run dev
```

Open `http://localhost:8000` in your browser.

## How to Play

| Control | Action |
|---------|--------|
| Mouse move | Move your character |
| Auto-fire | Shoots at nearest enemy automatically |

### Power-ups

| Item | Effect |
|------|--------|
| Coffee | Fire rate x2 for 5 seconds |
| Stack Overflow | Damage all enemies on screen |
| Git Revert | Restore +1 HP |

### Enemies

- **Wave 1:** No-code platforms (Wix, WordPress, Squarespace...)
- **Wave 2:** Automation tools (Zapier, Make, n8n...)
- **Wave 3:** AI coding tools (Cursor, Copilot, Bolt, v0...)
- **Boss:** ChatGPT (shoots prompts at you!)

## Project Structure

```
src/
├── main.js           # Game loop, state management
├── config.js         # All constants (balance, colors, sizes)
├── game/
│   ├── engine.js     # Fixed timestep game loop (60fps)
│   ├── renderer.js   # Canvas rendering
│   ├── input.js      # Mouse tracking
│   ├── player.js     # Player (vibe coder avatar)
│   ├── enemy.js      # Regular enemies
│   ├── boss.js       # Boss (ChatGPT)
│   ├── projectile.js # Code symbol bullets
│   ├── powerup.js    # Power-up items
│   └── ui.js         # HUD, menus, overlays
├── data/
│   ├── enemies.js    # Enemy definitions
│   └── levels.js     # Level/wave configs
└── utils/
    ├── vector.js     # 2D math
    └── collision.js  # Hit detection
```

## Adding Content

### New enemy type
Edit `src/data/enemies.js`:
```js
MY_TOOL: { name: 'MyTool', label: 'MT', hp: 2, speed: 80, points: 30, radius: 20, color: '#ff0000' }
```

### New power-up
Edit `src/game/powerup.js` (add type) and `src/main.js` (add effect in `applyPowerUp`).

### Tuning balance
All numbers are in `src/config.js` — HP, speed, fire rate, drop chances.

## Roadmap

- [x] v0.1 — MVP: 1 level, 3 waves + boss
- [ ] v0.2 — Sound effects (WebAudio)
- [ ] v0.3 — Levels 2-5
- [ ] v0.4 — Upgrade selection between waves
- [ ] v0.5 — Local leaderboard
- [ ] v1.0 — Mobile touch controls

## License

MIT

---

Built with code, coffee, and a healthy fear of AGI.
