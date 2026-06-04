# PRD: AI cocktail successor

## Overview

This product is a modern successor to the original Cocktail Shaker app, which publicly presents cocktail recipes based on ingredients the user already has in their drinks cabinet.[cite:2]

The successor should preserve that core utility while evolving it into a conversational, personality-led experience. Instead of behaving like a neutral recipe finder, the product should feel like consulting an opinionated cocktail expert with standards.

The original app remains untouched as a portfolio artifact. This project is a separate product that demonstrates progression in product thinking, UX design, architecture, and AI integration.

## Product idea

Users tell the app what they have, what mood they are in, or what kind of drink they want. The system uses a cocktail API as the factual data layer and an AI hostess as the conversational layer. The hostess recommends, judges, explains, and refines options in character.

## Problem

Most cocktail apps are either static recipe catalogues or shallow ingredient filters. They can tell users what exists, but they rarely help users decide what is appropriate, what suits a mood, what can be improved with substitutions, or which option is actually the best from a limited home cabinet.

## Opportunity

The original app already proves a useful foundation: ingredient-led discovery from the user’s cabinet.[cite:2]

The opportunity is to turn that mechanic into a more distinctive, premium-feeling product with:

- conversational discovery,
- taste-driven recommendation,
- memorable brand voice,
- cabinet persistence,
- and better product framing.

## Goals

- Reuse the cocktail API as the source of structured recipe truth.
- Keep the original app separate and unchanged.
- Build a more conversational UX around the same core user need.
- Make the AI expert feel sharp, witty, refined, and useful.
- Add enough depth that the app feels like a real product, not a chatbot wrapper.

## Non-goals

- Replacing the original app in the portfolio.
- Letting the LLM freely invent canonical recipes when the API already provides them.
- Building a social network or marketplace in v1.
- Supporting every possible cocktail edge case on day one.

## Target user

Primary user:
- enjoys cocktails at home,
- has a partial drinks cabinet,
- wants recommendations from available ingredients,
- likes personality and taste in consumer products,
- values guidance over raw search.

Secondary user:
- wants a portfolio-worthy example of AI product design that combines structured data with authored UX.

## Core value proposition

A conversational cocktail advisor with standards: it tells users what they can make, what they should make, and what choices are tasteful, all grounded in real cocktail data.

## User stories

- As a user, I want to enter ingredients I already have and get viable cocktail suggestions.
- As a user, I want one recommendation to feel clearly best, not just see a flat list.
- As a user, I want to ask follow-up questions naturally, such as “make it drier” or “what if I have no vermouth?”.
- As a user, I want the app to remember my cabinet so I do not re-enter everything every session.
- As a user, I want the recommendations to have personality, but still trust the recipe details.
- As a user, I want to understand why one drink is recommended over another.

## Experience principles

### Personality serves utility

The hostess must be memorable, but her character should sharpen recommendations rather than distract from them.

### Structured truth first

Recipe facts should come from the cocktail API and internal app logic. The AI layer should explain, compare, rank, and converse.

### One strong recommendation

The app should usually present one primary recommendation with supporting alternatives, not dump a large undifferentiated list.

### Fast to use

The conversational UX should not slow the user down. Quick prompts, chips, saved cabinet data, and structured recipe cards should keep the experience efficient.

## Core flows

### Flow 1: Quick cabinet check

1. User enters ingredients or chooses saved cabinet items.
2. System finds matching cocktails using the API.
3. Ranking logic scores candidates.
4. Hostess presents a primary recommendation and up to two alternatives.
5. User can open the recipe card and refine.

### Flow 2: Conversational refinement

1. User responds with a refinement request.
2. System re-ranks or filters candidates.
3. Hostess explains the revised recommendation.
4. Recipe card updates beneath the conversation.

### Flow 3: Missing ingredient recovery

1. User asks whether a missing ingredient can be substituted.
2. System checks substitution rules and nearby matches.
3. Hostess provides an acceptable substitution or rejects the compromise.

## Functional requirements

- Ingredient entry and cabinet selection
- Cocktail API integration for recipe lookup
- Normalized internal cocktail model
- Ranked recommendation engine
- Conversational response layer
- Saved favourites
- Saved cabinet
- Recipe detail view
- Refinement prompts
- Basic substitution support
- Session history for the current chat

## Future requirements

- User taste profile
- “One bottle to buy next” suggestions
- Occasion mode
- Seasonal recommendations
- House rules / preferred ratios
- Authenticated multi-device persistence

## Success criteria

### Product

- A user can get from “what do I have?” to a strong recommendation in under a minute.
- The app feels distinctive because of the hostess and the editorial judgement.
- The result feels trustworthy because the recipe is grounded in structured data.

### Portfolio

- The original app remains as a visible earlier-stage artifact.[cite:2]
- The new app clearly demonstrates progression in architecture, UX framing, AI design, and product sense.

## Risks

- The character voice could become repetitive or too comedic.
- The AI layer could hallucinate if not constrained by structured inputs.
- API data quality may vary, so a normalization layer is required.
- Conversation could feel slower than filters if the UX is overdesigned.

## Open questions

- Which cocktail API fields are reliable enough to normalize directly?
- Should the first version require sign-in for cabinet persistence?
- Should the hostess have a visible avatar or remain text-led?
- How many recipes should be shown before the experience feels list-like again?
