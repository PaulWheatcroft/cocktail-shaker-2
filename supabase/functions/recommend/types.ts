export interface HostessCandidateInput {
  name: string
  score: number
  reasons: string[]
  styles?: string[]
  ingredientNames: string[]
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
}

export interface RecommendResponse {
  response: HostessResponseBody
  degraded: boolean
}
