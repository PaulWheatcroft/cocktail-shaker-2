import type { CocktailDbDrink } from '@/services/cocktailApi/types.raw'
import type { Cocktail, CocktailIngredient } from '@/types/domain'
import { canonicalize } from './ingredients'
import { deriveStyles } from './styles'
import { mergeTags, parseApiTags } from './tags'

const SPIRITS = [
  'gin',
  'vodka',
  'rum',
  'whiskey',
  'whisky',
  'tequila',
  'brandy',
  'cognac',
  'bourbon',
  'scotch',
]

function extractIngredients(drink: CocktailDbDrink): CocktailIngredient[] {
  const result: CocktailIngredient[] = []
  for (let i = 1; i <= 15; i++) {
    const nameKey = `strIngredient${i}` as keyof CocktailDbDrink
    const measureKey = `strMeasure${i}` as keyof CocktailDbDrink
    const name = drink[nameKey]
    if (typeof name === 'string' && name.trim()) {
      const measure = drink[measureKey]
      result.push({
        name: name.trim(),
        measure: typeof measure === 'string' && measure.trim() ? measure.trim() : undefined,
      })
    }
  }
  return result
}

function deriveBaseSpirit(ingredients: CocktailIngredient[]): string | undefined {
  for (const ing of ingredients) {
    const c = canonicalize(ing.name)
    const spirit = SPIRITS.find((s) => c.includes(s))
    if (spirit) return spirit
  }
  return undefined
}

export function toCocktail(drink: CocktailDbDrink): Cocktail | null {
  if (!drink.idDrink || !drink.strDrink?.trim()) {
    return null
  }

  const ingredients = extractIngredients(drink)
  const apiTags = parseApiTags(drink.strTags)
  const styles = deriveStyles(
    drink.strDrink,
    ingredients.map((i) => i.name),
    drink.strCategory ?? undefined,
  )
  const tags = mergeTags(apiTags, styles)

  return {
    id: drink.idDrink,
    name: drink.strDrink.trim(),
    category: drink.strCategory?.trim() || undefined,
    alcoholic: drink.strAlcoholic === 'Alcoholic',
    glass: drink.strGlass?.trim() || undefined,
    instructions: drink.strInstructions?.trim() || undefined,
    image: drink.strDrinkThumb?.trim() || undefined,
    ingredients,
    tags,
    baseSpirit: deriveBaseSpirit(ingredients),
    style: styles.length ? styles : undefined,
  }
}
