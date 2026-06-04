import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { completeHostessJson } from './llm.ts'
import { buildFallback, validateResponse } from './validate.ts'
import type { HostessRequestBody, RecommendResponse } from './types.ts'

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

  let body: HostessRequestBody
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  if (!body?.topCandidates?.length) {
    return jsonResponse({ error: 'topCandidates required' }, 400)
  }

  const candidates = body.topCandidates.slice(0, 5)

  try {
    let rawText = await completeHostessJson({ ...body, topCandidates: candidates }, false)
    let parsed: unknown
    try {
      parsed = JSON.parse(rawText)
    } catch {
      parsed = null
    }

    let validated = validateResponse(parsed, candidates)
    if (!validated) {
      rawText = await completeHostessJson({ ...body, topCandidates: candidates }, true)
      try {
        parsed = JSON.parse(rawText)
      } catch {
        parsed = null
      }
      validated = validateResponse(parsed, candidates)
    }

    if (validated) {
      const result: RecommendResponse = { response: validated, degraded: false }
      return jsonResponse(result)
    }

    const result: RecommendResponse = {
      response: buildFallback(candidates),
      degraded: true,
    }
    return jsonResponse(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Hostess unavailable'
    const result: RecommendResponse = {
      response: buildFallback(candidates),
      degraded: true,
    }
    return jsonResponse({ ...result, error: message }, 200)
  }
})
