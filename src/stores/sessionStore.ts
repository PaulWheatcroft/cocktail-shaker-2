import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { discoverCocktails, type FallbackMode } from '@/services/cocktails/discover'
import { fetchCocktailById } from '@/services/cocktailApi/client'
import { toCocktail } from '@/services/normalization/toCocktail'
import { fetchHostessRecommendation } from '@/services/ai/recommend'
import { resolveRefinementChip } from '@/services/ai/refinements'
import { rankCandidates } from '@/services/ranking/rankCandidates'
import type { RankContext } from '@/services/ranking/score'
import type { DrinkPresentation, HostessResponse, RankedCandidate, StyleTag } from '@/types/domain'
import { saveConversationTurn } from '@/services/persistence/sync'
import { useAuthStore } from './authStore'
import { useCabinetStore } from './cabinetStore'
import { usePreferencesStore } from './preferencesStore'

export type SessionStatus = 'idle' | 'loading' | 'ready' | 'error'
export type HostessStatus = 'idle' | 'loading' | 'ready' | 'degraded' | 'error'

const DEFAULT_USER_REQUEST = 'What should I make from my cabinet?'

export const useSessionStore = defineStore('session', () => {
  const status = ref<SessionStatus>('idle')
  const ranked = ref<RankedCandidate[]>([])
  const selectedId = ref<string | null>(null)
  const styleFilters = ref<StyleTag[]>([])
  const fallbackMode = ref<FallbackMode>(null)
  const errorMessage = ref<string | null>(null)

  const userRequest = ref(DEFAULT_USER_REQUEST)
  const hostessStatus = ref<HostessStatus>('idle')
  const hostessResponse = ref<HostessResponse | null>(null)
  const hostessError = ref<string | null>(null)
  const hostessDegraded = ref(false)

  const selectedCandidate = computed(() =>
    ranked.value.find((r) => r.cocktail.id === selectedId.value) ?? null,
  )

  const topThree = computed(() => ranked.value.slice(0, 3))

  const hostessPrimaryName = computed(
    () => hostessResponse.value?.primaryRecommendation ?? null,
  )

  const selectedPresentation = computed((): DrinkPresentation | null => {
    const cocktail = selectedCandidate.value?.cocktail
    const presentations = hostessResponse.value?.drinkPresentations
    if (!cocktail || !presentations?.length) return null
    return (
      presentations.find(
        (p) => p.name.toLowerCase() === cocktail.name.toLowerCase(),
      ) ?? null
    )
  })

  function setStyleFilters(filters: StyleTag[]) {
    styleFilters.value = filters
  }

  function toggleStyleFilter(tag: StyleTag) {
    const idx = styleFilters.value.indexOf(tag)
    if (idx >= 0) styleFilters.value.splice(idx, 1)
    else styleFilters.value.push(tag)
  }

  function setUserRequest(text: string) {
    userRequest.value = text.trim() || DEFAULT_USER_REQUEST
  }

  function selectCocktail(id: string) {
    selectedId.value = id
  }

  async function loadCocktailById(id: string) {
    status.value = 'loading'
    errorMessage.value = null
    fallbackMode.value = null
    ranked.value = []
    selectedId.value = null
    hostessStatus.value = 'idle'
    hostessResponse.value = null
    hostessError.value = null
    hostessDegraded.value = false

    try {
      const drink = await fetchCocktailById(id)
      const cocktail = drink ? toCocktail(drink) : null
      if (!cocktail) {
        errorMessage.value = 'Could not load that cocktail.'
        status.value = 'error'
        return
      }

      ranked.value = rankCandidates([cocktail], buildContext())
      selectedId.value = id
      status.value = 'ready'
      await invokeHostess()
    } catch (e) {
      errorMessage.value = e instanceof Error ? e.message : 'Could not load that cocktail.'
      status.value = 'error'
    }
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

  function rerankInPlace() {
    if (ranked.value.length === 0) return
    const cocktails = ranked.value.map((r) => r.cocktail)
    ranked.value = rankCandidates(cocktails, buildContext())
    if (!ranked.value.some((r) => r.cocktail.id === selectedId.value)) {
      selectedId.value = ranked.value[0]?.cocktail.id ?? null
    }
  }

  async function invokeHostess() {
    if (ranked.value.length === 0) {
      hostessStatus.value = 'idle'
      hostessResponse.value = null
      return
    }

    const cabinet = useCabinetStore()
    hostessStatus.value = 'loading'
    hostessError.value = null

    const prefs = usePreferencesStore()
    const result = await fetchHostessRecommendation(
      userRequest.value,
      cabinet.ingredientsForShake(),
      ranked.value,
      prefs.houseStrictness,
    )

    hostessResponse.value = result.response
    hostessDegraded.value = result.degraded
    hostessError.value = result.error ?? null
    hostessStatus.value = result.degraded ? 'degraded' : 'ready'

    const primaryName = result.response?.primaryRecommendation
    if (primaryName) {
      const match = ranked.value.find(
        (r) => r.cocktail.name.toLowerCase() === primaryName.toLowerCase(),
      )
      if (match) selectedId.value = match.cocktail.id
    }

    const auth = useAuthStore()
    if (auth.isSignedIn && auth.user && result.response) {
      void saveConversationTurn(auth.user.id, userRequest.value, result.response).catch(() => {
        /* non-blocking; local UX already succeeded */
      })
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
    hostessStatus.value = 'idle'
    errorMessage.value = null
    fallbackMode.value = null
    ranked.value = []
    selectedId.value = null
    hostessResponse.value = null
    hostessError.value = null
    hostessDegraded.value = false

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
    await invokeHostess()
  }

  async function applyRefinement(chip: string) {
    const action = resolveRefinementChip(chip)

    if (action.addStyle && !styleFilters.value.includes(action.addStyle)) {
      styleFilters.value.push(action.addStyle)
    }

    if (action.userRequestAppend) {
      const base = userRequest.value === DEFAULT_USER_REQUEST ? '' : `${userRequest.value} `
      userRequest.value = `${base}${action.userRequestAppend}`.trim()
    }

    rerankInPlace()

    if (action.selectRankIndex !== undefined) {
      const target = ranked.value[action.selectRankIndex]
      if (target) selectedId.value = target.cocktail.id
    }

    await invokeHostess()
  }

  function reset() {
    status.value = 'idle'
    ranked.value = []
    selectedId.value = null
    fallbackMode.value = null
    errorMessage.value = null
    userRequest.value = DEFAULT_USER_REQUEST
    hostessStatus.value = 'idle'
    hostessResponse.value = null
    hostessError.value = null
    hostessDegraded.value = false
  }

  return {
    status,
    ranked,
    selectedId,
    styleFilters,
    fallbackMode,
    errorMessage,
    userRequest,
    hostessStatus,
    hostessResponse,
    hostessError,
    hostessDegraded,
    selectedCandidate,
    topThree,
    hostessPrimaryName,
    selectedPresentation,
    setStyleFilters,
    toggleStyleFilter,
    setUserRequest,
    selectCocktail,
    loadCocktailById,
    shake,
    invokeHostess,
    applyRefinement,
    reset,
  }
})
