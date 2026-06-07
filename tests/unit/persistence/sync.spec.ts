import { describe, it, expect } from 'vitest'

// mergeOnLogin uses Supabase client — test merge logic via exported shapes in a thin helper if needed.
// Here we document expected merge behaviour for cabinet union.

function mergeCabinetItems(remote: string[], local: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const name of [...remote, ...local]) {
    const trimmed = name.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(trimmed)
  }
  return result
}

describe('persistence merge', () => {
  it('unions cabinet ingredients case-insensitively', () => {
    expect(mergeCabinetItems(['Gin', 'Vodka'], ['gin', 'Campari'])).toEqual([
      'Gin',
      'Vodka',
      'Campari',
    ])
  })
})
