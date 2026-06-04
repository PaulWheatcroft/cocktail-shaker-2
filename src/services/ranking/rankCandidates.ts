import type { Cocktail, RankedCandidate } from '@/types/domain'
import { scoreCocktail, type RankContext } from './score'

export function rankCandidates(cocktails: Cocktail[], context: RankContext): RankedCandidate[] {
  const scored = cocktails.map((cocktail) => {
    const breakdown = scoreCocktail(cocktail, context)
    return {
      cocktail,
      score: breakdown.total,
      reasons: breakdown.reasons.length
        ? breakdown.reasons
        : ['matches your cabinet'],
    }
  })

  return scored.sort((a, b) => b.score - a.score)
}
