import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { fetchGreeting } from '@/services/ai/greet'
import type { GreetingResponse } from '@/types/domain'
import { useAuthStore } from './authStore'
import { useFavouritesStore } from './favouritesStore'
import { useSessionStore } from './sessionStore'

export type JourneyStep = 'welcome' | 'cabinet' | 'shaking' | 'reveal'

const GENERIC_GREETING: GreetingResponse = {
  greeting:
    'Welcome to the bar. Standards are high, expectations are higher, and your cabinet shall be judged accordingly.',
}

export const useJourneyStore = defineStore('journey', () => {
  const step = ref<JourneyStep>('welcome')
  const greeting = ref<GreetingResponse | null>(null)
  const greetingLoading = ref(false)
  const greetingLoaded = ref(false)

  async function loadGreeting() {
    if (greetingLoaded.value) return

    const auth = useAuthStore()
    const favourites = useFavouritesStore()

    if (!auth.isSignedIn || favourites.count === 0) {
      greeting.value = { ...GENERIC_GREETING }
      greetingLoaded.value = true
      return
    }

    greetingLoading.value = true
    try {
      const result = await fetchGreeting(favourites.all().map((f) => f.cocktailName))
      greeting.value = result
    } catch {
      greeting.value = { ...GENERIC_GREETING }
    } finally {
      greetingLoading.value = false
      greetingLoaded.value = true
    }
  }

  function beginJourney() {
    void loadGreeting()
  }

  function advanceToCabinet() {
    step.value = 'cabinet'
  }

  async function startShake() {
    const session = useSessionStore()
    step.value = 'shaking'
    await session.shake()
    syncStepFromSession()
  }

  function syncStepFromSession() {
    const session = useSessionStore()

    if (step.value !== 'shaking') return

    if (session.status === 'error') {
      return
    }

    const discoveryDone = session.status === 'ready'
    const hostessDone =
      session.hostessStatus === 'ready' ||
      session.hostessStatus === 'degraded' ||
      session.hostessStatus === 'error' ||
      session.hostessStatus === 'idle'

    if (discoveryDone && session.ranked.length === 0) {
      step.value = 'cabinet'
      return
    }

    if (discoveryDone && hostessDone) {
      step.value = 'reveal'
    }
  }

  function newRound() {
    const session = useSessionStore()
    session.reset()
    step.value = 'cabinet'
  }

  function resetToWelcome() {
    step.value = 'welcome'
  }

  watch(
    () => {
      const session = useSessionStore()
      return [session.status, session.hostessStatus, session.ranked.length] as const
    },
    () => syncStepFromSession(),
  )

  watch(
    () => useAuthStore().isSignedIn,
    () => {
      greetingLoaded.value = false
      if (step.value === 'welcome') {
        void loadGreeting()
      }
    },
  )

  return {
    step,
    greeting,
    greetingLoading,
    greetingLoaded,
    beginJourney,
    loadGreeting,
    advanceToCabinet,
    startShake,
    syncStepFromSession,
    newRound,
    resetToWelcome,
  }
})
