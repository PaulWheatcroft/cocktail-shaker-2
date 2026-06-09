/**
 * Maps an open-ended ingredient name (catalogue item or free text) to one of a
 * fixed set of flat graphic categories. Every ingredient resolves to something:
 * unmatched names fall back to a generic `bottle`.
 *
 * Rules are evaluated in order and the first match wins, so more specific
 * categories must come before broader ones (e.g. `ginger ale` -> soda before
 * `ginger` -> spice). Keywords match on word boundaries to avoid collisions
 * such as `gin` inside `ginger`.
 */

export type IconId =
  | 'gin'
  | 'vodka'
  | 'whisky'
  | 'rum'
  | 'tequila'
  | 'brandy'
  | 'absinthe'
  | 'vermouth'
  | 'bitters'
  | 'liqueur'
  | 'wine'
  | 'sparkling'
  | 'fortified'
  | 'soda'
  | 'juice'
  | 'coffee'
  | 'tea'
  | 'milk'
  | 'syrup'
  | 'citrus'
  | 'berries'
  | 'herb'
  | 'egg'
  | 'ice'
  | 'cherry'
  | 'cucumber'
  | 'olive'
  | 'spice'
  | 'sugar'
  | 'salt'
  | 'bottle'
  | 'food'

export const FALLBACK_ICON: IconId = 'bottle'

interface Rule {
  icon: IconId
  keywords: string[]
}

// Order matters: specific categories first, broad ones last.
const RULES: Rule[] = [
  // Spirits
  { icon: 'gin', keywords: ['gin', 'sloe gin'] },
  { icon: 'vodka', keywords: ['vodka'] },
  { icon: 'whisky', keywords: ['whisky', 'whiskey', 'scotch', 'bourbon', 'rye'] },
  { icon: 'rum', keywords: ['rum', 'cachaca', 'cachaça'] },
  { icon: 'tequila', keywords: ['tequila', 'mezcal'] },
  { icon: 'brandy', keywords: ['brandy', 'cognac', 'armagnac', 'pisco', 'calvados'] },
  { icon: 'absinthe', keywords: ['absinthe', 'pastis', 'sambuca', 'ouzo'] },

  // Fortified / wine / sparkling (before generic liqueur)
  { icon: 'vermouth', keywords: ['vermouth'] },
  { icon: 'bitters', keywords: ['bitters', 'campari', 'aperol', 'angostura'] },
  { icon: 'sparkling', keywords: ['champagne', 'prosecco', 'cava', 'sparkling wine'] },
  { icon: 'fortified', keywords: ['port', 'sherry', 'madeira', 'marsala'] },
  { icon: 'wine', keywords: ['wine', 'lillet', 'sake'] },

  // Liqueurs
  {
    icon: 'liqueur',
    keywords: [
      'liqueur',
      'triple sec',
      'cointreau',
      'curacao',
      'curaçao',
      'amaretto',
      'schnapps',
      'kahlua',
      'baileys',
      'chartreuse',
      'midori',
      'grand marnier',
      'galliano',
      'drambuie',
      'chambord',
      'frangelico',
      'creme',
      'crème',
    ],
  },

  // Mixers / non-alcoholic liquids
  { icon: 'syrup', keywords: ['syrup', 'grenadine', 'honey', 'agave', 'gomme', 'orgeat', 'nectar'] },
  { icon: 'milk', keywords: ['milk', 'cream', 'half-and-half', 'condensed'] },
  { icon: 'coffee', keywords: ['coffee', 'espresso'] },
  { icon: 'tea', keywords: ['tea'] },
  {
    icon: 'soda',
    keywords: [
      'soda',
      'tonic',
      'cola',
      'coke',
      'ginger ale',
      'ginger beer',
      'club soda',
      'sparkling water',
      'lemonade',
      'sprite',
      '7-up',
      'water',
    ],
  },
  { icon: 'juice', keywords: ['juice'] },

  // Food / garnish
  { icon: 'citrus', keywords: ['lemon', 'lime', 'orange', 'grapefruit', 'citrus'] },
  {
    icon: 'berries',
    keywords: ['berry', 'berries', 'strawberr', 'raspberr', 'blueberr', 'blackberr', 'cranberr'],
  },
  { icon: 'cherry', keywords: ['cherry', 'cherries', 'maraschino'] },
  { icon: 'cucumber', keywords: ['cucumber'] },
  { icon: 'olive', keywords: ['olive'] },
  { icon: 'herb', keywords: ['mint', 'basil', 'herb', 'rosemary', 'thyme', 'leaf', 'leaves'] },
  { icon: 'egg', keywords: ['egg'] },
  { icon: 'spice', keywords: ['cinnamon', 'nutmeg', 'clove', 'pepper', 'ginger', 'vanilla', 'spice'] },
  { icon: 'sugar', keywords: ['sugar'] },
  { icon: 'salt', keywords: ['salt'] },
  { icon: 'ice', keywords: ['ice'] },
]

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function matchesKeyword(haystack: string, keyword: string): boolean {
  // Word-boundary match so `gin` does not match `ginger`.
  const pattern = new RegExp(`(^|[^a-z])${escapeRegExp(keyword)}([^a-z]|$)`, 'i')
  return pattern.test(haystack)
}

export function categoryFor(name: string): IconId {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return FALLBACK_ICON
  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => matchesKeyword(normalized, keyword))) {
      return rule.icon
    }
  }
  return FALLBACK_ICON
}
