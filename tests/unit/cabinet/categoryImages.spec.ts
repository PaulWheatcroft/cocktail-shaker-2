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

  it('maps soda variants to their category art', () => {
    expect(categoryImageSrc('Coca-Cola')).toBe('/images/ingredients/soda-cola.webp')
    expect(categoryImageSrc('Fanta')).toBe('/images/ingredients/soda-orange.webp')
  })

  it('maps keyword categories before icon defaults', () => {
    expect(categoryImageSrc('151 proof rum')).toBe('/images/ingredients/dark-spirit.webp')
    expect(categoryImageSrc('Advocaat')).toBe('/images/ingredients/cream-liqueur.webp')
    expect(categoryImageSrc('Aperol')).toBe('/images/ingredients/aperitif.webp')
  })

  it('maps wine and sparkling categories', () => {
    expect(categoryImageSrc('Champagne')).toBe('/images/ingredients/sparkling.webp')
    expect(categoryImageSrc('Red Wine')).toBe('/images/ingredients/wine.webp')
  })

  it('maps review-export fixes', () => {
    expect(categoryImageSrc('Absolut citron')).toBe('/images/ingredients/clear-spirit.webp')
    expect(categoryImageSrc('Bacardi')).toBe('/images/ingredients/clear-spirit.webp')
    expect(categoryImageSrc('Bacardi Limon')).toBe('/images/ingredients/clear-spirit-lemon.webp')
    expect(categoryImageSrc('Blue Curacao')).toBe('/images/ingredients/liqueur-blue.webp')
    expect(categoryImageSrc('Blue Maui')).toBe('/images/ingredients/liqueur-blue.webp')
    expect(categoryImageSrc('Aftershock')).toBe('/images/ingredients/liqueur-blue.webp')
    expect(categoryImageSrc('Benedictine')).toBe('/images/ingredients/liqueur.webp')
    expect(categoryImageSrc('Carbonated Water')).toBe('/images/ingredients/soda-water.webp')
    expect(categoryImageSrc('Coca-Cola')).toBe('/images/ingredients/soda-cola.webp')
    expect(categoryImageSrc('Almond Flavoring')).toBe('/images/ingredients/aperitif.webp')
    expect(categoryImageSrc('Coconut Liqueur')).toBe('/images/ingredients/clear-spirit.webp')
  })
})

describe('missingCategoryImages', () => {
  it('reports no missing category assets when catalogue is complete', () => {
    expect(missingCategoryImages()).toEqual([])
  })

  it('reports available category assets', () => {
    expect(availableCategoryImages()).toContain('clear-spirit')
    expect(availableCategoryImages()).toContain('soda-lemon')
  })
})
