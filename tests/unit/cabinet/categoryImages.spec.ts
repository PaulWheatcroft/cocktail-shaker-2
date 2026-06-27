import { describe, it, expect } from 'vitest'
import {
  availableCategoryImages,
  categoryImageSrc,
  missingCategoryImages,
} from '@/features/cabinet/categoryImages'

describe('categoryImageSrc', () => {
  it('maps spirits to shared category images', () => {
    expect(categoryImageSrc('Vodka')).toBe('/images/ingredients/clear-spirit.webp')
    expect(categoryImageSrc('Gin')).toBe('/images/ingredients/clear-spirit.webp')
    expect(categoryImageSrc('Bourbon')).toBe('/images/ingredients/amber-spirit.webp')
  })

  it('maps soda keywords to lemon-lime art', () => {
    expect(categoryImageSrc('7-Up')).toBe('/images/ingredients/soda-lemon.webp')
    expect(categoryImageSrc('Sprite')).toBe('/images/ingredients/soda-lemon.webp')
  })

  it('returns null for soda variants without assets', () => {
    expect(categoryImageSrc('Coca-Cola')).toBeNull()
    expect(categoryImageSrc('Fanta')).toBeNull()
  })

  it('maps keyword categories before icon defaults', () => {
    expect(categoryImageSrc('151 proof rum')).toBe('/images/ingredients/dark-spirit.webp')
    expect(categoryImageSrc('Advocaat')).toBe('/images/ingredients/cream-liqueur.webp')
    expect(categoryImageSrc('Aperol')).toBe('/images/ingredients/aperitif.webp')
  })

  it('returns null for categories without assets', () => {
    expect(categoryImageSrc('Champagne')).toBeNull()
    expect(categoryImageSrc('Red Wine')).toBeNull()
  })
})

describe('missingCategoryImages', () => {
  it('lists categories referenced but not yet illustrated', () => {
    const missing = missingCategoryImages()
    expect(missing).toContain('wine')
    expect(missing).toContain('sparkling')
    expect(missing).toContain('soda-cola')
    expect(missing).toContain('soda-orange')
    expect(missing).not.toContain('clear-spirit')
  })

  it('reports available category assets', () => {
    expect(availableCategoryImages()).toContain('clear-spirit')
    expect(availableCategoryImages()).toContain('soda-lemon')
  })
})
