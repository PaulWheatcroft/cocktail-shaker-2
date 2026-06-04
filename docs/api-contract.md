# Cocktail API contract

**Status:** Verified against [theCocktailShaker v1](https://github.com/PaulWheatcroft/theCocktailShaker) (`scripts/getIngredients.js`, live [GitHub Pages](https://paulwheatcroft.github.io/theCocktailShaker/)).

## Source

| Item | Value |
|------|--------|
| Provider | [TheCocktailDB](https://www.thecocktaildb.com/api.php) |
| Tier used in v1 | **Paid Patreon** — API key embedded in URL path |
| v1 base pattern | `https://www.thecocktaildb.com/api/json/v2/{API_KEY}/` |
| Client transport | Browser `XMLHttpRequest` / `fetch` (no server proxy) |

## Configuration (successor app)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_COCKTAIL_API_BASE_URL` | No | Default `https://www.thecocktaildb.com/api/json/v2` |
| `VITE_COCKTAIL_API_KEY` | **Yes for v1 parity** | Patreon API key (path segment). Without it, client falls back to public **v1** test tier (`/api/json/v1/1`) — single-ingredient `filter.php` only. |

Do not commit your API key. v1 historically shipped a key in public source; rotate via Patreon if concerned.

## Endpoints (v1 parity)

### 1. Ingredient catalogue

```http
GET {root}/list.php?i=list
```

Used on load for autocomplete; v1 builds an uppercase validation list from `drinks[].strIngredient1`.

**Client:** `fetchIngredientCatalog()`

### 2. Filter by ingredient(s)

```http
GET {root}/filter.php?i={ingredient}
GET {root}/filter.php?i={first},{second}
```

| Case | v1 behaviour |
|------|----------------|
| One ingredient | `filter.php?i=${firstIngredient}` — value as entered in input |
| Two ingredients | Comma-separated, no spaces: `filter.php?i=gin,vodka` (paid multi-filter) |
| Max inputs | **2** (UX decision — 3+ often returned no results in testing) |

Response: `drinks` array of short records (`idDrink`, `strDrink`, `strDrinkThumb`). Navigate with index.

**Known API quirk (v1):** Some ingredients return entries where `strDrink` is `undefined`. v1 treats that as “no cocktails” and offers fallback search with one ingredient only.

**Client:** `fetchCocktailsByIngredient()`, `fetchCocktailsByIngredients()`

### 3. Lookup full recipe (instructions)

```http
GET {root}/lookup.php?i={idDrink}
```

Called when user opens instructions. v1 reads:

- `strDrink`, `strInstructions`, `strDrinkThumb`
- `strIngredient1`–`strIngredient15` and `strMeasure1`–`strMeasure15` (paired in UI; undefined measures allowed)

**Client:** `fetchCocktailById()`

### 4. Random selection (“surprise me”)

```http
GET {root}/randomselection.php
```

Returns a batch (v1 navigates ~10 cocktails). Used on `random.html` only.

**Client:** `fetchRandomSelection()` — Phase 1+ feature page

## v1 UI fields displayed

| Step | Fields |
|------|--------|
| Browse cocktails | `strDrink`, `strDrinkThumb`, `idDrink` (hidden, for lookup/email) |
| Instructions | ingredient + measure pairs, `strInstructions` |
| Email | name, ingredients text, instructions (via `localStorage`) |

## Multi-ingredient strategy (successor Phase 1)

Match v1 first, then extend for larger cabinets:

1. **1–2 ingredients:** single `filter.php` call with comma join (requires paid key).
2. **3+ ingredients (successor):** not in v1 — either cap at 2 for parity mode or fall back to per-ingredient filter + merge + rank (document choice in Phase 1).

## Error behaviour

| Condition | App handling |
|-----------|----------------|
| Network failure | `CocktailApiError` `network` |
| Non-JSON | `malformed` |
| `drinks: null` or empty | Empty list / v1-style fallback copy |
| `strDrink` undefined on entry | Treat as no results (v1 parity) |
| Misspelled ingredient | v1 validates against catalogue — successor should reuse catalogue |

## Domain field mapping

Maps lookup response → internal [`Cocktail`](../src/types/domain.ts) (Phase 1 `toCocktail`):

| Domain field | Source | Rule |
|--------------|--------|------|
| `id` | `idDrink` | string |
| `name` | `strDrink` | required |
| `category` | `strCategory` | optional |
| `alcoholic` | `strAlcoholic` | `true` if `"Alcoholic"` |
| `glass` | `strGlass` | optional |
| `instructions` | `strInstructions` | optional |
| `image` | `strDrinkThumb` | optional |
| `ingredients[]` | `strIngredient1..15` + `strMeasure1..15` | pair non-null ingredients |
| `tags` | `strTags` | split on `,` |
| `baseSpirit` | derived | Phase 1 rules |
| `style[]` | derived | Phase 1 rules |

## Types

[`src/services/cocktailApi/types.raw.ts`](../src/services/cocktailApi/types.raw.ts)

## Verification checklist

- [x] Base URL and API version (`v2` + key)
- [x] Endpoints: `list`, `filter`, `lookup`, `randomselection`
- [x] Ingredient input: as typed; validated against catalogue (uppercase in v1)
- [x] Two-ingredient comma filter
- [x] Fields shown in v1 UI
- [x] Empty/`undefined` drink handling documented
