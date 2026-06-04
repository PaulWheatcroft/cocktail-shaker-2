/**
 * Internal domain model — authoritative for app logic.
 * @see architecture.md
 */

export type StyleTag =
  | 'dry'
  | 'bitter'
  | 'citrusy'
  | 'sweet'
  | 'spirit-forward'
  | 'long'
  | 'short'
  | 'stirred'
  | 'shaken'

export interface CocktailIngredient {
  name: string
  measure?: string
}

export interface Cocktail {
  id: string
  name: string
  category?: string
  alcoholic?: boolean
  glass?: string
  instructions?: string
  image?: string
  ingredients: CocktailIngredient[]
  tags: string[]
  baseSpirit?: string
  style?: StyleTag[]
}

export interface RankedCandidate {
  cocktail: Cocktail
  score: number
  reasons: string[]
}

export interface HostessRequest {
  userRequest: string
  availableIngredients: string[]
  topCandidates: Array<{
    name: string
    score: number
    reasons: string[]
  }>
  personaMode: 'house_hostess'
  substitutionNotes?: string[]
}

export interface HostessResponse {
  verdict: string
  primaryRecommendation: string
  rationale: string
  alternatives: string[]
  followUpSuggestions: string[]
}

export type SubstitutionConfidence = 'acceptable' | 'tolerable' | 'regrettable'

export interface SubstitutionNote {
  missing: string
  substitute: string
  confidence: SubstitutionConfidence
}
