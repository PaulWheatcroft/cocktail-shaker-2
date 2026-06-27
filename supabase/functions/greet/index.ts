import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { completeGreetJson } from './llm.ts'
import { buildFallback, buildFallbackNoFavourites, validateResponse } from './validate.ts'
import type { GreetRequestBody, GreetResponse } from './types.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  let body: GreetRequestBody
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const favouriteNames = (body.favouriteNames ?? [])
    .filter((n): n is string => typeof n === 'string' && n.trim().length > 0)
    .map((n) => n.trim())
    .slice(0, 12)

  const returningWithNoFavourites = body.returningWithNoFavourites === true

  if (favouriteNames.length === 0 && !returningWithNoFavourites) {
    return jsonResponse({ error: 'favouriteNames required' }, 400)
  }

  const fallback = returningWithNoFavourites
    ? buildFallbackNoFavourites()
    : buildFallback(favouriteNames)

  try {
    const rawText = await completeGreetJson({ ...body, favouriteNames, returningWithNoFavourites })
    let parsed: unknown
    try {
      parsed = JSON.parse(rawText)
    } catch {
      parsed = null
    }

    const validated = validateResponse(parsed)
    if (validated) {
      const result: GreetResponse = { response: validated, degraded: false }
      return jsonResponse(result)
    }

    return jsonResponse({
      response: fallback,
      degraded: true,
    } satisfies GreetResponse)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Greet unavailable'
    return jsonResponse(
      {
        response: fallback,
        degraded: true,
        error: message,
      },
      200,
    )
  }
})
