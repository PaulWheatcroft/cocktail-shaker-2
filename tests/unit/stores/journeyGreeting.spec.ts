import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useJourneyStore } from '@/stores/journeyStore'
import { useAuthStore } from '@/stores/authStore'
import { useFavouritesStore } from '@/stores/favouritesStore'
import { fetchGreeting } from '@/services/ai/greet'

vi.mock('@/services/ai/greet', () => ({
  fetchGreeting: vi.fn(),
}))

const mockFetchGreeting = vi.mocked(fetchGreeting)

async function flush(): Promise<void> {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

describe('journeyStore greeting timing', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    mockFetchGreeting.mockReset()
    mockFetchGreeting.mockResolvedValue({
      greeting: 'The bar remembers you.',
      favouritesCommentary: 'Still favouring Negroni, I see.',
    })
  })

  it('does not lock greetingLoaded while auth.initialized is false', async () => {
    useAuthStore()
    const journey = useJourneyStore()

    await flush()

    expect(journey.greetingLoaded).toBe(false)
    expect(journey.greetingLoading).toBe(true)
    expect(mockFetchGreeting).not.toHaveBeenCalled()
  })

  it('refetches when favourites.count transitions 0 to N after sync completes', async () => {
    const auth = useAuthStore()
    auth.initialized = true
    auth.user = { id: 'user-1' } as never

    mockFetchGreeting.mockResolvedValueOnce({
      greeting: 'Welcome back. The shelf is bare.',
      favouritesCommentary: "Let's see if we can't find you a new favourite.",
    })

    const favourites = useFavouritesStore()
    const journey = useJourneyStore()

    await flush()
    await flush()

    expect(mockFetchGreeting).toHaveBeenCalledWith([], { returningWithNoFavourites: true })
    expect(journey.greeting?.greeting).toBe('Welcome back. The shelf is bare.')

    favourites.replaceFromRemote([{ cocktailId: '1', cocktailName: 'Negroni' }])
    await flush()
    await flush()

    expect(mockFetchGreeting).toHaveBeenLastCalledWith(['Negroni'], { returningWithNoFavourites: false })
    expect(journey.greeting?.greeting).toBe('The bar remembers you.')
  })

  it('fetches greeting when auth is initialized with favourites present', async () => {
    const auth = useAuthStore()
    auth.initialized = true
    auth.user = { id: 'user-1' } as never

    useFavouritesStore().replaceFromRemote([{ cocktailId: '1', cocktailName: 'Negroni' }])
    const journey = useJourneyStore()

    await flush()
    await flush()

    expect(mockFetchGreeting).toHaveBeenCalledWith(['Negroni'], { returningWithNoFavourites: false })
    expect(journey.greeting?.greeting).toBe('The bar remembers you.')
    expect(journey.greetingLoading).toBe(false)
  })

  it('fetches returning-with-no-favourites greeting when signed in with empty shelf', async () => {
    const auth = useAuthStore()
    auth.initialized = true
    auth.user = { id: 'user-1' } as never

    mockFetchGreeting.mockResolvedValueOnce({
      greeting: 'Welcome back. Your ledger is empty.',
      favouritesCommentary: "Let's see if we can't find you a new favourite.",
    })

    const journey = useJourneyStore()
    await flush()
    await flush()

    expect(mockFetchGreeting).toHaveBeenCalledWith([], { returningWithNoFavourites: true })
    expect(journey.greeting?.favouritesCommentary).toContain('new favourite')
  })

  it('shows generic greeting when signed out after auth init', async () => {
    const auth = useAuthStore()
    auth.initialized = true
    auth.user = null

    const journey = useJourneyStore()
    await flush()

    expect(journey.greetingLoading).toBe(false)
    expect(journey.greetingLoaded).toBe(true)
    expect(journey.greeting?.greeting).toContain('Welcome to the bar')
    expect(mockFetchGreeting).not.toHaveBeenCalled()
  })
})
