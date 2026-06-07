import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as client from '@/services/cocktailApi/client'
import * as catalog from '@/services/cocktailApi/catalog'
import { discoverCocktails, clearDiscoverCache } from '@/services/cocktails/discover'

describe('discoverCocktails', () => {
  beforeEach(() => {
    clearDiscoverCache()
    vi.spyOn(catalog, 'resolveCatalogIngredient').mockImplementation(async (name) => {
      const n = name.trim()
      if (!n) return null
      return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    clearDiscoverCache()
  })

  it('returns error for invalid catalogue ingredient', async () => {
    vi.mocked(catalog.resolveCatalogIngredient).mockResolvedValue(null)
    const result = await discoverCocktails(['fake'], {
      cabinet: ['fake'],
      styleFilters: [],
      houseStrictness: 50,
    })
    expect(result.ranked).toHaveLength(0)
    expect(result.error).toContain('catalogue')
  })

  it('uses single-ingredient filter for one active ingredient', async () => {
    const byIngredient = vi.spyOn(client, 'fetchCocktailsByIngredient').mockResolvedValue([
      { idDrink: '1', strDrink: 'Gin Fizz' },
    ])
    const byIngredients = vi.spyOn(client, 'fetchCocktailsByIngredients')
    vi.spyOn(client, 'fetchCocktailById').mockResolvedValue({
      idDrink: '1',
      strDrink: 'Gin Fizz',
      strIngredient1: 'Gin',
    })

    await discoverCocktails(['gin'], {
      cabinet: ['gin'],
      styleFilters: [],
      houseStrictness: 50,
    })

    expect(byIngredient).toHaveBeenCalledWith('Gin')
    expect(byIngredients).not.toHaveBeenCalled()
  })

  it('hydrates at most 24 filter results to limit lookup calls', async () => {
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn) => {
      fn()
      return 0 as unknown as ReturnType<typeof setTimeout>
    })
    const shortlist = Array.from({ length: 40 }, (_, i) => ({
      idDrink: String(i + 1),
      strDrink: `Drink ${i + 1}`,
    }))
    vi.spyOn(client, 'fetchCocktailsByIngredient').mockResolvedValue(shortlist)
    const lookup = vi.spyOn(client, 'fetchCocktailById').mockImplementation(async (id) => ({
      idDrink: id,
      strDrink: `Drink ${id}`,
      strIngredient1: 'Gin',
    }))

    await discoverCocktails(['gin'], {
      cabinet: ['gin'],
      styleFilters: [],
      houseStrictness: 50,
    })

    expect(lookup).toHaveBeenCalledTimes(24)
    vi.mocked(globalThis.setTimeout).mockRestore()
  })

  it('ranks hydrated cocktails', async () => {
    vi.spyOn(client, 'fetchCocktailsByIngredients').mockResolvedValue([
      { idDrink: '1', strDrink: 'Negroni' },
    ])
    vi.spyOn(client, 'fetchCocktailById').mockResolvedValue({
      idDrink: '1',
      strDrink: 'Negroni',
      strIngredient1: 'Gin',
      strIngredient2: 'Campari',
      strIngredient3: 'Sweet Vermouth',
    })

    const result = await discoverCocktails(['gin', 'campari'], {
      cabinet: ['gin', 'campari'],
      styleFilters: [],
      houseStrictness: 50,
    })

    expect(result.ranked.length).toBeGreaterThan(0)
    expect(result.ranked[0]?.cocktail.name).toBe('Negroni')
  })
})
