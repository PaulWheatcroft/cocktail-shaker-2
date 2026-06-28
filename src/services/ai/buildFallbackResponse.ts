import type { DrinkPresentation, HostessCandidatePayload, HostessResponse } from '@/types/domain'
import {
  fallbackPitchForTier,
  fallbackVerdictForTier,
} from '@/services/ranking/drinkAppraisal'

function buildPresentation(candidate: HostessCandidatePayload): DrinkPresentation {
  const steps = candidate.sourceInstructions
    ? candidate.sourceInstructions
        .split(/[.!?]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 6)
    : ['Assemble the ingredients with purpose.', 'Serve with composure.']

  return {
    name: candidate.name,
    pitch: fallbackPitchForTier(
      candidate.hostessAppraisal.tier,
      candidate.reasons,
      candidate.name,
    ),
    preparationSteps: steps.length ? steps : ['Prepare as the recipe demands.'],
  }
}

export function buildFallbackResponse(candidates: HostessCandidatePayload[]): HostessResponse {
  const top = candidates[0]!
  const presentationCandidates = candidates.slice(0, 3)
  const topTier = top.hostessAppraisal?.tier ?? 'respectable'

  return {
    verdict: fallbackVerdictForTier(topTier),
    primaryRecommendation: top.name,
    rationale: top.hostessAppraisal?.summary ?? 'It best matches what you have on hand.',
    alternatives: candidates.slice(1, 3).map((c) => c.name),
    followUpSuggestions:
      topTier === 'vulgar' || topTier === 'abomination'
        ? ['Something bitter', 'Less soda', 'A proper classic']
        : ['Make it drier', 'Something more bitter', 'Show another option'],
    drinkPresentations: presentationCandidates.map(buildPresentation),
  }
}
