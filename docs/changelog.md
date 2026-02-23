# Changelog

## v0.3.0 (2026-02-23) — Consilium Polish Pass

### Bugs Fixed (#46)
- Fix double announceTimer decrement in BOSS_WARNING (was 2x speed)
- Contact kills now award score, kills stat, and powerup drops
- waveProgress shows 100% during boss warning phase

### Balance (#47)
- maxStacks caps: damage 2, speed 2, HP 3 (prevent infinite stacking)
- Wave 2 aggressiveness: spawnInterval 0.7→0.5s, +6 chase enemies, orbit speed +30%
- Boss projectile speed 300→380, enrage spread angle 0.3→0.5 rad

### Visual Polish (#48, #49, #50, #53)
- Boss projectiles: trail (3 ghost images), larger glow, pulsating radius, font 18px with outline
- Dash enemy telegraph: 0.3s red glow ring warning before dash attack
- Green color separation: 5 greens → distinct colors (progress=blue, heal=pink, reward=gold)
- Floating text hierarchy: tiered by significance (damage 10px/0.4s → boss +500 28px/peach/outline)
- Edge spawn indicators: colored dot + pulsing ring at screen edge on enemy spawn
- Background radial vignette: edges darkened 40% for visual focus

### UX Improvements (#51, #52, #54)
- Upgrade cards: responsive width (220px), word-wrap, ACCENT name color, hover glow shadow
- CTA pulse: smooth alpha 0.4→1.0 (always visible), replaced binary blink
- Screen fade-in transitions: 250ms overlay fade for Game Over, Level Complete, Upgrade
- HP compact mode: hearts shrink at maxHP>10, falls back to heart+number display

## v0.2.0 (2026-02-22) — Visual Identity

### Added
- JetBrains Mono font system (Google Fonts)
- Catppuccin Mocha palette with identity colors (green/red)
- Enemy shapes by tier: roundRect (chase), hexagon (orbit), octagon (dash)
- Spawn animation with bounce easing (300ms)
- Screen shake (3 levels), hitstop (3 tiers), knockback system
- Projectile trails (4 ghost images)
- Kill VFX: death animation, vignette flash on powerup/boss kills
- Game Over chromatic aberration + strikethrough on death message
- Boss visual: rotating symbol ring, HP bar with text, charge telegraph glow
- Powerup differentiation: Coffee roundRect, SO pulsing AOE ring, Git Revert pink cross
- Boss warning non-blocking (under HUD)

## v0.1.0 (2026-02-19)

### Added
- Initial MVP release
- 1 level: "No-Code Invasion" with 3 waves + ChatGPT boss
- Player: vibe coder avatar (glasses + headphones), mouse control, auto-shoot
- 15 enemy types across 3 waves (no-code, automation, AI coding tools)
- Boss: ChatGPT with phrase bubbles and counter-attack
- 3 power-ups: Coffee (fire rate), Stack Overflow (AOE), Git Revert (+HP)
- Code symbol projectiles: `{}`, `</>`, `()`, `;;`, `//`
- HUD: HP hearts, score, wave counter
- Start screen, Game Over, Level Complete screens
- Particle effects on hit/death
- High score saved to localStorage
- Light minimalist visual style with grid background
- GitHub Pages deployment via GitHub Actions
- Full documentation: README, architecture, setup, changelog, design doc
