import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface CategoryConfig {
  images: Record<string, string>
  byIcon: Record<string, string>
  sodaVariants: Array<{ image: string; keywords: string[] }>
  categoryKeywords?: Array<{ image: string; keywords: string[] }>
  overrides: Record<string, string>
}

const configPath = resolve(import.meta.dirname, '../public/images/ingredients/categories.json')
const config = JSON.parse(readFileSync(configPath, 'utf8')) as CategoryConfig

const referenced = new Set<string>([
  ...Object.values(config.byIcon),
  ...config.sodaVariants.map((variant) => variant.image),
  ...(config.categoryKeywords ?? []).map((rule) => rule.image),
  ...Object.values(config.overrides),
])

const available = new Set(Object.keys(config.images))
const missing = [...referenced].filter((id) => !available.has(id)).sort()
const have = [...available].sort()

console.log('Category images available:')
for (const id of have) {
  console.log(`  ✓ ${id} → ${config.images[id]}`)
}

console.log('\nCategory images needed:')
if (!missing.length) {
  console.log('  (none — all referenced categories have assets)')
} else {
  for (const id of missing) {
    console.log(`  ✗ ${id}`)
  }
}
