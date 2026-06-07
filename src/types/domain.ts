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

export interface HostessRecipeIngredient {
  name: string
  measure?: string
}

export interface HostessCandidatePayload {
  name: string
  score: number
  reasons: string[]
  styles?: string[]
  ingredientNames: string[]
  glass?: string
  sourceInstructions?: string
  ingredients?: HostessRecipeIngredient[]
}

export interface HostessRequest {
  userRequest: string
  availableIngredients: string[]
  topCandidates: HostessCandidatePayload[]
  personaMode: 'house_hostess'
  substitutionNotes?: string[]
}

export interface DrinkPresentation {
  name: string
  pitch: string
  preparationSteps: string[]
}

export interface HostessResponse {
  verdict: string
  primaryRecommendation: string
  rationale: string
  alternatives: string[]
  followUpSuggestions: string[]
  drinkPresentations: DrinkPresentation[]
}

export interface GreetingResponse {
  greeting: string
  favouritesCommentary?: string
}

export type SubstitutionConfidence = 'acceptable' | 'tolerable' | 'regrettable'

export interface SubstitutionNote {
  missing: string
  substitute: string
  confidence: SubstitutionConfidence
}
