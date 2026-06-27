export interface GreetRequestBody {
  favouriteNames: string[]
  displayName?: string
  returningWithNoFavourites?: boolean
}

export interface GreetResponseBody {
  greeting: string
  favouritesCommentary?: string
}

export interface GreetResponse {
  response: GreetResponseBody
  degraded: boolean
}
