# Cocktail Shaker 2

A conversational successor to Cocktail Shaker: ingredient-led discovery grounded in a real cocktail API, with ranking in the app and an opinionated AI hostess for presentation only.

## Design direction

- **Tone:** Refined, private-club hostess — dark background, warm gold accent, serif display + sans body ([`src/styles/main.css`](src/styles/main.css))
- **Typography:** Cormorant Garamond (headings), Source Sans 3 (UI)
- **Layout:** Mobile-first, single-column content, recipe-first (conversation sits above the card in later phases)

## Stack

- Vue 3, TypeScript, Vite, Pinia, Vue Router
- Vitest + ESLint + Prettier
- Supabase (auth, persistence, AI edge function) — from Phase 2 onward
- Cocktail API: [TheCocktailDB](https://www.thecocktaildb.com/) **v2 + Patreon key** (same as [original app](https://github.com/PaulWheatcroft/theCocktailShaker)) — see [`docs/api-contract.md`](docs/api-contract.md)

## Documentation

| Doc | Purpose |
|-----|---------|
| [BUILD_PLAN.md](BUILD_PLAN.md) | Phased implementation plan |
| [prd.md](prd.md) | Product requirements |
| [architecture.md](architecture.md) | System design |
| [mvp.md](mvp.md) | MVP scope |
| [persona.md](persona.md) | Hostess voice |
| [prompt-spec.md](prompt-spec.md) | LLM contract |
| [docs/evolution.md](docs/evolution.md) | v1 → v2 portfolio narrative |

## Getting started

Requires **Node.js 20.19+ or 22.12+** (see `.nvmrc`). Vite 7 warns on older Node versions.

```bash
cp .env.example .env
cp supabase/functions/.env.example supabase/functions/.env.local  # LLM keys for local hostess
npm install
supabase start   # once per session — local API on :54321
npm run dev      # Vite + recommend Edge Function in parallel
```

For local hostess, set `VITE_SUPABASE_URL=http://127.0.0.1:54321` and the anon key from `supabase status` (not your hosted Dashboard key).

**Magic links (local):** emails are captured by [Inbucket](http://127.0.0.1:54324) — not your real inbox. After changing `supabase/config.toml` auth URLs, run `supabase stop && supabase start`.

**Magic links (hosted):** add `http://localhost:5173/` to [Auth → URL Configuration](https://supabase.com/dashboard/project/ljtioikrhovnlthspqua/auth/url-configuration) redirect allow list.

Add ingredients, tap **Shake it** — ranked cocktails, recipe card, and hostess verdict.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + local `recommend` Edge Function (`dev:app`, `dev:functions`) |
| `npm run dev:app` | Vite only |
| `npm run dev:functions` | `supabase functions serve recommend` only |
| `npm run build` | Production build + typecheck |
| `npm run test:unit` | Unit tests |
| `npm run lint` | ESLint (with fix) |
| `npm run format` | Prettier on `src/` |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_COCKTAIL_API_BASE_URL` | No | Default `https://www.thecocktaildb.com/api/json/v2` |
| `VITE_COCKTAIL_API_KEY` | For v1 parity | Patreon API key (path segment). Omit to use public v1 test tier (single-ingredient only). |
| `VITE_SUPABASE_URL` | For hostess | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | For hostess | Supabase publishable/anon key |

**Never** put LLM API keys in `VITE_*` vars. Set `LLM_PROVIDER`, `OPENAI_API_KEY`, `LLM_MODEL` in Supabase Edge secrets.

### Hostess Edge Function

```bash
# One-time: link project (if not done)
supabase link --project-ref YOUR_REF

# Deploy function (uses Dashboard secrets)
supabase functions deploy recommend

# Local function dev — also started by `npm run dev` (requires `supabase start`)
supabase functions serve recommend --env-file supabase/functions/.env.local
```

## Project structure

```text
src/
  components/     # shared UI and layout
  features/       # cabinet, cocktails, conversation (Phase 1+)
  pages/          # route views
  services/       # cocktailApi, ranking, ai
  stores/         # Pinia
  types/          # domain models
docs/             # api-contract, evolution, bugs
supabase/migrations/  # Phase 3 schema + RLS
tests/unit/       # Vitest
```

## Status

**Phase 3** — Supabase schema + RLS, optional magic-link auth, favourites, cabinet/prefs sync, `docs/evolution.md`.

**Phase 2** — AI hostess via `recommend` Edge Function, conversation panel, refinement chips.

**Phase 1** — cabinet input, discovery, ranking, recipe card.

Apply DB migrations (hosted or local):

```bash
supabase db push   # linked hosted project
# or: supabase start && supabase db reset   # local
```

Original app: [PaulWheatcroft/theCocktailShaker](https://github.com/PaulWheatcroft/theCocktailShaker) (live on [GitHub Pages](https://paulwheatcroft.github.io/theCocktailShaker/)). This repo does not modify it.
