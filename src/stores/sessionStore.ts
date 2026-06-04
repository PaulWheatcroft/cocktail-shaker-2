import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { discoverCocktails, type FallbackMode } from '@/services/cocktails/discover'
import type { RankContext } from '@/services/ranking/score'
import type { RankedCandidate, StyleTag } from '@/types/domain'
import { useCabinetStore } from './cabinetStore'
import { usePreferencesStore } from './preferencesStore'

export type SessionStatus = 'idle' | 'loading' | 'ready' | 'error'

export const useSessionStore = defineStore('session', () => {
  const status = ref<SessionStatus>('idle')
  const ranked = ref<RankedCandidate[]>([])
  const selectedId = ref<string | null>(null)
  const styleFilters = ref<StyleTag[]>([])
  const fallbackMode = ref<FallbackMode>(null)
  const errorMessage = ref<string | null>(null)

  const selectedCandidate = computed(() =>
    ranked.value.find((r) => r.cocktail.id === selectedId.value) ?? null,
  )

  const topThree = computed(() => ranked.value.slice(0, 3))

  function setStyleFilters(filters: StyleTag[]) {
    styleFilters.value = filters
  }

  function toggleStyleFilter(tag: StyleTag) {
    const idx = styleFilters.value.indexOf(tag)
    if (idx >= 0) styleFilters.value.splice(idx, 1)
    else styleFilters.value.push(tag)
  }

  function selectCocktail(id: string) {
    selectedId.value = id
  }

  function buildContext(): RankContext {
    const cabinet = useCabinetStore()
    const prefs = usePreferencesStore()
    return {
      cabinet: cabinet.ingredientsForShake(),
      styleFilters: [...styleFilters.value],
      houseStrictness: prefs.houseStrictness,
    }
  }

  async function shake() {
    const cabinet = useCabinetStore()
    const ingredients = cabinet.ingredientsForShake()
    if (ingredients.length === 0) {
      errorMessage.value = 'Select at least one ingredient to shake.'
      status.value = 'error'
      return
    }

    status.value = 'loading'
    errorMessage.value = null
    fallbackMode.value = null
    ranked.value = []
    selectedId.value = null

    const result = await discoverCocktails(ingredients, buildContext())

    if (result.error) {
      errorMessage.value = result.error
      status.value = 'error'
      return
    }

    fallbackMode.value = result.fallbackMode
    ranked.value = result.ranked

    if (result.ranked.length === 0) {
      status.value = 'ready'
      return
    }

    selectedId.value = result.ranked[0]!.cocktail.id
    status.value = 'ready'
  }

  function reset() {
    status.value = 'idle'
    ranked.value = []
    selectedId.value = null
    fallbackMode.value = null
    errorMessage.value = null
  }

  return {
    status,
    ranked,
    selectedId,
    styleFilters,
    fallbackMode,
    errorMessage,
    selectedCandidate,
    topThree,
    setStyleFilters,
    toggleStyleFilter,
    selectCocktail,
    shake,
    reset,
  }
})
