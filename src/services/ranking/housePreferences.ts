import { classicStyleBoost } from '@/services/normalization/styles'
import { HOUSE_FAVOURITES, NOVELTY_NAME_PATTERN } from './noveltyPatterns'

export function housePreferenceScore(
  cocktailName: string,
  tags: string[],
  strictness: number,
): number {
  const factor = strictness / 100
  const lower = cocktailName.toLowerCase()

  if (HOUSE_FAVOURITES.some((f) => lower.includes(f)) || classicStyleBoost(cocktailName)) {
    return 0.85 + 0.15 * factor
  }

  if (
    NOVELTY_NAME_PATTERN.test(lower) ||
    tags.some((t) => t.includes('party') || t.includes('punch'))
  ) {
    return 0.35 - 0.2 * factor
  }

  return 0.55
}
