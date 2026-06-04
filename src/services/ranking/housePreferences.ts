import { classicStyleBoost } from '@/services/normalization/styles'

const HOUSE_FAVOURITES = [
  'martini',
  'negroni',
  'manhattan',
  'old fashioned',
  'boulevardier',
  'dry martini',
  'gin and tonic',
]

const NOVELTY_PENALTY = /punch|shot|layered|flaming|blue|neon|sex on the beach/i

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

  if (NOVELTY_PENALTY.test(lower) || tags.some((t) => t.includes('party') || t.includes('punch'))) {
    return 0.35 - 0.2 * factor
  }

  return 0.55
}
