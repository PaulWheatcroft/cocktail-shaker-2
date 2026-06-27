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

export type CategoryImageSource = 'override' | 'keyword' | 'sodaVariant' | 'icon' | 'none'

export interface CategoryImageResolution {
  icon: IconId
  categoryId: string | null
  imageSrc: string | null
  source: CategoryImageSource
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

function matchedSodaVariantId(name: string): string | null {
  const normalized = name.trim().toLowerCase()
  for (const variant of config.sodaVariants) {
    if (variant.keywords.some((keyword) => matchesKeyword(normalized, keyword))) {
      return variant.image
    }
  }
  return null
}

function resolveByIconId(icon: IconId): string | null {
  const categoryId = config.byIcon[icon]
  if (!categoryId) return null
  return categoryId
}

export function resolveCategoryImage(name: string): CategoryImageResolution {
  const trimmed = name.trim()
  if (!trimmed) {
    return { icon: categoryFor(''), categoryId: null, imageSrc: null, source: 'none' }
  }

  const overrideId = config.overrides[trimmed] ?? overrideLower.get(trimmed.toLowerCase())
  if (overrideId) {
    return {
      icon: categoryFor(trimmed),
      categoryId: overrideId,
      imageSrc: imageFileForCategory(overrideId),
      source: 'override',
    }
  }

  for (const rule of config.categoryKeywords ?? []) {
    const normalized = trimmed.toLowerCase()
    if (rule.keywords.some((keyword) => matchesKeyword(normalized, keyword))) {
      return {
        icon: categoryFor(trimmed),
        categoryId: rule.image,
        imageSrc: imageFileForCategory(rule.image),
        source: 'keyword',
      }
    }
  }

  const sodaVariantId = matchedSodaVariantId(trimmed)
  if (sodaVariantId) {
    return {
      icon: categoryFor(trimmed),
      categoryId: sodaVariantId,
      imageSrc: imageFileForCategory(sodaVariantId),
      source: 'sodaVariant',
    }
  }

  const icon = categoryFor(trimmed)
  const categoryId = resolveByIconId(icon)
  return {
    icon,
    categoryId,
    imageSrc: categoryId ? imageFileForCategory(categoryId) : null,
    source: categoryId ? 'icon' : 'none',
  }
}

export function categoryImageSrc(name: string): string | null {
  return resolveCategoryImage(name).imageSrc
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

export function listCategoryImageAssets(): Array<{ id: string; filename: string; src: string }> {
  return Object.entries(config.images)
    .map(([id, filename]) => ({
      id,
      filename,
      src: `/images/ingredients/${filename}`,
    }))
    .sort((a, b) => a.id.localeCompare(b.id))
}
