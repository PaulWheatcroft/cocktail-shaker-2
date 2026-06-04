const ALIASES: Record<string, string> = {
  'dry vermouth': 'dry vermouth',
  vermouth: 'vermouth',
  'sweet vermouth': 'sweet vermouth',
  'lime juice': 'lime juice',
  'lemon juice': 'lemon juice',
}

export function canonicalize(name: string): string {
  const trimmed = name.trim().toLowerCase()
  if (!trimmed) return ''
  return ALIASES[trimmed] ?? trimmed
}

export function ingredientsMatch(a: string, b: string): boolean {
  return canonicalize(a) === canonicalize(b)
}

/** 1 = exact match, 0.5 = partial (one contains the other), 0 = no match */
export function matchScore(cabinetIngredient: string, recipeIngredient: string): number {
  const c = canonicalize(cabinetIngredient)
  const r = canonicalize(recipeIngredient)
  if (!c || !r) return 0
  if (c === r) return 1
  if (r.includes(c) || c.includes(r)) return 0.5
  return 0
}

export function cabinetCoverage(
  cabinet: string[],
  recipeIngredients: string[],
): { ratio: number; matched: number; total: number } {
  const canonCabinet = cabinet.map(canonicalize).filter(Boolean)
  const canonRecipe = recipeIngredients.map(canonicalize).filter(Boolean)
  if (canonRecipe.length === 0) {
    return { ratio: 0, matched: 0, total: 0 }
  }

  let matched = 0
  for (const recipeIng of canonRecipe) {
    const best = Math.max(...canonCabinet.map((c) => matchScore(c, recipeIng)), 0)
    if (best >= 0.5) matched++
  }

  return {
    ratio: matched / canonRecipe.length,
    matched,
    total: canonRecipe.length,
  }
}
