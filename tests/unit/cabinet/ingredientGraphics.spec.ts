import { describe, it, expect } from 'vitest'
import { categoryFor } from '@/features/cabinet/ingredientGraphics'

describe('categoryFor', () => {
  it('maps core spirits', () => {
    expect(categoryFor('Gin')).toBe('gin')
    expect(categoryFor('Sloe Gin')).toBe('gin')
    expect(categoryFor('Vodka')).toBe('vodka')
    expect(categoryFor('Bourbon')).toBe('whisky')
    expect(categoryFor('White Rum')).toBe('rum')
    expect(categoryFor('Tequila')).toBe('tequila')
  })

  it('does not confuse gin with ginger', () => {
    expect(categoryFor('Ginger Ale')).toBe('soda')
    expect(categoryFor('Ginger')).toBe('spice')
  })

  it('prefers juice over citrus for liquids', () => {
    expect(categoryFor('Lime')).toBe('citrus')
    expect(categoryFor('Lime Juice')).toBe('juice')
    expect(categoryFor('Orange Juice')).toBe('juice')
  })

  it('maps liqueurs and fortified wines', () => {
    expect(categoryFor('Dry Vermouth')).toBe('vermouth')
    expect(categoryFor('Campari')).toBe('bitters')
    expect(categoryFor('Triple Sec')).toBe('liqueur')
    expect(categoryFor('Champagne')).toBe('sparkling')
    expect(categoryFor('Port')).toBe('fortified')
  })

  it('maps food and garnish', () => {
    expect(categoryFor('Egg White')).toBe('egg')
    expect(categoryFor('Mint')).toBe('herb')
    expect(categoryFor('Maraschino Cherry')).toBe('cherry')
    expect(categoryFor('Sugar Syrup')).toBe('syrup')
    expect(categoryFor('Ice')).toBe('ice')
  })

  it('maps food and solid ingredients without bottle fallback', () => {
    expect(categoryFor('Apple')).toBe('food')
    expect(categoryFor('Apple Juice')).toBe('juice')
    expect(categoryFor('Apple Brandy')).toBe('brandy')
    expect(categoryFor('Apple Cider')).toBe('soda')
  })

  it('falls back to a generic bottle for unknown items', () => {
    expect(categoryFor('Dragonfruit Foam')).toBe('bottle')
    expect(categoryFor('')).toBe('bottle')
    expect(categoryFor('   ')).toBe('bottle')
  })
})
