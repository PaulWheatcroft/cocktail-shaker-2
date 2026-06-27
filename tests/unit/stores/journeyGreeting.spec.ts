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

    const favourites = useFavouritesStore()
    const journey = useJourneyStore()

    await flush()

    expect(journey.greetingLoaded).toBe(true)
    expect(journey.greeting?.greeting).toContain('Welcome to the bar')
    expect(mockFetchGreeting).not.toHaveBeenCalled()

    favourites.replaceFromRemote([{ cocktailId: '1', cocktailName: 'Negroni' }])
    await flush()
    await flush()

    expect(mockFetchGreeting).toHaveBeenCalledWith(['Negroni'])
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

    expect(mockFetchGreeting).toHaveBeenCalledWith(['Negroni'])
    expect(journey.greeting?.greeting).toBe('The bar remembers you.')
    expect(journey.greetingLoading).toBe(false)
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
