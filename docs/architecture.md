# Architecture — LLM Hunter

## Overview

```
┌─────────────────────────────────────────────────────┐
│                    index.html                        │
│                   <canvas id="game">                 │
└──────────────────────┬──────────────────────────────┘
                       │
                  bundle.js (esbuild)
                       │
              ┌────────┴────────┐
              │     main.js      │  ← Game state, collisions, spawning
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────┴────┐   ┌─────┴─────┐  ┌────┴────┐
   │  Engine  │   │  Renderer │  │  Input  │
   │ (loop)   │   │ (canvas)  │  │ (mouse) │
   └─────────┘   └───────────┘  └─────────┘
        │
        │ update(dt) / render(alpha)
        │
   ┌────┴──────────────────────────┐
   │         Game Entities          │
   ├────────────┬──────────────────┤
   │ Player     │ Enemy / Boss     │
   │ Projectile │ PowerUp          │
   └────────────┴──────────────────┘
        │
   ┌────┴────┐
   │  Data   │  ← enemies.js, levels.js
   └────────┘
   ┌────┴────┐
   │ Config  │  ← config.js (all constants)
   └─────────┘
```

## Components

### Engine (`game/engine.js`)
Fixed timestep game loop at 60 FPS. Separates update (logic) from render (graphics). Protects against "spiral of death" with max accumulator cap.

### Renderer (`game/renderer.js`)
Canvas 2D wrapper. Handles resize, clearing, basic draw primitives (circle, text, glow). Draws the subtle grid background.

### Input (`game/input.js`)
Tracks mouse position and clicks. Supports basic touch events for mobile.

### Player (`game/player.js`)
The vibe coder avatar. Follows mouse cursor. Auto-shoots code symbols at nearest enemy. Has HP, invulnerability frames after hit, speed boost state.

### Enemy (`game/enemy.js`)
Regular enemies. Move toward player. Each has name, HP, speed, points, visual properties. Flash white on hit. Show HP bar when damaged.

### Boss (`game/boss.js`)
Extended enemy with: shooting back at player ("prompts"), phrase bubbles ("As an AI..."), glow aura, larger size.

### Projectile (`game/projectile.js`)
Code symbols (`{}`, `</>`, etc.) that fly toward enemies. Color-coded like syntax highlighting.

### PowerUp (`game/powerup.js`)
Items dropped by killed enemies: Coffee (fire rate), Stack Overflow (AOE), Git Revert (+HP). Bob animation, blink before expiring.

### UI (`game/ui.js`)
HUD (HP hearts, score, wave counter), start screen, game over, wave announcements, boss warning, level complete.

## Data Flow

1. `Engine` calls `update(dt)` 60 times/sec
2. `update()` moves player toward mouse, spawns enemies, moves entities
3. Collision detection: projectile↔enemy, enemy↔player, powerup↔player, boss projectile↔player
4. Dead entities removed, score updated, powerups applied
5. `Engine` calls `render()` each frame
6. All entities draw themselves via `render(ctx)`
7. UI overlays drawn on top

## State Machine

```
MENU → (click) → WAVE_ANNOUNCE → PLAYING → ... → BOSS_WARNING → PLAYING (boss) → LEVEL_COMPLETE
                                    ↓                                                    ↓
                                GAME_OVER ← (hp=0)                                    MENU
                                    ↓
                                  MENU ← (click)
```

## Key Decisions

- **Vanilla JS** — no framework overhead, zero dependencies, maximum portability
- **Fixed timestep** — consistent physics regardless of frame rate
- **Circle collision** — simple, fast, good enough for this game type
- **config.js** — all balance numbers in one file for easy tuning
- **esbuild** — fastest bundler, minimal config
