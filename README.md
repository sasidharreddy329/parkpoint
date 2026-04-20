# ParkPoint

ParkPoint is a Vite + React + TypeScript parking platform with Supabase-backed authentication, parking discovery, bookings, owner management, and reviews.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env
```

3. Fill in these values in `.env`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_ROUTER_MODE=browser
```

4. Start development:

```bash
npm run dev
```

## Build

```bash
npm run build
```

The output is generated in `dist/`.

## Deploy

### Render

- This repo includes `render.yaml`.
- Render build command: `npm ci && npm run build`
- Publish directory: `dist`
- Add environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_ROUTER_MODE=browser`

### GitHub Pages

- This repo includes `.github/workflows/deploy-github-pages.yml`.
- Add these GitHub repository secrets:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- The workflow builds with `VITE_ROUTER_MODE=hash`, which avoids SPA refresh issues on GitHub Pages.
- In GitHub repository settings, enable Pages and set the source to `GitHub Actions`.

### Other static hosts

Use:

- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_ROUTER_MODE=browser`

If the host does not support SPA rewrites, set `VITE_ROUTER_MODE=hash` instead.
