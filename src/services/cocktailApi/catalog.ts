import { fetchIngredientCatalog } from './client'

let catalogPromise: Promise<string[]> | null = null
let catalogUpper: Set<string> | null = null

async function loadCatalog(): Promise<string[]> {
  if (!catalogPromise) {
    catalogPromise = fetchIngredientCatalog()
  }
  return catalogPromise
}

async function upperSet(): Promise<Set<string>> {
  if (!catalogUpper) {
    const list = await loadCatalog()
    catalogUpper = new Set(list.map((i) => i.toUpperCase()))
  }
  return catalogUpper
}

export async function validateIngredient(name: string): Promise<boolean> {
  const trimmed = name.trim()
  if (!trimmed) return false
  const set = await upperSet()
  return set.has(trimmed.toUpperCase())
}

export async function suggestIngredients(prefix: string, limit = 12): Promise<string[]> {
  const trimmed = prefix.trim()
  if (!trimmed) return []
  const list = await loadCatalog()
  const upperPrefix = trimmed.toUpperCase()
  return list
    .filter((i) => i.toUpperCase().startsWith(upperPrefix))
    .slice(0, limit)
}

export function resetCatalogCache(): void {
  catalogPromise = null
  catalogUpper = null
}
