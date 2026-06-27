import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const ROOT = resolve(import.meta.dirname, '..')
const OUTPUT_PATH = resolve(ROOT, 'public/images/shaker.webp')

const PROMPT =
  'Premium cocktail bar ingredient icon of a classic three-piece cobbler cocktail shaker in brushed stainless steel, glassy metallic finish with subtle highlights, warm gold rim-light (#c9a962), semi-realistic illustration, centered upright, no text.'

function parseEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {}
  const out: Record<string, string> = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return out
}

function requireEnv(name: string): string {
  const env = {
    ...parseEnvFile(resolve(ROOT, 'supabase/functions/.env.local')),
    ...parseEnvFile(resolve(ROOT, '.env')),
    ...process.env,
  }
  const value = env[name]?.trim()
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

async function generatePng(): Promise<Buffer> {
  const apiKey = requireEnv('OPENAI_API_KEY')
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: `${PROMPT} Fully transparent background, no backdrop, no floor shadow, isolated subject only.`,
      size: '1024x1024',
      quality: 'medium',
      background: 'transparent',
      output_format: 'png',
      n: 1,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI ${response.status}: ${await response.text()}`)
  }

  const data = (await response.json()) as { data?: Array<{ b64_json?: string }> }
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new Error('No image returned')
  return Buffer.from(b64, 'base64')
}

const force = process.argv.includes('--force')

if (!force && existsSync(OUTPUT_PATH)) {
  console.log('Skip shaker.webp (exists — pass --force to regenerate)')
  process.exit(0)
}

console.log('Generating shaker.webp…')
const png = await generatePng()
await sharp(png).webp({ quality: 90, alphaQuality: 100 }).toFile(OUTPUT_PATH)
console.log('Saved public/images/shaker.webp')
