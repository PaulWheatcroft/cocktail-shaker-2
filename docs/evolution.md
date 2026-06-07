# Evolution: Cocktail Shaker → Cocktail Shaker 2

## Original app ([theCocktailShaker](https://github.com/PaulWheatcroft/theCocktailShaker))

- Ingredient-led discovery against TheCocktailDB Patreon API
- Browse filter results, open **one** recipe at a time via `lookup.php`
- No AI layer — utility-first portfolio piece

## Successor goals

1. **Keep the utility** — same API contract, deterministic ranking in the app
2. **Add personality** — hostess presents pre-ranked candidates; she does not invent recipes
3. **Show architectural discipline** — hybrid flow: API truth → normalize → rank → LLM presentation only

## What changed

| Layer | v1 | v2 |
|-------|----|----|
| Stack | Vanilla JS | Vue 3, TypeScript, Pinia, Vite |
| Ranking | API order / browse | Weighted score (coverage, style, house prefs, substitutions) |
| AI | — | Supabase Edge `recommend`, schema-validated JSON, fallback |
| Persistence | `localStorage` (email helper) | `localStorage` + optional Supabase sync (cabinet, favourites, prefs) |
| Auth | — | Optional magic link |

## What stayed the same

- TheCocktailDB as recipe source of truth
- Max **two** active ingredients per shake (v1 parity)
- Dual-ingredient empty → fallback to first-only / second-only filter
- Recipe card shows structured ingredients and API instructions

## Portfolio framing

Cocktail Shaker 2 is not a chatbot wrapper: shake → ranked cards → hostess commentary on **those** candidates. The recipe card remains grounded in API data the user can verify.
