# LLM Hunter — Game Design Document

## Overview

**LLM Hunter** — браузерная 2D мини-игра в стиле Vampire Survivors. Игрок — вайб-кодер, который отстреливается символами кода от наступающих волн AI-инструментов и LLM-моделей.

| Параметр | Значение |
|----------|---------|
| Жанр | Top-down авто-шутер (Vampire Survivors style) |
| Платформа | Браузер (GitHub Pages) |
| Стек | Vanilla JS + HTML5 Canvas + esbuild |
| Управление | Мышка = движение, стрельба автоматическая |
| Визуал | Светлый минимализм |
| Тон | IT-юмор, мемы про вайб-кодинг и AI |
| MVP | 1 уровень, 3 волны + босс |
| Лицензия | MIT |

## Gameplay

### Управление
- **Мышка** — персонаж следует за курсором
- **Автострельба** — снаряды летят в ближайшего врага автоматически
- Больше ничего не нужно

### Игровой цикл
1. Враги появляются с краёв экрана волнами
2. Игрок двигается мышкой, уворачиваясь от врагов
3. Снаряды-код летят в ближайших врагов автоматически
4. Убитые враги дают очки, иногда дропают бонусы
5. После 3 волн — босс
6. Победил босса = прошёл уровень

### Условие проигрыша
HP игрока = 0 (столкновения с врагами снимают HP)

## Player — Аватар разработчика

- **Вид:** Круглая голова в очках + наушники (вид сверху)
- **Поведение:** Следует за курсором мыши, автострельба
- **Снаряды:** Символы кода: `{}`, `</>`, `()`, `;`, `//`
- **HP:** 5 (MVP)
- **Скорость:** Адаптивная (следует за мышкой)

## Enemies — AI-инструменты и LLM-модели

### Уровень 1: "No-Code инвазия" (MVP)

| Волна | Враги | Скорость | HP | Очки | Визуал |
|-------|-------|----------|----|------|--------|
| 1 | Wix, Squarespace, WordPress | Медленно | 1 | 10 | Маленькие круги с текстом |
| 2 | Zapier, Make, n8n | Средне | 2 | 25 | Средние круги |
| 3 | Cursor, Copilot, Bolt, v0 | Быстро | 3 | 50 | Большие круги |
| **Boss** | **ChatGPT** | Средне | 30 | 500 | Большой пульсирующий круг |

### Будущие уровни (post-MVP)

| Уровень | Тема | Босс |
|---------|------|------|
| 2 | "AI-ассистенты" | Copilot |
| 3 | "Модели атакуют" | GPT-4 |
| 4 | "Большие модели" | Claude |
| 5 | "Сингулярность" | AGI / Skynet |

### Поведение врагов
- Появляются с рандомных краёв экрана
- Двигаются к игроку (простая навигация)
- При столкновении с игроком: -1 HP и враг уничтожается
- Босс: стреляет в игрока "промптами", больше HP, медленнее

## Power-ups (бонусы)

Дропаются из убитых врагов с определённой вероятностью:

| Бонус | Эффект | Вероятность |
|-------|--------|------------|
| Coffee | Ускорение стрельбы x2 на 5 сек | 10% |
| Stack Overflow | Урон всем врагам на экране | 3% |
| Git Revert | +1 HP | 5% |

## Visual Design — Светлый минимализм

### Цветовая палитра
- **Фон:** Светло-серый (#f5f5f5) — как пустой редактор
- **Игрок:** Тёмный (#333) с цветными акцентами (очки, наушники)
- **Снаряды:** Цвета syntax highlighting (зелёный, оранжевый, синий)
- **Враги:** Круги с цветами брендов (OpenAI зелёный, Google синий и т.д.)
- **HUD:** Минималистичный, тёмный текст

### UI элементы
- **Сверху слева:** HP (сердечки или полоска)
- **Сверху справа:** Очки + номер волны
- **Центр (при старте):** "Click to start" / название
- **Центр (при смерти):** Game Over + финальный счёт + "Play Again"

## Technical Architecture

### Стек
- **Язык:** JavaScript (ES6 modules)
- **Рендеринг:** HTML5 Canvas 2D
- **Бандлер:** esbuild
- **Звук:** WebAudio API (oscillators, без файлов)
- **Деплой:** GitHub Pages + GitHub Actions

### Game Loop
Fixed timestep (1/60 секунды):
1. `update(dt)` — физика, логика, коллизии
2. `render(alpha)` — отрисовка с интерполяцией

### Система сущностей
Классы с общим интерфейсом:
- `Player` — update(dt), render(ctx)
- `Enemy` — update(dt), render(ctx), takeDamage()
- `Projectile` — update(dt), render(ctx)
- `PowerUp` — update(dt), render(ctx), apply(player)
- `Boss extends Enemy` — дополнительная логика (атака, фазы)

### Конфигурация
Все числовые константы в `config.js`:
- Размеры, скорости, HP
- Cooldown стрельбы
- Интервалы спавна
- Цвета, размеры шрифтов

### Collision Detection
Простая circle-to-circle проверка (расстояние между центрами < сумма радиусов).

## Project Structure

```
llm-hunter/
├── README.md
├── CLAUDE.md
├── LICENSE (MIT)
├── package.json
├── .gitignore
├── .github/workflows/deploy.yml
├── docs/
│   ├── plans/2026-02-19-llm-hunter-design.md
│   ├── architecture.md
│   ├── setup.md
│   └── changelog.md
├── public/
│   ├── index.html
│   └── dist/              # build output
└── src/
    ├── main.js            # Entry point
    ├── config.js          # Все константы
    ├── game/
    │   ├── engine.js      # Game loop
    │   ├── renderer.js    # Canvas rendering
    │   ├── input.js       # Mouse tracking
    │   ├── player.js
    │   ├── enemy.js
    │   ├── projectile.js
    │   ├── powerup.js
    │   ├── boss.js
    │   └── ui.js          # HUD
    ├── data/
    │   ├── enemies.js     # Enemy definitions
    │   └── levels.js      # Level configs
    └── utils/
        ├── vector.js      # 2D math
        └── collision.js   # Hit detection
```

## MVP Scope (v0.1)

### Включено:
- 1 уровень (3 волны + босс)
- Движение мышкой + автострельба
- 3 типа врагов + 1 босс
- 3 бонуса (Coffee, Stack Overflow, Git Revert)
- Очки + HP + номер волны (HUD)
- Экран старта + Game Over с рекордом
- GitHub Pages деплой
- Базовые звуки (WebAudio oscillators)

### НЕ включено (post-MVP):
- Уровни 2-5
- Выбор усилений между волнами
- Таблица рекордов (localStorage)
- Мобильное управление (тач)
- Музыка
- Частицы/эффекты
- PWA (offline)

## Humor & Easter Eggs

- При смерти: "Your code has been deprecated"
- Босс ChatGPT стреляет фразами: "As an AI...", "I can't do that", "Let me help you"
- Бонус Stack Overflow: появляется иконка SO с надписью "Answer found!"
- Coffee бонус: экран слегка ускоряется + звук "☕"
- Враги при появлении могут иметь тултип "No-code is the future!"

## References

Вдохновлялись:
- [Survivor-Bullet-Auto-Shooter-Game](https://github.com/KJLJon/Survivor-Bullet-Auto-Shooter-Game) — структура, game loop, конфиг
- Vampire Survivors — геймплей, прогрессия
- Space Invaders — классика жанра

---

*Дата: 2026-02-19*
*Статус: Утверждён*
