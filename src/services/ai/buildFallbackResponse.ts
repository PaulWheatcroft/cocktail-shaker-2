import type { DrinkPresentation, HostessCandidatePayload, HostessResponse } from '@/types/domain'

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
    pitch: candidate.reasons.length
      ? candidate.reasons.join('; ')
      : 'A respectable choice from what you have on hand.',
    preparationSteps: steps.length ? steps : ['Prepare as the recipe demands.'],
  }
}

export function buildFallbackResponse(candidates: HostessCandidatePayload[]): HostessResponse {
  const top = candidates[0]!
  const presentationCandidates = candidates.slice(0, 3)

  return {
    verdict: 'The cabinet points to a respectable choice.',
    primaryRecommendation: top.name,
    rationale: top.reasons.length ? top.reasons.join('; ') : 'It best matches what you have on hand.',
    alternatives: candidates.slice(1, 3).map((c) => c.name),
    followUpSuggestions: [
      'Make it drier',
      'Something more bitter',
      'Show another option',
    ],
    drinkPresentations: presentationCandidates.map(buildPresentation),
  }
}
