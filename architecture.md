# Architecture

## Overview

The successor app should use a hybrid architecture:

- cocktail API as the structured recipe source,
- app-side ranking and normalization as the decision layer,
- AI model as the conversational presentation and refinement layer.

This prevents the product from becoming a hallucination-prone chatbot and keeps the recipe experience trustworthy.

## Suggested stack

### Front end

- Vue 3
- TypeScript
- Vite
- Pinia for lightweight state management
- Vue Router if multi-view navigation is needed
- Tailored design system rather than a heavy generic template

### Back end / platform

- Supabase for auth, persistence, favourites, cabinet, and preferences
- Edge function or server route for AI orchestration
- Environment-managed API keys

### AI layer

- Hosted LLM endpoint
- Prompt template with strict persona rules
- Structured JSON payload in, formatted conversational response out

## Data flow

1. User enters ingredients, mood, or refinement request.
2. Front end calls a cocktail service.
3. Cocktail service fetches candidate cocktails from the existing API.
4. Normalization layer maps raw API responses to an internal domain model.
5. Ranking engine scores candidates.
6. Top candidates plus user context are sent to the AI orchestration layer.
7. AI returns hostess-style recommendation text.
8. UI renders conversation and recipe card together.

## Internal domain model

Suggested cocktail shape:

```ts
interface Cocktail {
  id: string
  name: string
  category?: string
  alcoholic?: boolean
  glass?: string
  instructions?: string
  image?: string
  ingredients: Array<{
    name: string
    measure?: string
  }>
  tags: string[]
  baseSpirit?: string
  style?: Array<'dry' | 'bitter' | 'citrusy' | 'sweet' | 'spirit-forward' | 'long' | 'short' | 'stirred' | 'shaken'>
}
```

## Ranking model

Initial score inputs:

- ingredient match ratio,
- number of missing ingredients,
- confidence of substitution,
- style match to user request,
- editorial “house preference” weighting.

Example:

```ts
score = (
  ingredientCoverage * 0.4 +
  styleMatch * 0.25 +
  housePreference * 0.2 +
  substitutionConfidence * 0.15
)
```

## Persistence model

Suggested tables:

- `profiles`
- `cabinet_items`
- `favourite_cocktails`
- `saved_preferences`
- `conversation_sessions`
- `conversation_messages`

## AI orchestration contract

### Input

```json
{
  "userRequest": "I want something dry and serious",
  "availableIngredients": ["gin", "dry vermouth", "campari", "lemon"],
  "topCandidates": [
    {
      "name": "Dry Martini",
      "score": 0.93,
      "reasons": ["high ingredient match", "strong style fit"]
    }
  ],
  "personaMode": "house_hostess"
}
```

### Output

```json
{
  "verdict": "A Martini is the only properly civilised answer.",
  "primaryRecommendation": "Dry Martini",
  "rationale": "It best matches the cabinet and the requested style.",
  "alternatives": ["Negroni"],
  "followUpSuggestions": ["Make it drier", "Show the recipe", "Suggest a substitute"]
}
```

## Key engineering principle

The AI should comment on options produced by the system. It should not be the sole source of truth about what cocktails exist or what ingredients they contain.

## Repo structure suggestion

```text
src/
  components/
  features/
    cabinet/
    cocktails/
    conversation/
    preferences/
  services/
    cocktailApi/
    ranking/
    ai/
  stores/
  types/
  pages/
docs/
```

## Phase-friendly approach

Build in this order:

1. typed cocktail API service,
2. normalized domain layer,
3. ranking engine,
4. recipe-first UI,
5. AI hostess integration,
6. persistence and profile depth.
