import type { HostessCandidateInput, HostessResponseBody } from './types.ts'

export function buildFallback(candidates: HostessCandidateInput[]): HostessResponseBody {
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

function normalizeName(name: string): string {
  return name.trim().toLowerCase()
}

export function validateResponse(
  raw: unknown,
  candidates: HostessCandidateInput[],
): HostessResponseBody | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>

  const verdict = typeof o.verdict === 'string' ? o.verdict.trim() : ''
  const primaryRecommendation =
    typeof o.primaryRecommendation === 'string' ? o.primaryRecommendation.trim() : ''
  const rationale = typeof o.rationale === 'string' ? o.rationale.trim() : ''

  if (!verdict || !primaryRecommendation || !rationale) return null

  const names = new Set(candidates.map((c) => normalizeName(c.name)))
  if (!names.has(normalizeName(primaryRecommendation))) return null

  const alternatives = Array.isArray(o.alternatives)
    ? o.alternatives
        .filter((a): a is string => typeof a === 'string')
        .map((a) => a.trim())
        .filter((a) => names.has(normalizeName(a)) && normalizeName(a) !== normalizeName(primaryRecommendation))
        .slice(0, 2)
    : []

  const followUpSuggestions = Array.isArray(o.followUpSuggestions)
    ? o.followUpSuggestions
        .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
        .map((s) => s.trim())
        .slice(0, 4)
    : ['Make it drier', 'Show another option']

  return {
    verdict,
    primaryRecommendation,
    rationale,
    alternatives,
    followUpSuggestions,
  }
}
