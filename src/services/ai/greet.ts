/// <reference types="vite/client" />

import type { GreetingResponse } from '@/types/domain'

const TIMEOUT_MS = 10_000

const GENERIC_GREETING: GreetingResponse = {
  greeting:
    'Welcome to the bar. Standards are high, expectations are higher, and your cabinet shall be judged accordingly.',
}

function supabaseFunctionsUrl(): string {
  const base = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/$/, '')
  if (!base) {
    throw new Error('VITE_SUPABASE_URL is not configured.')
  }
  return `${base}/functions/v1/greet`
}

function anonKey(): string {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!key) {
    throw new Error('VITE_SUPABASE_ANON_KEY is not configured.')
  }
  return key
}

export async function fetchGreeting(favouriteNames: string[]): Promise<GreetingResponse> {
  if (favouriteNames.length === 0) {
    return { ...GENERIC_GREETING }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(supabaseFunctionsUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey()}`,
        apikey: anonKey(),
      },
      body: JSON.stringify({ favouriteNames }),
      signal: controller.signal,
    })

    const data = (await res.json()) as {
      response?: GreetingResponse
      degraded?: boolean
      error?: string
    }

    if (data.response?.greeting) {
      return data.response
    }

    return { ...GENERIC_GREETING }
  } catch {
    return { ...GENERIC_GREETING }
  } finally {
    clearTimeout(timeout)
  }
}
