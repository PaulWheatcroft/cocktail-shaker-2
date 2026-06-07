/**
 * Raw TheCocktailDB API shapes (v1 JSON).
 * @see docs/api-contract.md
 */

export interface CocktailDbDrink {
  idDrink: string
  strDrink: string
  strDrinkAlternate?: string | null
  strTags?: string | null
  strVideo?: string | null
  strCategory?: string | null
  strIBA?: string | null
  strAlcoholic?: string | null
  strGlass?: string | null
  strInstructions?: string | null
  strDrinkThumb?: string | null
  strIngredient1?: string | null
  strIngredient2?: string | null
  strIngredient3?: string | null
  strIngredient4?: string | null
  strIngredient5?: string | null
  strIngredient6?: string | null
  strIngredient7?: string | null
  strIngredient8?: string | null
  strIngredient9?: string | null
  strIngredient10?: string | null
  strIngredient11?: string | null
  strIngredient12?: string | null
  strIngredient13?: string | null
  strIngredient14?: string | null
  strIngredient15?: string | null
  strMeasure1?: string | null
  strMeasure2?: string | null
  strMeasure3?: string | null
  strMeasure4?: string | null
  strMeasure5?: string | null
  strMeasure6?: string | null
  strMeasure7?: string | null
  strMeasure8?: string | null
  strMeasure9?: string | null
  strMeasure10?: string | null
  strMeasure11?: string | null
  strMeasure12?: string | null
  strMeasure13?: string | null
  strMeasure14?: string | null
  strMeasure15?: string | null
  strCreativeCommonsConfirmed?: string | null
  dateModified?: string | null
}

/** TheCocktailDB returns the string `"None Found"` when a filter has no matches. */
export type CocktailDbDrinksField =
  | Array<CocktailDbDrink | null>
  | null
  | 'None Found'

export interface CocktailDbFilterResponse {
  drinks: CocktailDbDrinksField
}

export interface CocktailDbIngredientRow {
  strIngredient1: string
}

export interface CocktailDbIngredientListResponse {
  drinks: Array<CocktailDbIngredientRow | null> | null
}

export interface CocktailDbLookupResponse {
  drinks: Array<CocktailDbDrink | null> | null
}

export type CocktailApiErrorCode = 'network' | 'not_found' | 'malformed' | 'rate_limit'

export class CocktailApiError extends Error {
  constructor(
    message: string,
    readonly code: CocktailApiErrorCode,
    readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'CocktailApiError'
  }
}
