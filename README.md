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

## Getting started

Requires **Node.js 20.19+ or 22.12+** (see `.nvmrc`). Vite 7 warns on older Node versions.

```bash
cp .env.example .env
npm install
npm run dev
```

Open the home page and use **Test API** to confirm cocktail API connectivity.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build + typecheck |
| `npm run test:unit` | Unit tests |
| `npm run lint` | ESLint (with fix) |
| `npm run format` | Prettier on `src/` |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_COCKTAIL_API_BASE_URL` | No | Default `https://www.thecocktaildb.com/api/json/v2` |
| `VITE_COCKTAIL_API_KEY` | For v1 parity | Patreon API key (path segment). Omit to use public v1 test tier (single-ingredient only). |
| `VITE_SUPABASE_URL` | Phase 2+ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Phase 2+ | Supabase anon key |

**Never** put LLM API keys in client env vars.

## Project structure

```text
src/
  components/     # shared UI and layout
  features/       # cabinet, cocktails, conversation (Phase 1+)
  pages/          # route views
  services/       # cocktailApi, ranking, ai
  stores/         # Pinia
  types/          # domain models
docs/             # api-contract, evolution (later)
tests/unit/       # Vitest
```

## Status

**Phase 1** — cabinet input, discovery, ranking, recipe card (no AI yet). Run `npm run dev`, add ingredients, **Shake it**.

**Phase 0** — foundation scaffold, API client, design tokens.

Original app: [PaulWheatcroft/theCocktailShaker](https://github.com/PaulWheatcroft/theCocktailShaker) (live on [GitHub Pages](https://paulwheatcroft.github.io/theCocktailShaker/)). This repo does not modify it.
