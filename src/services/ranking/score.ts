import type { Cocktail, StyleTag } from '@/types/domain'
import { cabinetCoverage } from '@/services/normalization/ingredients'
import { substitutionConfidenceForRecipe } from '@/services/substitutions'
import { appraiseDrink } from './drinkAppraisal'
import { housePreferenceScore } from './housePreferences'

export interface RankContext {
  cabinet: string[]
  styleFilters: StyleTag[]
  houseStrictness: number
}

export interface ScoreBreakdown {
  total: number
  ingredientCoverage: number
  styleMatch: number
  housePreference: number
  substitutionConfidence: number
  reasons: string[]
}

export function scoreCocktail(cocktail: Cocktail, context: RankContext): ScoreBreakdown {
  const recipeNames = cocktail.ingredients.map((i) => i.name)
  const coverage = cabinetCoverage(context.cabinet, recipeNames)
  const subConf = substitutionConfidenceForRecipe(context.cabinet, recipeNames)
  const houseBase = housePreferenceScore(cocktail.name, cocktail.tags, context.houseStrictness)
  const appraisal = appraiseDrink({
    name: cocktail.name,
    ingredients: cocktail.ingredients,
    instructions: cocktail.instructions,
    tags: cocktail.tags,
    styles: cocktail.style,
    glass: cocktail.glass,
    houseStrictness: context.houseStrictness,
  })
  const tierAdjust: Record<typeof appraisal.tier, number> = {
    impeccable: 0.1,
    respectable: 0.05,
    tolerable: 0,
    vulgar: -0.12,
    abomination: -0.22,
  }
  const house = Math.max(0, Math.min(1, houseBase + tierAdjust[appraisal.tier]))
  const style = styleMatchScore(cocktail.style ?? [], context.styleFilters)

  const total =
    coverage.ratio * 0.4 + style * 0.25 + house * 0.2 + subConf * 0.15

  const reasons: string[] = []
  if (coverage.ratio >= 0.9) reasons.push('high ingredient match')
  else if (coverage.ratio >= 0.5) reasons.push('partial cabinet match')
  if (style >= 0.8 && context.styleFilters.length) reasons.push('strong style fit')
  if (house >= 0.8) reasons.push('house favourite')
  if (appraisal.tier === 'abomination' || appraisal.tier === 'vulgar') {
    reasons.push('house disapproval')
  }
  if (subConf >= 0.7 && coverage.ratio < 1) reasons.push('acceptable substitutions')

  return {
    total,
    ingredientCoverage: coverage.ratio,
    styleMatch: style,
    housePreference: house,
    substitutionConfidence: subConf,
    reasons,
  }
}

function styleMatchScore(cocktailStyles: StyleTag[], filters: StyleTag[]): number {
  if (filters.length === 0) return 0.7
  if (cocktailStyles.length === 0) return 0.4
  const overlap = filters.filter((f) => cocktailStyles.includes(f)).length
  return overlap / filters.length
}
