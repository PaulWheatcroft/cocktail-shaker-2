# Task breakdown

## Setup

- Create new repo for successor project
- Add docs pack
- Set up Vue 3 + TypeScript + Vite
- Configure linting, formatting, and testing
- Add environment config strategy

## Bugs

Track in [docs/bugs.md](docs/bugs.md).

## Data layer

- Identify existing cocktail API endpoints currently used
- Wrap API in typed service module
- Create response normalization layer
- Create ingredient parsing utilities
- Define domain types

## Recommendation engine

- Define scoring inputs
- Implement ranking function
- Add substitution confidence model
- Add style tags and editorial weighting
- Create unit tests for ranking

## UI

- Create ingredient entry surface
- Create cabinet picker
- Create conversation panel
- Create recipe card component
- Create recommendation summary card
- Create loading, empty, and error states

## AI

- Implement orchestration endpoint
- Add system prompt from prompt spec
- Build input payload composer
- Parse structured model response
- Handle fallbacks when AI is unavailable
- *(Phase 4)* Colourful preparation narration — persona rewrite of dull API instructions on recipe card (presentation-only)

## Persistence

- Add saved cabinet model
- Add favourites
- Add preferences for taste and style
- Add optional auth flow

## Portfolio and launch

- Write project README
- Add screenshots and rationale
- Update portfolio site to link original and successor
- Write short evolution note explaining progression from original app to AI-led product
