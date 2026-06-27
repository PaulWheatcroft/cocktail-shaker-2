import { describe, it, expect } from 'vitest'
import { buildIssueExport, defaultReviewEntry } from '@/features/dev/ingredientImageReview'
import type { CategoryImageResolution } from '@/features/cabinet/categoryImages'

function fakeResolve(name: string): CategoryImageResolution {
  if (name === 'Gin') {
    return {
      icon: 'gin',
      categoryId: 'clear-spirit',
      imageSrc: '/images/ingredients/clear-spirit.webp',
      source: 'icon',
    }
  }
  return {
    icon: 'bottle',
    categoryId: null,
    imageSrc: null,
    source: 'none',
  }
}

describe('buildIssueExport', () => {
  it('includes only ingredients marked wrong with notes', () => {
    const payload = buildIssueExport(
      ['Gin', 'Mystery Foam'],
      {
        Gin: { status: 'wrong', note: 'Should use a different bottle shape' },
        'Mystery Foam': { status: 'correct', note: '' },
      },
      fakeResolve,
    )

    expect(payload.issues).toHaveLength(1)
    expect(payload.issues[0]).toMatchObject({
      ingredient: 'Gin',
      icon: 'gin',
      categoryId: 'clear-spirit',
      note: 'Should use a different bottle shape',
    })
    expect(payload.exportedAt).toBeTruthy()
  })

  it('ignores unset reviews', () => {
    const payload = buildIssueExport(['Gin'], { Gin: defaultReviewEntry() }, fakeResolve)
    expect(payload.issues).toEqual([])
  })
})
