# LLM Hunter — Project Rules

## Overview
Browser arcade game (Vampire Survivors style). Vibe coder vs AI tools.

## Stack
- Vanilla JavaScript (ES6 modules)
- HTML5 Canvas 2D
- esbuild bundler
- GitHub Pages (auto-deploy from main)

## Commands
```bash
npm run dev     # Dev server with watch
npm run build   # Production build
npm run preview # Preview build locally
```

## Structure
- `src/config.js` — ALL constants (balance, colors, sizes)
- `src/game/` — engine, entities, rendering
- `src/data/` — enemy/level definitions
- `public/` — static files + build output
- `docs/` — architecture, setup, changelog

## Rules
- All balance numbers → `config.js`
- One file = one class/responsibility
- Entity classes must have `update(dt)` and `render(ctx)` methods
- No runtime dependencies (vanilla JS only)
- Commit before adding new features
- Test in browser before push

## Deploy
Push to `main` → GitHub Actions → GitHub Pages
URL: https://andrey-dev-ai.github.io/llm-hunter/
