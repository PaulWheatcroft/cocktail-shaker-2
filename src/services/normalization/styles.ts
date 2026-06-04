import type { StyleTag } from '@/types/domain'

const NAME_RULES: Array<{ pattern: RegExp; styles: StyleTag[] }> = [
  { pattern: /martini/i, styles: ['dry', 'spirit-forward', 'stirred'] },
  { pattern: /negroni/i, styles: ['bitter', 'spirit-forward', 'stirred'] },
  { pattern: /manhattan/i, styles: ['spirit-forward', 'stirred'] },
  { pattern: /old fashioned/i, styles: ['spirit-forward', 'stirred'] },
  { pattern: /daiquiri|margarita|mojito/i, styles: ['citrusy', 'shaken'] },
  { pattern: /collins|fizz|spritz/i, styles: ['citrusy', 'long'] },
]

const INGREDIENT_RULES: Array<{ pattern: RegExp; styles: StyleTag[] }> = [
  { pattern: /campari|aperol|amaro/i, styles: ['bitter'] },
  { pattern: /simple syrup|grenadine|sugar/i, styles: ['sweet'] },
  { pattern: /lemon|lime|orange juice/i, styles: ['citrusy'] },
  { pattern: /dry vermouth/i, styles: ['dry'] },
  { pattern: /gin|vodka|whisky|whiskey|rum|tequila|brandy/i, styles: ['spirit-forward'] },
]

const CATEGORY_RULES: Array<{ pattern: RegExp; styles: StyleTag[] }> = [
  { pattern: /shot|punch|party/i, styles: ['sweet'] },
  { pattern: /ordinary drink|cocktail/i, styles: [] },
]

export function deriveStyles(
  name: string,
  ingredients: string[],
  category?: string,
): StyleTag[] {
  const found = new Set<StyleTag>()
  const text = [name, category ?? '', ...ingredients].join(' ')

  for (const rule of NAME_RULES) {
    if (rule.pattern.test(name)) rule.styles.forEach((s) => found.add(s))
  }
  for (const rule of INGREDIENT_RULES) {
    if (rule.pattern.test(text)) rule.styles.forEach((s) => found.add(s))
  }
  if (category) {
    for (const rule of CATEGORY_RULES) {
      if (rule.pattern.test(category)) rule.styles.forEach((s) => found.add(s))
    }
  }

  return [...found]
}

export function classicStyleBoost(name: string): boolean {
  return /martini|negroni|manhattan|old fashioned|boulevardier/i.test(name)
}
