import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  clearFilterCache,
  fetchCocktailsByIngredient,
  fetchCocktailsByIngredients,
  fetchCocktailById,
  getApiRoot,
  hasPatreonApiKey,
  usesV1ParityTier,
} from '@/services/cocktailApi/client'
import { CocktailApiError } from '@/services/cocktailApi/types.raw'

describe('cocktailApi client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('VITE_COCKTAIL_API_KEY', '')
    vi.stubEnv('VITE_COCKTAIL_API_BASE_URL', '')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    clearFilterCache()
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

  it('getApiRoot accepts full v2 path in base URL without duplicating key', () => {
    vi.stubEnv('VITE_COCKTAIL_API_BASE_URL', 'https://www.thecocktaildb.com/api/json/v2/9973533')
    vi.stubEnv('VITE_COCKTAIL_API_KEY', '')
    expect(getApiRoot()).toBe('https://www.thecocktaildb.com/api/json/v2/9973533')
    expect(hasPatreonApiKey()).toBe(true)
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

  it('fetchCocktailsByIngredient encodes spaces as underscores', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ drinks: [{ idDrink: '1', strDrink: 'Manhattan' }] }),
    } as Response)

    await fetchCocktailsByIngredient('Sweet Vermouth')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/filter\.php\?i=Sweet_Vermouth$/),
    )
  })

  it('fetchCocktailsByIngredients allows single ingredient without Patreon key', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ drinks: [{ idDrink: '1', strDrink: 'Gin Fizz' }] }),
    } as Response)

    await fetchCocktailsByIngredients(['gin'])

    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/filter\.php\?i=gin$/))
  })

  it('fetchCocktailsByIngredients rejects dual ingredient without Patreon key', async () => {
    await expect(fetchCocktailsByIngredients(['gin', 'Campari'])).rejects.toThrow(
      'Multi-ingredient filter requires',
    )
    expect(fetch).not.toHaveBeenCalled()
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

  it('retries once after HTTP 429 then surfaces rate_limit error', async () => {
    vi.useFakeTimers()
    try {
      vi.mocked(fetch)
        .mockResolvedValueOnce({ ok: false, status: 429 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 429 } as Response)

      const promise = fetchCocktailsByIngredient('gin')
      const assertion = expect(promise).rejects.toMatchObject({
        code: 'rate_limit',
      } satisfies Partial<CocktailApiError>)
      await vi.advanceTimersByTimeAsync(2000)
      await assertion
      expect(fetch).toHaveBeenCalledTimes(2)
    } finally {
      await vi.runOnlyPendingTimersAsync()
      vi.useRealTimers()
    }
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
