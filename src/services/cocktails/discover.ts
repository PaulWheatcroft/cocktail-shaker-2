import {
  fetchCocktailById,
  fetchCocktailsByIngredient,
  fetchCocktailsByIngredients,
} from '@/services/cocktailApi/client'
import type { CocktailDbDrink } from '@/services/cocktailApi/types.raw'
import { CocktailApiError } from '@/services/cocktailApi/types.raw'
import { validateIngredient } from '@/services/cocktailApi/catalog'
import { toCocktail } from '@/services/normalization/toCocktail'
import { rankCandidates } from '@/services/ranking/rankCandidates'
import type { RankContext } from '@/services/ranking/score'
import type { RankedCandidate } from '@/types/domain'

export type FallbackMode = 'first' | 'second' | null

export interface DiscoverResult {
  ranked: RankedCandidate[]
  fallbackMode: FallbackMode
  error?: string
}

const lookupCache = new Map<string, CocktailDbDrink>()
const HYDRATE_CONCURRENCY = 5

async function hydrateCocktails(ids: string[]): Promise<CocktailDbDrink[]> {
  const unique = [...new Set(ids)]
  const results: CocktailDbDrink[] = []

  for (let i = 0; i < unique.length; i += HYDRATE_CONCURRENCY) {
    const batch = unique.slice(i, i + HYDRATE_CONCURRENCY)
    const drinks = await Promise.all(
      batch.map(async (id) => {
        if (lookupCache.has(id)) return lookupCache.get(id)!
        const drink = await fetchCocktailById(id)
        if (drink) lookupCache.set(id, drink)
        return drink
      }),
    )
    for (const d of drinks) {
      if (d) results.push(d)
    }
  }

  return results
}

async function filterShortlist(ingredients: string[]): Promise<{
  drinks: CocktailDbDrink[]
  fallbackMode: FallbackMode
}> {
  const cleaned = ingredients.map((i) => i.trim()).filter(Boolean)
  if (cleaned.length === 0) {
    return { drinks: [], fallbackMode: null }
  }

  const drinks = await fetchCocktailsByIngredients(cleaned)
  if (drinks.length > 0 || cleaned.length === 1) {
    return { drinks, fallbackMode: null }
  }

  const [first, second] = cleaned
  if (!first || !second) {
    return { drinks: [], fallbackMode: null }
  }

  const firstOnly = await fetchCocktailsByIngredient(first)
  if (firstOnly.length > 0) {
    return { drinks: firstOnly, fallbackMode: 'first' }
  }

  const secondOnly = await fetchCocktailsByIngredient(second)
  if (secondOnly.length > 0) {
    return { drinks: secondOnly, fallbackMode: 'second' }
  }

  return { drinks: [], fallbackMode: null }
}

export async function discoverCocktails(
  ingredients: string[],
  context: RankContext,
): Promise<DiscoverResult> {
  const cleaned = ingredients.map((i) => i.trim()).filter(Boolean).slice(0, 2)

  if (cleaned.length === 0) {
    return { ranked: [], fallbackMode: null, error: 'Add at least one ingredient.' }
  }

  for (const ing of cleaned) {
    const valid = await validateIngredient(ing)
    if (!valid) {
      return {
        ranked: [],
        fallbackMode: null,
        error: `"${ing}" is not in the ingredient catalogue.`,
      }
    }
  }

  if (cleaned.length === 2 && cleaned[0]!.toLowerCase() === cleaned[1]!.toLowerCase()) {
    return { ranked: [], fallbackMode: null, error: 'Choose two different ingredients.' }
  }

  try {
    const { drinks: shortlist, fallbackMode } = await filterShortlist(cleaned)
    if (shortlist.length === 0) {
      return { ranked: [], fallbackMode: null }
    }

    const ids = shortlist.map((d) => d.idDrink)
    const full = await hydrateCocktails(ids)
    const cocktails = full.map(toCocktail).filter((c): c is NonNullable<typeof c> => c !== null)

    if (cocktails.length === 0) {
      return { ranked: [], fallbackMode }
    }

    const ranked = rankCandidates(cocktails, context)
    return { ranked, fallbackMode }
  } catch (e) {
    const message =
      e instanceof CocktailApiError
        ? e.message
        : e instanceof Error
          ? e.message
          : 'Discovery failed.'
    return { ranked: [], fallbackMode: null, error: message }
  }
}

export function clearDiscoverCache(): void {
  lookupCache.clear()
}
