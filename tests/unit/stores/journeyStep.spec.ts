import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useJourneyStore } from '@/stores/journeyStore'
import { useSessionStore } from '@/stores/sessionStore'

describe('journeyStore step transitions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts on welcome', () => {
    const journey = useJourneyStore()
    expect(journey.step).toBe('welcome')
  })

  it('moves to reveal when discovery and hostess complete', () => {
    const journey = useJourneyStore()
    const session = useSessionStore()

    journey.step = 'shaking'
    session.status = 'ready'
    session.hostessStatus = 'ready'
    session.ranked = [
      {
        score: 1,
        reasons: [],
        cocktail: {
          id: '1',
          name: 'Negroni',
          ingredients: [],
          tags: [],
        },
      },
    ]

    journey.syncStepFromSession()
    expect(journey.step).toBe('reveal')
  })

  it('returns to cabinet when no cocktails found', () => {
    const journey = useJourneyStore()
    const session = useSessionStore()

    journey.step = 'shaking'
    session.status = 'ready'
    session.hostessStatus = 'idle'
    session.ranked = []

    journey.syncStepFromSession()
    expect(journey.step).toBe('cabinet')
  })
})
