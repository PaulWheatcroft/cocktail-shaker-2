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
  it('includes top candidates without instructions', () => {
    const req = composeHostessRequest('Something dry', ['gin', 'campari'], ranked)
    expect(req.topCandidates).toHaveLength(1)
    expect(req.topCandidates[0]?.name).toBe('Negroni')
    expect(req.topCandidates[0]?.ingredientNames).toContain('Gin')
    expect(req.personaMode).toBe('house_hostess')
  })

  it('defaults user request when empty', () => {
    const req = composeHostessRequest('  ', ['gin'], ranked)
    expect(req.userRequest).toContain('cabinet')
  })
})
