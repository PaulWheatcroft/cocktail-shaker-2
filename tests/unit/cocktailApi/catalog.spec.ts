import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as client from '@/services/cocktailApi/client'
import {
  resolveCatalogIngredient,
  suggestIngredients,
  resetCatalogCache,
} from '@/services/cocktailApi/catalog'

const SAMPLE_CATALOG = ['Gin', 'Vodka', 'Coca-Cola', 'Lime']

describe('catalog', () => {
  beforeEach(() => {
    resetCatalogCache()
    vi.spyOn(client, 'fetchIngredientCatalog').mockResolvedValue([...SAMPLE_CATALOG])
  })

  afterEach(() => {
    vi.restoreAllMocks()
    resetCatalogCache()
  })

  it('resolves catalogue names case-insensitively', async () => {
    await expect(resolveCatalogIngredient('coca-cola')).resolves.toBe('Coca-Cola')
    await expect(resolveCatalogIngredient('GIN')).resolves.toBe('Gin')
  })

  it('maps coke and cola shorthands to Coca-Cola', async () => {
    await expect(resolveCatalogIngredient('Coke')).resolves.toBe('Coca-Cola')
    await expect(resolveCatalogIngredient('cola')).resolves.toBe('Coca-Cola')
    await expect(resolveCatalogIngredient('coca cola')).resolves.toBe('Coca-Cola')
  })

  it('returns null for unknown ingredients', async () => {
    await expect(resolveCatalogIngredient('Pepsi')).resolves.toBeNull()
  })

  it('suggests Coca-Cola when searching for coke', async () => {
    const suggestions = await suggestIngredients('coke')
    expect(suggestions[0]).toBe('Coca-Cola')
  })
})
