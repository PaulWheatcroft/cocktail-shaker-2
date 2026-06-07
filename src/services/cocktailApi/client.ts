/// <reference types="vite/client" />

import type {
  CocktailDbDrink,
  CocktailDbFilterResponse,
  CocktailDbIngredientListResponse,
  CocktailDbLookupResponse,
} from './types.raw'
import { CocktailApiError } from './types.raw'

const DEFAULT_V2_BASE = 'https://www.thecocktaildb.com/api/json/v2'
const PUBLIC_V1_ROOT = 'https://www.thecocktaildb.com/api/json/v1/1'

/**
 * Resolves API root for v2 Patreon calls, e.g.
 * https://www.thecocktaildb.com/api/json/v2/9973533
 */
export function getApiRoot(): string {
  const base = (import.meta.env.VITE_COCKTAIL_API_BASE_URL?.trim() || DEFAULT_V2_BASE).replace(
    /\/$/,
    '',
  )
  // Base may already include the key: .../v2/9973533
  if (/\/v2\/[^/]+$/.test(base)) {
    return base
  }

  const key = import.meta.env.VITE_COCKTAIL_API_KEY?.trim()
  if (key) {
    return `${base}/${key}`
  }
  return PUBLIC_V1_ROOT
}

/** True when Patreon v2 API is available (key in env or embedded in base URL). */
export function hasPatreonApiKey(): boolean {
  if (import.meta.env.VITE_COCKTAIL_API_KEY?.trim()) {
    return true
  }
  const base = (import.meta.env.VITE_COCKTAIL_API_BASE_URL?.trim() || DEFAULT_V2_BASE).replace(
    /\/$/,
    '',
  )
  return /\/v2\/[^/]+$/.test(base)
}

/** @deprecated Prefer hasPatreonApiKey — name reflects paid tier, not v1 test API. */
export function usesV1ParityTier(): boolean {
  return hasPatreonApiKey()
}

const filterCache = new Map<string, CocktailDbDrink[]>()

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchJson<T>(path: string, attempt = 0): Promise<T> {
  const url = `${getApiRoot()}/${path.replace(/^\//, '')}`
  let response: Response
  try {
    response = await fetch(url)
  } catch (cause) {
    throw new CocktailApiError('Could not reach the cocktail API.', 'network', cause)
  }

  if (response.status === 429 && attempt < 1) {
    await sleep(2000)
    return fetchJson<T>(path, attempt + 1)
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new CocktailApiError(
        'The cocktail API is rate-limited. Wait a minute and try again.',
        'rate_limit',
      )
    }
    throw new CocktailApiError(`Cocktail API returned ${response.status}.`, 'network')
  }

  try {
    return (await response.json()) as T
  } catch (cause) {
    throw new CocktailApiError('Cocktail API returned invalid JSON.', 'malformed', cause)
  }
}

export function clearFilterCache(): void {
  filterCache.clear()
}

function parseFilterDrinks(drinks: CocktailDbFilterResponse['drinks']): CocktailDbDrink[] {
  if (!drinks?.length) {
    return []
  }
  return drinks.filter(
    (d): d is CocktailDbDrink =>
      d !== null && Boolean(d.idDrink) && typeof d.strDrink === 'string' && d.strDrink.length > 0,
  )
}

/** TheCocktailDB filter uses underscores for spaces (see api-contract multi-ingredient examples). */
function formatFilterIngredient(name: string): string {
  return name.trim().replace(/\s+/g, '_')
}

function buildSingleFilterPath(ingredient: string): string {
  return `filter.php?i=${encodeURIComponent(formatFilterIngredient(ingredient))}`
}

function buildDualFilterPath(first: string, second: string): string {
  return `filter.php?i=${formatFilterIngredient(first)},${formatFilterIngredient(second)}`
}

/**
 * Full ingredient list for autocomplete / validation (v1: list.php?i=list).
 */
export async function fetchIngredientCatalog(): Promise<string[]> {
  const data = await fetchJson<CocktailDbIngredientListResponse>('list.php?i=list')
  const rows = data.drinks
  if (!rows?.length) {
    return []
  }
  return rows
    .map((row) => row?.strIngredient1?.trim())
    .filter((name): name is string => Boolean(name))
}

/**
 * Filter by a single ingredient (v1 single-input flow).
 * Passes ingredient as entered — v1 does not force capitalization in the URL.
 */
/**
 * Filter by a single ingredient (v1: filter.php?i={ingredient}).
 */
export async function fetchCocktailsByIngredient(ingredient: string): Promise<CocktailDbDrink[]> {
  const trimmed = ingredient.trim()
  if (!trimmed) {
    return []
  }

  const cacheKey = `1:${formatFilterIngredient(trimmed)}`
  const cached = filterCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const data = await fetchJson<CocktailDbFilterResponse>(buildSingleFilterPath(trimmed))
  const drinks = parseFilterDrinks(data.drinks)
  filterCache.set(cacheKey, drinks)
  return drinks
}

/**
 * Filter by one or two ingredients (v1: comma-separated for two).
 */
export async function fetchCocktailsByIngredients(
  ingredients: string[],
): Promise<CocktailDbDrink[]> {
  const cleaned = ingredients.map((i) => i.trim()).filter(Boolean)

  if (cleaned.length === 0) {
    return []
  }

  if (cleaned.length === 1) {
    return fetchCocktailsByIngredient(cleaned[0]!)
  }

  if (cleaned.length > 2) {
    throw new CocktailApiError('At most two ingredients per filter request (v1 parity).', 'malformed')
  }

  if (!hasPatreonApiKey()) {
    throw new CocktailApiError(
      'Multi-ingredient filter requires VITE_COCKTAIL_API_KEY (Patreon v2 API).',
      'malformed',
    )
  }

  const cacheKey = `2:${formatFilterIngredient(cleaned[0]!)},${formatFilterIngredient(cleaned[1]!)}`
  const cached = filterCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const data = await fetchJson<CocktailDbFilterResponse>(
    buildDualFilterPath(cleaned[0]!, cleaned[1]!),
  )
  const drinks = parseFilterDrinks(data.drinks)
  filterCache.set(cacheKey, drinks)
  return drinks
}

/**
 * Random batch for “surprise me” (v1: randomselection.php).
 */
export async function fetchRandomSelection(): Promise<CocktailDbDrink[]> {
  if (!usesV1ParityTier()) {
    throw new CocktailApiError(
      'Random selection requires VITE_COCKTAIL_API_KEY (Patreon v2 API).',
      'malformed',
    )
  }
  const data = await fetchJson<CocktailDbFilterResponse>('randomselection.php')
  return parseFilterDrinks(data.drinks)
}

/**
 * Full recipe lookup by drink id (v1: getHow → lookup.php?i=).
 */
export async function fetchCocktailById(id: string): Promise<CocktailDbDrink | null> {
  const data = await fetchJson<CocktailDbLookupResponse>(
    `lookup.php?i=${encodeURIComponent(id)}`,
  )
  const drink = data.drinks?.[0] ?? null
  if (!drink?.idDrink) {
    return null
  }
  return drink
}
