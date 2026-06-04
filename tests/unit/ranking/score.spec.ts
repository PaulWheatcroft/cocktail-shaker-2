import { describe, it, expect } from 'vitest'
import { scoreCocktail } from '@/services/ranking/score'
import type { Cocktail } from '@/types/domain'

const martini: Cocktail = {
  id: '1',
  name: 'Dry Martini',
  ingredients: [
    { name: 'Gin', measure: '6 cl' },
    { name: 'Dry Vermouth', measure: '1 cl' },
  ],
  tags: ['classic'],
  style: ['dry', 'spirit-forward'],
}

describe('scoreCocktail', () => {
  it('scores higher with full cabinet match', () => {
    const full = scoreCocktail(martini, {
      cabinet: ['gin', 'dry vermouth'],
      styleFilters: ['dry'],
      houseStrictness: 80,
    })
    const partial = scoreCocktail(martini, {
      cabinet: ['gin'],
      styleFilters: [],
      houseStrictness: 50,
    })
    expect(full.total).toBeGreaterThan(partial.total)
  })

  it('is deterministic', () => {
    const ctx = { cabinet: ['gin'], styleFilters: [], houseStrictness: 50 }
    const a = scoreCocktail(martini, ctx).total
    const b = scoreCocktail(martini, ctx).total
    expect(a).toBe(b)
  })
})
