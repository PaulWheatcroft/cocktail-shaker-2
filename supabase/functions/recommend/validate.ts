import type { DrinkPresentationBody, HostessCandidateInput, HostessResponseBody } from './types.ts'

function normalizeName(name: string): string {
  return name.trim().toLowerCase()
}

function buildPresentation(candidate: HostessCandidateInput): DrinkPresentationBody {
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

export function buildFallback(candidates: HostessCandidateInput[]): HostessResponseBody {
  const top = candidates[0]!
  const alts = candidates.slice(1, 3)
  const presentationCandidates = candidates.slice(0, 3)

  return {
    verdict: 'The cabinet points to a respectable choice.',
    primaryRecommendation: top.name,
    rationale: top.reasons.length ? top.reasons.join('; ') : 'It best matches what you have on hand.',
    alternatives: alts.map((c) => c.name),
    followUpSuggestions: [
      'Make it drier',
      'Something more bitter',
      'Show another option',
    ],
    drinkPresentations: presentationCandidates.map(buildPresentation),
  }
}

function findCandidate(
  candidates: HostessCandidateInput[],
  name: string,
): HostessCandidateInput | undefined {
  return candidates.find((c) => normalizeName(c.name) === normalizeName(name))
}

// The LLM is now asked to write only the primary drink's presentation, so we
// extract that single flamboyant entry and ignore any extras it may have added.
function parsePrimaryPresentation(
  raw: unknown,
  primaryRecommendation: string,
): DrinkPresentationBody | null {
  if (!Array.isArray(raw)) return null

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const name = typeof o.name === 'string' ? o.name.trim() : ''
    const pitch = typeof o.pitch === 'string' ? o.pitch.trim() : ''
    const preparationSteps = Array.isArray(o.preparationSteps)
      ? o.preparationSteps
          .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
          .map((s) => s.trim())
          .slice(0, 10)
      : []

    if (!name || !pitch || !preparationSteps.length) continue
    if (normalizeName(name) !== normalizeName(primaryRecommendation)) continue

    return { name, pitch, preparationSteps }
  }

  return null
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

  // The LLM only writes the primary presentation; alternative presentations are
  // composed deterministically from candidate data to keep the call ~3x faster.
  const primaryPresentation = parsePrimaryPresentation(o.drinkPresentations, primaryRecommendation)
  if (!primaryPresentation) return null

  const alternativePresentations = alternatives
    .map((name) => findCandidate(candidates, name))
    .filter((c): c is HostessCandidateInput => Boolean(c))
    .map(buildPresentation)

  const drinkPresentations = [primaryPresentation, ...alternativePresentations]

  return {
    verdict,
    primaryRecommendation,
    rationale,
    alternatives,
    followUpSuggestions,
    drinkPresentations,
  }
}
