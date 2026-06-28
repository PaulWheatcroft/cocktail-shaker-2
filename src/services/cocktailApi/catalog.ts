import { fetchIngredientCatalog } from './client'

let catalogPromise: Promise<string[]> | null = null

/** Common shorthands → name as returned by list.php (case-insensitive match). */
const CATALOG_LOOKUP_ALIASES: Record<string, string> = {
  coke: 'Coca-Cola',
  cola: 'Coca-Cola',
  'coca cola': 'Coca-Cola',
}

async function loadCatalog(): Promise<string[]> {
  if (!catalogPromise) {
    catalogPromise = fetchIngredientCatalog()
  }
  return catalogPromise
}

function lookupName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return trimmed
  return CATALOG_LOOKUP_ALIASES[trimmed.toLowerCase()] ?? trimmed
}

function findCatalogEntry(list: string[], name: string): string | null {
  const upper = name.toUpperCase()
  return list.find((i) => i.toUpperCase() === upper) ?? null
}

export async function validateIngredient(name: string): Promise<boolean> {
  return (await resolveCatalogIngredient(name)) !== null
}

/** Catalogue spelling for API filter URLs (case/spacing as returned by list.php). */
export async function resolveCatalogIngredient(name: string): Promise<string | null> {
  const trimmed = name.trim()
  if (!trimmed) return null
  const list = await loadCatalog()
  return findCatalogEntry(list, lookupName(trimmed))
}

export async function suggestIngredients(prefix: string, limit = 12): Promise<string[]> {
  const trimmed = prefix.trim()
  if (!trimmed) return []
  const list = await loadCatalog()
  const upperPrefix = trimmed.toUpperCase()

  const matches = list.filter((i) => i.toUpperCase().startsWith(upperPrefix))

  for (const [alias, target] of Object.entries(CATALOG_LOOKUP_ALIASES)) {
    if (!alias.toUpperCase().startsWith(upperPrefix)) continue
    const resolved = findCatalogEntry(list, target)
    if (resolved && !matches.some((m) => m.toUpperCase() === resolved.toUpperCase())) {
      matches.unshift(resolved)
    }
  }

  return matches.slice(0, limit)
}

export async function getIngredientCatalog(): Promise<string[]> {
  return loadCatalog()
}

export function resetCatalogCache(): void {
  catalogPromise = null
}
