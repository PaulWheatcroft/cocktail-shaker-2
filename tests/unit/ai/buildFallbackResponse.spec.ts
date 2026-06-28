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
    hostessAppraisal: {
      tier: 'respectable',
      summary: 'Negroni — respectable and disciplined.',
      flags: [],
    },
  },
  {
    name: 'Americano',
    score: 0.7,
    reasons: ['acceptable fallback'],
    ingredientNames: ['Campari', 'Vermouth'],
    sourceInstructions: 'Build in glass over ice.',
    hostessAppraisal: {
      tier: 'tolerable',
      summary: 'Americano — tolerable given what one has on hand.',
      flags: [],
    },
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

  it('uses scathing fallback for abomination tier', () => {
    const res = buildFallbackResponse([
      {
        name: "Brandon and Will's Coke Float",
        score: 0.2,
        reasons: ['partial cabinet match'],
        ingredientNames: ['Bourbon', 'Coca-Cola', 'Vanilla ice-cream'],
        sourceInstructions: 'Scoop ice cream. Pour bourbon and Coke.',
        hostessAppraisal: {
          tier: 'abomination',
          summary: 'Bourbon, Coca-Cola, and vanilla ice cream — not a cocktail.',
          flags: ['float_dessert_denial'],
        },
      },
    ])
    expect(res.verdict.toLowerCase()).toContain('abomination')
    expect(res.drinkPresentations[0]?.pitch.toLowerCase()).toContain('abomination')
  })
})
