import type { HostessCandidatePayload, HostessResponse } from '@/types/domain'

export function buildFallbackResponse(candidates: HostessCandidatePayload[]): HostessResponse {
  const top = candidates[0]!
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
  }
}
