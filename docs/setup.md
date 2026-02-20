# Setup — LLM Hunter

## Requirements

- Node.js 18+
- npm

## Install

```bash
git clone https://github.com/andrey-dev-ai/llm-hunter.git
cd llm-hunter
npm install
```

## Development

```bash
npm run dev
```

Opens esbuild dev server with auto-reload at `http://localhost:8000`.

## Build

```bash
npm run build
```

Outputs minified bundle to `public/dist/bundle.js`.

## Preview production build

```bash
npm run preview
```

Serves the `public/` folder locally.

## Deploy

Push to `main` branch → GitHub Actions automatically builds and deploys to GitHub Pages.

Deploy workflow: `.github/workflows/deploy.yml`

## Environment

No environment variables needed. The game is fully client-side.
