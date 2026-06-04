import type { SubstitutionConfidence, SubstitutionNote } from '@/types/domain'
import { canonicalize, ingredientsMatch } from '@/services/normalization/ingredients'
import rules from './rules.json'

interface SubstitutionRule {
  missing: string
  substitute: string
  confidence: SubstitutionConfidence
}

const RULES = rules as SubstitutionRule[]

const CONFIDENCE_SCORE: Record<SubstitutionConfidence, number> = {
  acceptable: 1,
  tolerable: 0.6,
  regrettable: 0.3,
}

export function getSubstitutionNote(
  missing: string,
  availableCabinet: string[],
): SubstitutionNote | null {
  const missingCanon = canonicalize(missing)
  if (!missingCanon) return null

  for (const rule of RULES) {
    if (canonicalize(rule.missing) !== missingCanon) continue
    const hasSub = availableCabinet.some((c) =>
      ingredientsMatch(c, rule.substitute),
    )
    if (hasSub) {
      return {
        missing: rule.missing,
        substitute: rule.substitute,
        confidence: rule.confidence,
      }
    }
  }
  return null
}

export function substitutionConfidenceForRecipe(
  cabinet: string[],
  recipeIngredients: string[],
): number {
  const canonCabinet = cabinet.map(canonicalize).filter(Boolean)
  const canonRecipe = recipeIngredients.map(canonicalize).filter(Boolean)
  if (canonRecipe.length === 0) return 0

  let scoreSum = 0

  for (const recipeIng of canonRecipe) {
    const hasDirect = canonCabinet.some((c) => ingredientsMatch(c, recipeIng))
    if (hasDirect) {
      scoreSum += 1
      continue
    }
    const note = getSubstitutionNote(recipeIng, cabinet)
    scoreSum += note ? CONFIDENCE_SCORE[note.confidence] : 0
  }

  return scoreSum / canonRecipe.length
}
