import { canonicalize } from '@/services/normalization/ingredients'
import { getSubstitutionNote } from '@/services/substitutions'
import type { HostessRequest, RankedCandidate } from '@/types/domain'

export function composeHostessRequest(
  userRequest: string,
  cabinet: string[],
  ranked: RankedCandidate[],
): HostessRequest {
  const topCandidates = ranked.slice(0, 5).map((r) => ({
    name: r.cocktail.name,
    score: Math.round(r.score * 100) / 100,
    reasons: r.reasons,
    styles: r.cocktail.style,
    ingredientNames: r.cocktail.ingredients.map((i) => i.name),
  }))

  const substitutionNotes: string[] = []
  const canonCabinet = cabinet.map(canonicalize)

  for (const candidate of ranked.slice(0, 5)) {
    for (const ing of candidate.cocktail.ingredients) {
      const recipeCanon = canonicalize(ing.name)
      const has = canonCabinet.some((c) => c === recipeCanon)
      if (has) continue
      const note = getSubstitutionNote(ing.name, cabinet)
      if (note) {
        substitutionNotes.push(
          `${note.missing}: ${note.substitute} (${note.confidence})`,
        )
      }
    }
  }

  return {
    userRequest: userRequest.trim() || 'What should I make from my cabinet?',
    availableIngredients: cabinet,
    topCandidates,
    personaMode: 'house_hostess',
    substitutionNotes: [...new Set(substitutionNotes)].slice(0, 8),
  }
}
