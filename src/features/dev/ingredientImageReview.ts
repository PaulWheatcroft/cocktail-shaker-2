import type { CategoryImageResolution } from '@/features/cabinet/categoryImages'

export type ReviewStatus = 'unset' | 'correct' | 'wrong'

export interface IngredientReviewEntry {
  status: ReviewStatus
  note: string
}

export type IngredientReviewState = Record<string, IngredientReviewEntry>

export interface IngredientImageIssue {
  ingredient: string
  icon: CategoryImageResolution['icon']
  categoryId: string | null
  imageSrc: string | null
  source: CategoryImageResolution['source']
  note: string
}

export interface IngredientImageIssueExport {
  exportedAt: string
  issues: IngredientImageIssue[]
}

export const REVIEW_STORAGE_KEY = 'cocktail-shaker:dev:ingredient-image-review'

export function defaultReviewEntry(): IngredientReviewEntry {
  return { status: 'unset', note: '' }
}

export function buildIssueExport(
  ingredients: string[],
  reviews: IngredientReviewState,
  resolve: (name: string) => CategoryImageResolution,
): IngredientImageIssueExport {
  const issues: IngredientImageIssue[] = []

  for (const ingredient of ingredients) {
    const review = reviews[ingredient] ?? defaultReviewEntry()
    if (review.status !== 'wrong') continue

    const resolution = resolve(ingredient)
    issues.push({
      ingredient,
      icon: resolution.icon,
      categoryId: resolution.categoryId,
      imageSrc: resolution.imageSrc,
      source: resolution.source,
      note: review.note.trim(),
    })
  }

  return {
    exportedAt: new Date().toISOString(),
    issues,
  }
}

export function loadReviewState(): IngredientReviewState {
  try {
    const raw = localStorage.getItem(REVIEW_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as IngredientReviewState
  } catch {
    return {}
  }
}

export function saveReviewState(state: IngredientReviewState) {
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(state))
}
