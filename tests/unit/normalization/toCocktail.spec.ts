import { describe, it, expect } from 'vitest'
import { toCocktail } from '@/services/normalization/toCocktail'
import type { CocktailDbDrink } from '@/services/cocktailApi/types.raw'

const sample: CocktailDbDrink = {
  idDrink: '11005',
  strDrink: 'Dry Martini',
  strCategory: 'Cocktail',
  strAlcoholic: 'Alcoholic',
  strGlass: 'Cocktail glass',
  strInstructions: 'Stir with ice.',
  strDrinkThumb: 'https://example.com/martini.jpg',
  strIngredient1: 'Gin',
  strMeasure1: '6 cl',
  strIngredient2: 'Dry Vermouth',
  strMeasure2: '1 cl',
  strTags: 'IBA,Classic',
}

describe('toCocktail', () => {
  it('maps core fields', () => {
    const c = toCocktail(sample)
    expect(c?.id).toBe('11005')
    expect(c?.name).toBe('Dry Martini')
    expect(c?.alcoholic).toBe(true)
    expect(c?.ingredients).toHaveLength(2)
    expect(c?.ingredients[0]?.measure).toBe('6 cl')
  })

  it('returns null without id or name', () => {
    expect(toCocktail({ idDrink: '', strDrink: '' })).toBeNull()
  })
})
