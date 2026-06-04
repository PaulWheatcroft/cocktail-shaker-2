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

/** Resolves API root: v2 + Patreon key when configured, else public v1 test tier. */
export function getApiRoot(): string {
  const base = (import.meta.env.VITE_COCKTAIL_API_BASE_URL?.trim() || DEFAULT_V2_BASE).replace(
    /\/$/,
    '',
  )
  const key = import.meta.env.VITE_COCKTAIL_API_KEY?.trim()
  if (key) {
    return `${base}/${key}`
  }
  return PUBLIC_V1_ROOT
}

export function usesV1ParityTier(): boolean {
  return Boolean(import.meta.env.VITE_COCKTAIL_API_KEY?.trim())
}

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${getApiRoot()}/${path.replace(/^\//, '')}`
  let response: Response
  try {
    response = await fetch(url)
  } catch (cause) {
    throw new CocktailApiError('Could not reach the cocktail API.', 'network', cause)
  }

  if (!response.ok) {
    throw new CocktailApiError(`Cocktail API returned ${response.status}.`, 'network')
  }

  try {
    return (await response.json()) as T
  } catch (cause) {
    throw new CocktailApiError('Cocktail API returned invalid JSON.', 'malformed', cause)
  }
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

function buildFilterPath(ingredients: string[]): string {
  const cleaned = ingredients.map((i) => i.trim()).filter(Boolean)
  if (cleaned.length === 0) {
    return ''
  }
  const param = cleaned
    .slice(0, 2)
    .map((i) => encodeURIComponent(i))
    .join(',')
  return `filter.php?i=${param}`
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
export async function fetchCocktailsByIngredient(ingredient: string): Promise<CocktailDbDrink[]> {
  return fetchCocktailsByIngredients([ingredient])
}

/**
 * Filter by one or two ingredients (v1: comma-separated for two).
 */
export async function fetchCocktailsByIngredients(
  ingredients: string[],
): Promise<CocktailDbDrink[]> {
  const path = buildFilterPath(ingredients)
  if (!path) {
    return []
  }

  if (ingredients.filter((i) => i.trim()).length > 2) {
    throw new CocktailApiError('At most two ingredients per filter request (v1 parity).', 'malformed')
  }

  if (!usesV1ParityTier() && ingredients.filter((i) => i.trim()).length > 1) {
    throw new CocktailApiError(
      'Multi-ingredient filter requires VITE_COCKTAIL_API_KEY (Patreon v2 API).',
      'malformed',
    )
  }

  const data = await fetchJson<CocktailDbFilterResponse>(path)
  return parseFilterDrinks(data.drinks)
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
