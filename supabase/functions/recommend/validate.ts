import type { DrinkPresentationBody, HostessCandidateInput, HostessResponseBody } from './types.ts'

function normalizeName(name: string): string {
  return name.trim().toLowerCase()
}

function pitchForCandidate(candidate: HostessCandidateInput): string {
  const { tier, summary } = candidate.hostessAppraisal
  const reasonText = candidate.reasons.length ? candidate.reasons.join('; ') : ''

  switch (tier) {
    case 'impeccable':
      return reasonText ? `${summary} ${reasonText}.` : summary
    case 'respectable':
      return reasonText ? `${summary} ${reasonText}.` : summary
    case 'tolerable':
      return reasonText
        ? `Tolerable at best: ${summary} ${reasonText}.`
        : `Tolerable at best: ${summary}`
    case 'vulgar':
      return `${summary}${reasonText ? ` (${reasonText})` : ''}`
    case 'abomination':
      return `${summary}${reasonText ? ` — ${reasonText}` : ''}`
  }
}

function verdictForCandidates(candidates: HostessCandidateInput[]): string {
  const top = candidates[0]
  if (!top) return 'The cabinet offers nothing at all.'

  const tier = top.hostessAppraisal.tier
  const allBad = candidates.every((c) =>
    c.hostessAppraisal.tier === 'vulgar' || c.hostessAppraisal.tier === 'abomination'
  )

  if (allBad && candidates.length > 1) {
    return 'Your cabinet offers nothing civilised — only varying degrees of embarrassment.'
  }

  switch (tier) {
    case 'impeccable':
      return 'Impeccable taste — one approves without reservation.'
    case 'respectable':
      return 'The cabinet points to a respectable choice.'
    case 'tolerable':
      return 'We can make something tolerable from this cabinet, though expectations must be managed.'
    case 'vulgar':
      return 'Nothing here is respectable — only something vulgar will do.'
    case 'abomination':
      return 'Your cabinet offers nothing civilised — only an abomination remains.'
  }
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
    pitch: pitchForCandidate(candidate),
    preparationSteps: steps.length ? steps : ['Prepare as the recipe demands.'],
  }
}

export function buildFallback(candidates: HostessCandidateInput[]): HostessResponseBody {
  const top = candidates[0]!
  const alts = candidates.slice(1, 3)
  const presentationCandidates = candidates.slice(0, 3)

  return {
    verdict: verdictForCandidates(candidates),
    primaryRecommendation: top.name,
    rationale: top.hostessAppraisal.summary,
    alternatives: alts.map((c) => c.name),
    followUpSuggestions: top.hostessAppraisal.tier === 'vulgar' ||
        top.hostessAppraisal.tier === 'abomination'
      ? ['Something bitter', 'Less soda', 'A proper classic']
      : ['Make it drier', 'Something more bitter', 'Show another option'],
    drinkPresentations: presentationCandidates.map(buildPresentation),
  }
}

function findCandidate(
  candidates: HostessCandidateInput[],
  name: string,
): HostessCandidateInput | undefined {
  return candidates.find((c) => normalizeName(c.name) === normalizeName(name))
}

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
