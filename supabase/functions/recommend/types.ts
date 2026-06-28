export interface HostessRecipeIngredient {
  name: string
  measure?: string
}

export type HostessApprovalTier =
  | 'impeccable'
  | 'respectable'
  | 'tolerable'
  | 'vulgar'
  | 'abomination'

export interface HostessAppraisal {
  tier: HostessApprovalTier
  summary: string
  flags: string[]
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
  hostessAppraisal: HostessAppraisal
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
  houseStrictness: number
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
