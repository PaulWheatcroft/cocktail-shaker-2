# Bug tracker

Open issues for Cocktail Shaker 2. Close by moving the entry to **Resolved** with date and PR/commit reference.

| ID | Priority | Status | Area |
|----|----------|--------|------|
| *(none open)* | | | |

---

## BUG-001: Single-ingredient shake fails

**Status:** Resolved (2026-06-07)  
**Priority:** P1 (blocks core cabinet → shake flow)  
**Reported:** 2026-06-04  

### Symptoms

- User selects **one** active ingredient and shakes.
- Discovery fails (API error or empty/error state).
- Behaviour suggests the app or API path expects **two** ingredients.

### Expected (v1 parity)

Per [api-contract.md](api-contract.md) and original TheCocktailShaker:

| Active ingredients | Endpoint | URL shape |
|--------------------|----------|-----------|
| **1** | `filter.php` | `GET {root}/filter.php?i={ingredient}` — single value, as entered |
| **2** | `filter.php` | `GET {root}/filter.php?i={first},{second}` — comma-separated, no spaces (Patreon / v2 key) |

Same endpoint for both cases; **not** a separate route for single vs dual. Do **not** use `search.php?i=` for discovery — that returns ingredient metadata, not cocktail shortlists.

Public test tier (`/api/json/v1/1`) supports single-ingredient `filter.php` only; multi-ingredient filter requires `VITE_COCKTAIL_API_KEY`.

### Suspected cause

- [ ] `discover.ts` / `client.ts` always builds a dual-ingredient request (e.g. stray comma, empty second slot).
- [ ] Missing or invalid `VITE_COCKTAIL_API_KEY` while UI allows two ingredients (throws `Multi-ingredient filter requires VITE_COCKTAIL_API_KEY`).
- [ ] Ingredient string mismatch vs catalogue (`filter.php` vs validated name / underscores).
- [ ] Unhandled non-OK API response surfaced as generic failure.

**Code paths:** `src/services/cocktails/discover.ts` (`filterShortlist`), `src/services/cocktailApi/client.ts` (`buildFilterPath`, `fetchCocktailsByIngredients`).

### Fix direction

1. When `cleaned.length === 1`, call `fetchCocktailsByIngredient` explicitly (parity with v1 `getIngredients.js` single-input branch).
2. When `cleaned.length === 2`, use comma-joined `filter.php` only with Patreon key; keep v1 fallback (first-only / second-only) on empty dual result.
3. Add Vitest: single-ingredient URL is `filter.php?i=gin` with no comma; no fetch when dual without key.
4. Manual repro: one chip active → shake → ranked results or clear empty state (not hard API error).

### Notes

- UI correctly allows 1–2 active ingredients (`cabinetStore.canShake`, `CabinetInput` max 2).
- Dual-ingredient empty fallback buttons only show when **two** are active (`HomeView.vue`).

---

## Resolved

### BUG-001 (2026-06-07)

- `discover.ts` calls `fetchCocktailsByIngredient` for one active ingredient; dual path unchanged with first/second fallback.
- `client.ts`: split single vs dual `filter.php` URLs; spaces → underscores; `hasPatreonApiKey()` detects key embedded in `VITE_COCKTAIL_API_BASE_URL`.
- `catalog.ts`: `resolveCatalogIngredient()` supplies catalogue spelling for filter requests.

---

## How to add a bug

1. Copy the template below into **Open issues** (new subsection or table row).
2. Link from [BUILD_PLAN.md](../BUILD_PLAN.md) if it blocks a phase exit criterion.

```markdown
## BUG-00N: Short title

**Status:** Open | **Priority:** P1–P3 | **Reported:** YYYY-MM-DD

### Symptoms
### Expected
### Suspected cause
### Fix direction
```
