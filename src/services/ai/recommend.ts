/// <reference types="vite/client" />

import { composeHostessRequest } from './composeHostessRequest'
import { buildFallbackResponse } from './buildFallbackResponse'
import type { HostessRequest, HostessResponse, RankedCandidate } from '@/types/domain'

const TIMEOUT_MS = 12_000

export interface RecommendResult {
  response: HostessResponse
  degraded: boolean
  error?: string
}

function supabaseFunctionsUrl(): string {
  const base = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/$/, '')
  if (!base) {
    throw new Error('VITE_SUPABASE_URL is not configured.')
  }
  return `${base}/functions/v1/recommend`
}

function anonKey(): string {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!key) {
    throw new Error('VITE_SUPABASE_ANON_KEY is not configured.')
  }
  return key
}

export async function fetchHostessRecommendation(
  userRequest: string,
  cabinet: string[],
  ranked: RankedCandidate[],
): Promise<RecommendResult> {
  const payload: HostessRequest = composeHostessRequest(userRequest, cabinet, ranked)
  const candidates = payload.topCandidates

  if (candidates.length === 0) {
    return {
      response: buildFallbackResponse([]),
      degraded: true,
      error: 'No candidates to recommend.',
    }
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
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    const data = (await res.json()) as {
      response?: HostessResponse
      degraded?: boolean
      error?: string
    }

    if (data.response?.primaryRecommendation) {
      return {
        response: data.response,
        degraded: Boolean(data.degraded),
        error: data.error,
      }
    }

    return {
      response: buildFallbackResponse(candidates),
      degraded: true,
      error: data.error ?? `Hostess request failed (${res.status})`,
    }
  } catch (e) {
    const message =
      e instanceof Error
        ? e.name === 'AbortError'
          ? 'The hostess took too long to respond.'
          : e.message
        : 'Hostess unavailable.'
    return {
      response: buildFallbackResponse(candidates),
      degraded: true,
      error: message,
    }
  } finally {
    clearTimeout(timeout)
  }
}
