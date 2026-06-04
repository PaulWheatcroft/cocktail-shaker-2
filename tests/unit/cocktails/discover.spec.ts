import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as client from '@/services/cocktailApi/client'
import * as catalog from '@/services/cocktailApi/catalog'
import { discoverCocktails } from '@/services/cocktails/discover'

describe('discoverCocktails', () => {
  beforeEach(() => {
    vi.spyOn(catalog, 'validateIngredient').mockResolvedValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns error for invalid catalogue ingredient', async () => {
    vi.mocked(catalog.validateIngredient).mockResolvedValue(false)
    const result = await discoverCocktails(['fake'], {
      cabinet: ['fake'],
      styleFilters: [],
      houseStrictness: 50,
    })
    expect(result.ranked).toHaveLength(0)
    expect(result.error).toContain('catalogue')
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
