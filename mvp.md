# MVP plan

## MVP definition

The first version should prove three things:

- the original ingredient-led utility still works,
- the conversational AI layer feels distinctive,
- and the architecture is disciplined rather than gimmicky.

## MVP scope

### Must have

- Ingredient input
- Cocktail API lookup
- Internal normalization layer
- Ranked recommendations
- AI hostess response for top results
- Recipe detail card
- Quick refinement prompts
- Mobile-friendly responsive UI

### Should have

- Saved cabinet in local app state or user profile
- Favourites
- Basic substitution logic
- A small set of style filters such as dry, bitter, citrusy, or classic

### Could have later

- User auth
- Taste memory
- Occasion mode
- “Buy one bottle next” suggestions
- Session history across devices
- Sharable recommendation links

## Suggested phases

### Phase 0: foundation

- Create new repo
- Add docs pack
- Set naming direction
- Confirm design language
- Wrap cocktail API in a typed service

### Phase 1: functional core

- Ingredient entry UI
- Candidate lookup
- Ranking logic
- Structured recipe display
- Empty and error states

### Phase 2: AI layer

- Add server-side AI orchestration
- Implement hostess system prompt
- Render verdict and rationale with structured cards
- Add refinement chips

### Phase 3: persistence and polish

- Save cabinet
- Save favourites
- Add user preferences
- Improve transitions and mobile details
- Finalize portfolio framing

## MVP success test

A new user should be able to open the product, enter a plausible home cabinet, receive a strong recommendation with personality, and trust the displayed recipe without needing explanation of how the system works.
