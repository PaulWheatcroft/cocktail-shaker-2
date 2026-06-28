import { describe, it, expect } from 'vitest'
import { appraiseDrink } from '@/services/ranking/drinkAppraisal'
import type { StyleTag } from '@/types/domain'

const cokeFloat = {
  name: "Brandon and Will's Coke Float",
  ingredients: [
    { name: 'Vanilla ice-cream', measure: '2 scoops' },
    { name: 'Coca-Cola', measure: '1 can' },
    { name: 'Bourbon', measure: '2 oz' },
  ],
  instructions:
    'Scoop ice cream into a frosted beer mug. Pour bourbon, then Coca-Cola. Stir gently.',
  glass: 'Beer mug',
  tags: [] as string[],
  styles: ['sweet'] as StyleTag[],
  houseStrictness: 50,
}

describe('appraiseDrink', () => {
  it('rates Coke Float as abomination', () => {
    const result = appraiseDrink(cokeFloat)
    expect(result.tier).toBe('abomination')
    expect(result.flags).toContain('float_dessert_denial')
    expect(result.flags).toContain('soda_drowning')
    expect(result.summary.toLowerCase()).toMatch(/not a cocktail|abomination|float/)
  })

  it('rates Dry Martini as impeccable or respectable', () => {
    const result = appraiseDrink({
      name: 'Dry Martini',
      ingredients: [
        { name: 'Gin', measure: '6 cl' },
        { name: 'Dry Vermouth', measure: '1 cl' },
      ],
      instructions: 'Stir with ice and strain into a chilled glass.',
      tags: ['classic'],
      styles: ['dry', 'spirit-forward'],
      houseStrictness: 80,
    })
    expect(['impeccable', 'respectable']).toContain(result.tier)
  })

  it('rates novelty punch names as vulgar or worse', () => {
    const result = appraiseDrink({
      name: 'Blue Hawaiian Punch',
      ingredients: [
        { name: 'Vodka', measure: '2 oz' },
        { name: 'Blue Curacao', measure: '1 oz' },
        { name: 'Pineapple juice', measure: '4 oz' },
      ],
      instructions: 'Shake and strain.',
      tags: ['party'],
      houseStrictness: 50,
    })
    expect(['vulgar', 'abomination']).toContain(result.tier)
    expect(result.flags).toContain('novelty_name')
  })

  it('softens tier when house strictness is low', () => {
    const strict = appraiseDrink({ ...cokeFloat, houseStrictness: 80 })
    const lenient = appraiseDrink({ ...cokeFloat, houseStrictness: 20 })
    const strictIdx = ['tolerable', 'vulgar', 'abomination'].indexOf(strict.tier)
    const lenientIdx = ['tolerable', 'vulgar', 'abomination'].indexOf(lenient.tier)
    expect(lenientIdx).toBeLessThanOrEqual(strictIdx)
  })
})
