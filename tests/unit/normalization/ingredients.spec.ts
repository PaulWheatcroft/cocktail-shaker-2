import { describe, it, expect } from 'vitest'
import { cabinetCoverage, canonicalize, matchScore } from '@/services/normalization/ingredients'

describe('ingredients', () => {
  it('canonicalize lowercases', () => {
    expect(canonicalize('  Gin ')).toBe('gin')
  })

  it('matchScore exact and partial', () => {
    expect(matchScore('gin', 'Gin')).toBe(1)
    expect(matchScore('lime', 'lime juice')).toBeGreaterThan(0)
  })

  it('cabinetCoverage ratio', () => {
    const { ratio, matched, total } = cabinetCoverage(['gin', 'vermouth'], ['Gin', 'Dry Vermouth'])
    expect(total).toBe(2)
    expect(matched).toBe(2)
    expect(ratio).toBe(1)
  })
})
