export interface GreetRequestBody {
  favouriteNames: string[]
  displayName?: string
}

export interface GreetResponseBody {
  greeting: string
  favouritesCommentary?: string
}

export interface GreetResponse {
  response: GreetResponseBody
  degraded: boolean
}
