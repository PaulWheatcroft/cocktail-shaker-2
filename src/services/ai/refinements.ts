import type { StyleTag } from '@/types/domain'

export interface RefinementAction {
  userRequestAppend?: string
  addStyle?: StyleTag
  selectRankIndex?: number
}

const CHIP_MAP: Record<string, RefinementAction> = {
  'make it drier': { addStyle: 'dry', userRequestAppend: 'Prefer something drier.' },
  'something more bitter': { addStyle: 'bitter', userRequestAppend: 'Prefer something more bitter.' },
  'show another option': { selectRankIndex: 1, userRequestAppend: 'Consider the second-ranked option.' },
  'suggest a substitute': { userRequestAppend: 'What substitutions are tolerable?' },
}

export function resolveRefinementChip(chip: string): RefinementAction {
  const key = chip.trim().toLowerCase()
  return (
    CHIP_MAP[key] ?? {
      userRequestAppend: chip.trim(),
    }
  )
}
