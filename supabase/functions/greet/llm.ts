import { SYSTEM_PROMPT, buildUserMessage } from './prompt.ts'
import type { GreetRequestBody } from './types.ts'

async function callOpenAi(apiKey: string, model: string, userContent: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.75,
      max_tokens: 400,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
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

export async function completeGreetJson(body: GreetRequestBody): Promise<string> {
  const provider = (Deno.env.get('LLM_PROVIDER') ?? 'openai').toLowerCase()
  const userContent = buildUserMessage(body)

  if (provider === 'anthropic') {
    throw new Error('Anthropic greet not implemented; set LLM_PROVIDER=openai')
  }

  const key = Deno.env.get('OPENAI_API_KEY')
  if (!key) throw new Error('OPENAI_API_KEY is not set')
  const model = Deno.env.get('LLM_MODEL') ?? 'gpt-4o-mini'
  return callOpenAi(key, model, userContent)
}
