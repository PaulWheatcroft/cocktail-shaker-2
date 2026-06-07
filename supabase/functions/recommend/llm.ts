import { SYSTEM_PROMPT, buildUserMessage } from './prompt.ts'
import type { HostessRequestBody } from './types.ts'

async function callOpenAi(
  apiKey: string,
  model: string,
  userContent: string,
  strictRetry: boolean,
): Promise<string> {
  const extra = strictRetry
    ? '\n\nYour previous reply was invalid. primaryRecommendation must exactly match a topCandidates name.'
    : ''

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 1400,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent + extra },
      ],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`OpenAI error ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    throw new Error('OpenAI returned no message content')
  }
  return content
}

async function callAnthropic(
  apiKey: string,
  model: string,
  userContent: string,
  strictRetry: boolean,
): Promise<string> {
  const extra = strictRetry
    ? '\n\nYour previous reply was invalid. primaryRecommendation must exactly match a topCandidates name.'
    : ''

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1400,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent + extra }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Anthropic error ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json()
  const block = data?.content?.find((b: { type: string }) => b.type === 'text')
  if (!block?.text || typeof block.text !== 'string') {
    throw new Error('Anthropic returned no text content')
  }

  return block.text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '')
}

export async function completeHostessJson(
  body: HostessRequestBody,
  strictRetry: boolean,
): Promise<string> {
  const provider = (Deno.env.get('LLM_PROVIDER') ?? 'openai').toLowerCase()
  const userContent = buildUserMessage(body)

  if (provider === 'anthropic') {
    const key = Deno.env.get('ANTHROPIC_API_KEY')
    if (!key) throw new Error('ANTHROPIC_API_KEY is not set')
    const model = Deno.env.get('LLM_MODEL') ?? 'claude-sonnet-4-20250514'
    return callAnthropic(key, model, userContent, strictRetry)
  }

  const key = Deno.env.get('OPENAI_API_KEY')
  if (!key) throw new Error('OPENAI_API_KEY is not set')
  const model = Deno.env.get('LLM_MODEL') ?? 'gpt-4o-mini'
  return callOpenAi(key, model, userContent, strictRetry)
}
