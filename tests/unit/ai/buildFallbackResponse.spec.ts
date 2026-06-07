import { describe, it, expect } from 'vitest'
import { buildFallbackResponse } from '@/services/ai/buildFallbackResponse'
import type { HostessCandidatePayload } from '@/types/domain'

const candidates: HostessCandidatePayload[] = [
  {
    name: 'Negroni',
    score: 0.9,
    reasons: ['high ingredient match'],
    ingredientNames: ['Gin', 'Campari'],
    sourceInstructions: 'Stir with ice. Strain into glass.',
  },
  {
    name: 'Americano',
    score: 0.7,
    reasons: ['acceptable fallback'],
    ingredientNames: ['Campari', 'Vermouth'],
    sourceInstructions: 'Build in glass over ice.',
  },
]

describe('buildFallbackResponse', () => {
  it('includes drinkPresentations for top candidates', () => {
    const res = buildFallbackResponse(candidates)
    expect(res.drinkPresentations).toHaveLength(2)
    expect(res.drinkPresentations[0]?.name).toBe('Negroni')
    expect(res.drinkPresentations[0]?.pitch).toContain('ingredient match')
    expect(res.drinkPresentations[0]?.preparationSteps.length).toBeGreaterThan(0)
  })
})
