import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchCocktailsByIngredient,
  fetchCocktailsByIngredients,
  fetchCocktailById,
  getApiRoot,
  usesV1ParityTier,
} from '@/services/cocktailApi/client'

describe('cocktailApi client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('VITE_COCKTAIL_API_KEY', '')
    vi.stubEnv('VITE_COCKTAIL_API_BASE_URL', '')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('getApiRoot uses public v1 when no Patreon key', () => {
    expect(getApiRoot()).toBe('https://www.thecocktaildb.com/api/json/v1/1')
    expect(usesV1ParityTier()).toBe(false)
  })

  it('getApiRoot uses v2 + key when configured', () => {
    vi.stubEnv('VITE_COCKTAIL_API_KEY', '9973533')
    expect(getApiRoot()).toBe('https://www.thecocktaildb.com/api/json/v2/9973533')
    expect(usesV1ParityTier()).toBe(true)
  })

  it('fetchCocktailsByIngredient returns empty array for blank input', async () => {
    const result = await fetchCocktailsByIngredient('  ')
    expect(result).toEqual([])
    expect(fetch).not.toHaveBeenCalled()
  })

  it('fetchCocktailsByIngredient passes ingredient as entered in URL', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ drinks: [{ idDrink: '1', strDrink: 'Gin Fizz' }] }),
    } as Response)

    await fetchCocktailsByIngredient('gin')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/filter\.php\?i=gin$/),
    )
  })

  it('fetchCocktailsByIngredients joins two ingredients with comma when key set', async () => {
    vi.stubEnv('VITE_COCKTAIL_API_KEY', 'testkey')
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ drinks: [{ idDrink: '1', strDrink: 'Negroni' }] }),
    } as Response)

    await fetchCocktailsByIngredients(['gin', 'Campari'])

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('filter.php?i=gin,Campari'),
    )
  })

  it('fetchCocktailsByIngredients filters null and undefined strDrink entries', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        drinks: [
          { idDrink: '1', strDrink: 'A' },
          { idDrink: '2', strDrink: undefined },
          null,
        ],
      }),
    } as Response)

    const result = await fetchCocktailsByIngredients(['vodka'])
    expect(result).toHaveLength(1)
  })

  it('fetchCocktailById returns null when drinks missing', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ drinks: null }),
    } as Response)

    const result = await fetchCocktailById('999')
    expect(result).toBeNull()
  })
})
