export interface HostessRecipeIngredient {
  name: string
  measure?: string
}

export interface HostessCandidateInput {
  name: string
  score: number
  reasons: string[]
  styles?: string[]
  ingredientNames: string[]
  glass?: string
  sourceInstructions?: string
  ingredients?: HostessRecipeIngredient[]
}

export interface DrinkPresentationBody {
  name: string
  pitch: string
  preparationSteps: string[]
}

export interface HostessRequestBody {
  userRequest: string
  availableIngredients: string[]
  topCandidates: HostessCandidateInput[]
  personaMode: 'house_hostess'
  substitutionNotes?: string[]
}

export interface HostessResponseBody {
  verdict: string
  primaryRecommendation: string
  rationale: string
  alternatives: string[]
  followUpSuggestions: string[]
  drinkPresentations: DrinkPresentationBody[]
}

export interface RecommendResponse {
  response: HostessResponseBody
  degraded: boolean
}
