import categories from '../../../public/images/ingredients/categories.json'
import { categoryFor, type IconId } from './ingredientGraphics'

interface SodaVariant {
  image: string
  keywords: string[]
}

interface CategoryConfig {
  images: Record<string, string>
  byIcon: Partial<Record<IconId, string>>
  sodaVariants: SodaVariant[]
  categoryKeywords?: SodaVariant[]
  overrides: Record<string, string>
}

const config = categories as CategoryConfig

const overrideLower = new Map(
  Object.entries(config.overrides).map(([name, imageId]) => [name.toLowerCase(), imageId]),
)

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function matchesKeyword(haystack: string, keyword: string): boolean {
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(keyword)}([^a-z0-9]|$)`, 'i')
  return pattern.test(haystack)
}

function imageFileForCategory(categoryId: string): string | null {
  const filename = config.images[categoryId]
  if (!filename) return null
  return `/images/ingredients/${filename}`
}

function resolveOverride(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return null
  const overrideId = config.overrides[trimmed] ?? overrideLower.get(trimmed.toLowerCase())
  if (!overrideId) return null
  return imageFileForCategory(overrideId)
}

function resolveKeywordCategory(name: string, rules: SodaVariant[]): string | null {
  const normalized = name.trim().toLowerCase()
  for (const rule of rules) {
    if (rule.keywords.some((keyword) => matchesKeyword(normalized, keyword))) {
      return imageFileForCategory(rule.image)
    }
  }
  return null
}

function matchedSodaVariantId(name: string): string | null {
  const normalized = name.trim().toLowerCase()
  for (const variant of config.sodaVariants) {
    if (variant.keywords.some((keyword) => matchesKeyword(normalized, keyword))) {
      return variant.image
    }
  }
  return null
}

function resolveByIcon(icon: IconId): string | null {
  const categoryId = config.byIcon[icon]
  if (!categoryId) return null
  return imageFileForCategory(categoryId)
}

export function categoryImageSrc(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return null

  const override = resolveOverride(trimmed)
  if (override) return override

  const keywordMatch = resolveKeywordCategory(trimmed, config.categoryKeywords ?? [])
  if (keywordMatch) return keywordMatch

  const icon = categoryFor(trimmed)
  if (icon === 'soda') {
    const variantId = matchedSodaVariantId(trimmed)
    if (variantId) {
      return imageFileForCategory(variantId)
    }
  }

  return resolveByIcon(icon)
}

export function missingCategoryImages(): string[] {
  const referenced = new Set<string>(Object.values(config.byIcon).filter(Boolean) as string[])
  for (const variant of config.sodaVariants) {
    referenced.add(variant.image)
  }
  for (const rule of config.categoryKeywords ?? []) {
    referenced.add(rule.image)
  }
  for (const overrideId of Object.values(config.overrides)) {
    referenced.add(overrideId)
  }

  return [...referenced]
    .filter((categoryId) => !config.images[categoryId])
    .sort()
}

export function availableCategoryImages(): string[] {
  return Object.keys(config.images).sort()
}
