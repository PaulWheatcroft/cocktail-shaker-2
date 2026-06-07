import type { GreetResponseBody } from './types.ts'

export function buildFallback(favouriteNames: string[]): GreetResponseBody {
  const names = favouriteNames.slice(0, 3).join(', ')
  return {
    greeting: 'Welcome back to the bar. One hopes your taste has matured since last we met.',
    favouritesCommentary: names
      ? `Your affections lie with ${names} — a selection that shall be judged in due course.`
      : undefined,
  }
}

export function validateResponse(raw: unknown): GreetResponseBody | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>

  const greeting = typeof o.greeting === 'string' ? o.greeting.trim() : ''
  if (!greeting) return null

  const favouritesCommentary =
    typeof o.favouritesCommentary === 'string' ? o.favouritesCommentary.trim() : undefined

  return {
    greeting,
    favouritesCommentary: favouritesCommentary || undefined,
  }
}
