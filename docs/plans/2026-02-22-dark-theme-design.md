# Dark Theme — Catppuccin Mocha

## Issue: #22

## Palette

Based on Catppuccin Mocha (IDE/terminal aesthetic for "Vibe Coder" theme).

| Token | Hex | Usage |
|-------|-----|-------|
| Base | `#1e1e2e` | Background, canvas fill |
| Mantle | `#181825` | Overlay bg base |
| Surface0 | `#313244` | HUD panel |
| Surface1 | `#45475a` | HUD border, separators |
| Overlay0 | `#6c7086` | Muted text, comments |
| Text | `#cdd6f4` | Primary text |
| Blue | `#89b4fa` | Accent, progress bar |
| Green | `#a6e3a1` | HP full, success |
| Red | `#f38ba8` | HP low, errors, death |
| Yellow | `#f9e2af` | Warnings, high score |
| Peach | `#fab387` | Power-up accents |
| Grid | `#2a2a3e` | Grid lines |

## Files to Change

### 1. config.js — COLORS object
Replace all color constants with Catppuccin Mocha equivalents.

### 2. index.html — body background
`background: #f5f5f5` → `background: #1e1e2e`

### 3. renderer.js — drawText default
Default text color `#333` → `#cdd6f4`

### 4. ui.js — HUD + Overlays
- HUD_BG: `rgba(255,255,255,0.9)` → `rgba(49,50,68,0.85)`
- HUD border: `#e0e0e0` → `#45475a`
- Overlay bg: `rgba(245,245,245,0.92)` → `rgba(17,17,27,0.92)`
- Empty hearts: `#ddd` → `#45475a`
- Progress bar bg: `#e0e0e0` → `#45475a`
- Code decoration: keep `#e06c75` (already looks good on dark)
- New high score: keep `#f59e0b` → `#f9e2af`
- Boss warning red tint: keep as-is

### 5. enemy.js — shadow + border
- Shadow: `rgba(0,0,0,0.1)` → `rgba(0,0,0,0.3)` (stronger on dark bg)
- Full HP border: `rgba(0,0,0,0.2)` → `rgba(255,255,255,0.15)` (light border on dark)
- HP arc bg: `rgba(0,0,0,0.15)` → `rgba(255,255,255,0.1)`

### NOT changing
- Player colors (skin, hair, glasses) — already dark enough
- Boss colors (#10a37f, red enrage) — work well on dark
- Power-up colors (coffee, SO, git) — already colored
- Enemy body colors — defined per-enemy in enemies.js data

## Decision
Simple palette swap, no structural changes. ~30 min effort.
