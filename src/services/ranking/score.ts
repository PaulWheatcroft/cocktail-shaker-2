import type { Cocktail, StyleTag } from '@/types/domain'
import { cabinetCoverage } from '@/services/normalization/ingredients'
import { substitutionConfidenceForRecipe } from '@/services/substitutions'
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
  const house = housePreferenceScore(cocktail.name, cocktail.tags, context.houseStrictness)
  const style = styleMatchScore(cocktail.style ?? [], context.styleFilters)

  const total =
    coverage.ratio * 0.4 + style * 0.25 + house * 0.2 + subConf * 0.15

  const reasons: string[] = []
  if (coverage.ratio >= 0.9) reasons.push('high ingredient match')
  else if (coverage.ratio >= 0.5) reasons.push('partial cabinet match')
  if (style >= 0.8 && context.styleFilters.length) reasons.push('strong style fit')
  if (house >= 0.8) reasons.push('house favourite')
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
