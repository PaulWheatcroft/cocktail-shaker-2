import type { HostessApprovalTier, StyleTag } from '@/types/domain'
import { classicStyleBoost } from '@/services/normalization/styles'
import { HOUSE_FAVOURITES, NOVELTY_NAME_PATTERN } from './noveltyPatterns'
import { housePreferenceScore } from './housePreferences'

export type { HostessApprovalTier }

export interface DrinkAppraisalInput {
  name: string
  ingredients: Array<{ name: string; measure?: string }>
  instructions?: string
  tags?: string[]
  styles?: StyleTag[]
  glass?: string
  houseStrictness: number
}

export interface DrinkAppraisal {
  tier: HostessApprovalTier
  score: number
  flags: string[]
  summary: string
}

const TIER_ORDER: HostessApprovalTier[] = [
  'impeccable',
  'respectable',
  'tolerable',
  'vulgar',
  'abomination',
]

const ICE_CREAM = /ice cream|ice-cream|gelato|sorbet/i
const CARBONATED_SODA = /cola|coke|pepsi|soda|lemonade|ginger ale|sprite|fanta|dr pepper|root beer/i
const SPIRIT = /bourbon|whisky|whiskey|rum|gin|vodka|tequila|brandy|scotch|rye|mezcal|cognac/i
const DESSERT = /ice cream|whipped cream|chocolate syrup|grenadine|caramel sauce|maraschino|candy|syrup/i
const BALANCE = /campari|vermouth|bitters|lemon juice|lime juice|grapefruit|orange juice|aperol|amaro|dry vermouth/i
const TECHNIQUE = /stir|shake|strain|muddle|roll|blend|express|fine strain|double strain/i

function ingredientText(ingredients: DrinkAppraisalInput['ingredients']): string {
  return ingredients.map((i) => `${i.measure ?? ''} ${i.name}`).join(' ').toLowerCase()
}

function hasPattern(text: string, pattern: RegExp): boolean {
  return pattern.test(text)
}

function countMatches(text: string, pattern: RegExp): number {
  return (text.match(new RegExp(pattern.source, 'gi')) ?? []).length
}

function detectFlags(input: DrinkAppraisalInput): string[] {
  const flags: string[] = []
  const names = ingredientText(input.ingredients)
  const allText = `${input.name} ${names} ${input.instructions ?? ''}`.toLowerCase()

  const hasIceCream = hasPattern(names, ICE_CREAM)
  const hasSoda = hasPattern(names, CARBONATED_SODA)
  const hasSpirit = hasPattern(names, SPIRIT)
  const hasBalance = hasPattern(names, BALANCE)

  if (hasIceCream && hasSoda && hasSpirit) {
    flags.push('float_dessert_denial')
  }

  if (hasSoda && hasSpirit && !hasBalance) {
    const fullServe =
      /can|bottle|\d+\s*(oz|cl|ml)\s*(cola|coke|soda)/i.test(names) ||
      names.includes('coca-cola') ||
      names.includes('coke')
    if (fullServe || countMatches(names, CARBONATED_SODA) >= 1) {
      flags.push('soda_drowning')
    }
  }

  if (NOVELTY_NAME_PATTERN.test(input.name)) {
    flags.push('novelty_name')
  }

  if (countMatches(names, DESSERT) >= 2) {
    flags.push('dessert_pile_on')
  }

  const instructions = input.instructions?.toLowerCase() ?? ''
  if (
    instructions &&
    !hasPattern(instructions, TECHNIQUE) &&
    (hasIceCream || hasSoda) &&
    /pour|scoop|add|top|fill|stir gently/i.test(instructions)
  ) {
    flags.push('technique_absence')
  }

  if (input.tags?.some((t) => t.includes('party') || t.includes('punch'))) {
    flags.push('party_drink')
  }

  if (input.styles?.includes('sweet') && !input.styles?.includes('bitter') && hasSpirit) {
    flags.push('cloying_profile')
  }

  if (flags.length === 0 && allText.includes('beer mug')) {
    flags.push('novelty_vessel')
  }

  return flags
}

function baseTierFromHouseScore(houseScore: number, name: string): HostessApprovalTier {
  const lower = name.toLowerCase()
  const isClassic =
    HOUSE_FAVOURITES.some((f) => lower.includes(f)) || classicStyleBoost(name)

  if (houseScore >= 0.9 && isClassic) return 'impeccable'
  if (houseScore >= 0.8) return 'respectable'
  if (houseScore >= 0.55) return 'tolerable'
  if (houseScore >= 0.35) return 'vulgar'
  return 'abomination'
}

function tierFromFlags(base: HostessApprovalTier, flags: string[]): HostessApprovalTier {
  let idx = TIER_ORDER.indexOf(base)

  if (flags.includes('float_dessert_denial')) idx = Math.max(idx, TIER_ORDER.indexOf('abomination'))
  else if (flags.includes('soda_drowning') && flags.includes('dessert_pile_on')) {
    idx = Math.max(idx, TIER_ORDER.indexOf('abomination'))
  } else if (flags.includes('soda_drowning') || flags.includes('dessert_pile_on')) {
    idx = Math.max(idx, TIER_ORDER.indexOf('vulgar'))
  }

  if (flags.includes('novelty_name')) idx = Math.max(idx, TIER_ORDER.indexOf('vulgar'))
  if (flags.includes('party_drink')) idx = Math.max(idx, TIER_ORDER.indexOf('vulgar'))
  if (flags.includes('technique_absence')) idx = Math.min(TIER_ORDER.length - 1, idx + 1)
  if (flags.includes('cloying_profile')) idx = Math.min(TIER_ORDER.length - 1, idx + 1)
  if (flags.includes('novelty_vessel')) idx = Math.min(TIER_ORDER.length - 1, idx + 1)

  return TIER_ORDER[idx]!
}

function applyStrictness(tier: HostessApprovalTier, strictness: number): HostessApprovalTier {
  const idx = TIER_ORDER.indexOf(tier)
  if (strictness >= 70) return TIER_ORDER[Math.min(TIER_ORDER.length - 1, idx + 1)]!
  if (strictness <= 30) return TIER_ORDER[Math.max(0, idx - 1)]!
  return tier
}

function tierToScore(tier: HostessApprovalTier): number {
  const map: Record<HostessApprovalTier, number> = {
    impeccable: 0.95,
    respectable: 0.78,
    tolerable: 0.58,
    vulgar: 0.32,
    abomination: 0.12,
  }
  return map[tier]
}

function buildSummary(input: DrinkAppraisalInput, tier: HostessApprovalTier, flags: string[]): string {
  const spirit = input.ingredients.find((i) => SPIRIT.test(i.name))?.name
  const soda = input.ingredients.find((i) => CARBONATED_SODA.test(i.name))?.name
  const dessert = input.ingredients.find((i) => ICE_CREAM.test(i.name) || DESSERT.test(i.name))?.name

  if (flags.includes('float_dessert_denial')) {
    const parts = [spirit, soda, dessert].filter(Boolean)
    const vessel = input.glass ? ` in a ${input.glass.toLowerCase()}` : ''
    return `${parts.join(', ')} assembled as a carbonated dessert float${vessel} — not a cocktail.`
  }

  if (tier === 'abomination') {
    return `${input.name} — an avoidable embarrassment with no redeeming discipline.`
  }

  if (tier === 'vulgar') {
    return `${input.name} — vulgar, sticky, and socially exhausting.`
  }

  if (tier === 'impeccable') {
    return `${input.name} — a proper, civilised choice.`
  }

  if (tier === 'respectable') {
    return `${input.name} — respectable and disciplined.`
  }

  return `${input.name} — tolerable given what one has on hand.`
}

export function appraiseDrink(input: DrinkAppraisalInput): DrinkAppraisal {
  const flags = detectFlags(input)
  const houseScore = housePreferenceScore(
    input.name,
    input.tags ?? [],
    input.houseStrictness,
  )
  const base = baseTierFromHouseScore(houseScore, input.name)
  const flagged = tierFromFlags(base, flags)
  const tier = applyStrictness(flagged, input.houseStrictness)
  const score = tierToScore(tier)

  return {
    tier,
    score,
    flags,
    summary: buildSummary(input, tier, flags),
  }
}

export function fallbackPitchForTier(
  tier: HostessApprovalTier,
  reasons: string[],
  name: string,
): string {
  const reasonText = reasons.length ? reasons.join('; ') : ''

  switch (tier) {
    case 'impeccable':
      return reasonText
        ? `${reasonText} — impeccable.`
        : `${name} — an impeccable choice from what you have on hand.`
    case 'respectable':
      return reasonText
        ? `${reasonText} — respectable.`
        : `${name} — a respectable choice from what you have on hand.`
    case 'tolerable':
      return reasonText
        ? `Tolerable at best: ${reasonText}.`
        : `${name} — tolerable, though one lowers expectations fractionally.`
    case 'vulgar':
      return `${name} is vulgar and undisciplined${reasonText ? ` (${reasonText})` : ''}.`
    case 'abomination':
      return `${name} is an abomination — an avoidable embarrassment${reasonText ? `, though ${reasonText}` : ''}.`
  }
}

export function fallbackVerdictForTier(tier: HostessApprovalTier): string {
  switch (tier) {
    case 'impeccable':
      return 'Impeccable taste — one approves without reservation.'
    case 'respectable':
      return 'The cabinet points to a respectable choice.'
    case 'tolerable':
      return 'We can make something tolerable from this cabinet, though expectations must be managed.'
    case 'vulgar':
      return 'Nothing here is respectable — only something vulgar will do.'
    case 'abomination':
      return 'Your cabinet offers nothing civilised — only an abomination remains.'
  }
}
