import { describe, it, expect } from 'vitest'
import { composeHostessRequest } from '@/services/ai/composeHostessRequest'
import type { RankedCandidate } from '@/types/domain'

const ranked: RankedCandidate[] = [
  {
    score: 0.9,
    reasons: ['high ingredient match'],
    cocktail: {
      id: '1',
      name: 'Negroni',
      glass: 'Old-fashioned glass',
      instructions: 'Stir with ice and strain.',
      ingredients: [
        { name: 'Gin', measure: '30 ml' },
        { name: 'Campari', measure: '30 ml' },
      ],
      tags: ['bitter'],
      style: ['bitter'],
    },
  },
]

describe('composeHostessRequest', () => {
  it('includes recipe context for hostess narration', () => {
    const req = composeHostessRequest('Something dry', ['gin', 'campari'], ranked, 80)
    expect(req.topCandidates).toHaveLength(1)
    expect(req.topCandidates[0]?.name).toBe('Negroni')
    expect(req.topCandidates[0]?.ingredientNames).toContain('Gin')
    expect(req.topCandidates[0]?.sourceInstructions).toBe('Stir with ice and strain.')
    expect(req.topCandidates[0]?.glass).toBe('Old-fashioned glass')
    expect(req.topCandidates[0]?.ingredients?.[0]?.measure).toBe('30 ml')
    expect(req.topCandidates[0]?.hostessAppraisal.tier).toBeDefined()
    expect(req.houseStrictness).toBe(80)
    expect(req.personaMode).toBe('house_hostess')
  })

  it('defaults user request when empty', () => {
    const req = composeHostessRequest('  ', ['gin'], ranked, 50)
    expect(req.userRequest).toContain('cabinet')
  })
})
