import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const ROOT = resolve(import.meta.dirname, '..')
const OUTPUT_DIR = resolve(ROOT, 'public/images/ingredients')
const CONFIG_PATH = resolve(OUTPUT_DIR, 'categories.json')

const CATEGORY_PROMPTS: Record<string, string> = {
  coffee:
    'Premium cocktail bar ingredient icon of a ceramic coffee mug with dark espresso, warm gold rim-light (#c9a962), semi-realistic illustration, centered, no text.',
  fortified:
    'Premium cocktail bar ingredient icon of a fortified wine bottle (port or shmouth style) with deep ruby liquid, glassy bottle, warm gold rim-light, centered, no text.',
  juice:
    'Premium cocktail bar ingredient icon of a short glass of fresh orange juice, glassy cup, warm gold rim-light, centered, no text.',
  milk:
    'Premium cocktail bar ingredient icon of a small glass of cream or milk, glassy cup, warm gold rim-light, centered, no text.',
  'soda-cola':
    'Premium cocktail bar ingredient icon of a classic red Coca-Cola style soda can, bright red aluminium can with condensation, same style as a premium mixer can, warm gold rim-light, centered, no text.',
  'soda-water':
    'Premium cocktail bar ingredient icon of a light blue club soda can, pale sky-blue aluminium can with condensation, same style as a premium mixer can, warm gold rim-light, centered, no text.',
  'liqueur-blue':
    'Premium cocktail bar ingredient icon of a liqueur bottle with vivid electric blue liquid, tall glass bottle, glassy, warm gold rim-light, centered, no text.',
  'clear-spirit-lemon':
    'Premium cocktail bar ingredient icon of a clear spirit bottle with pale yellow lemon-tinted liquid, tall glass bottle like white rum or citrus vodka, glassy, warm gold rim-light, centered, no text.',
  'soda-orange':
    'Premium cocktail bar ingredient icon of an orange soda can, bright orange colour, metallic can with condensation, warm gold rim-light, centered, no text.',
  sparkling:
    'Premium cocktail bar ingredient icon of a champagne bottle with gold foil top and green glass, glassy, warm gold rim-light, centered, no text.',
  syrup:
    'Premium cocktail bar ingredient icon of a small syrup bottle with thick amber liquid, glassy bottle, warm gold rim-light, centered, no text.',
  tea:
    'Premium cocktail bar ingredient icon of a tea cup with amber tea, warm gold rim-light, centered, no text.',
  vermouth:
    'Premium cocktail bar ingredient icon of a squat vermouth bottle with pale red liquid, glassy bottle, warm gold rim-light, centered, no text.',
  wine:
    'Premium cocktail bar ingredient icon of a classic red wine bottle with dark red liquid, glassy bottle, warm gold rim-light, centered, no text.',
}

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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function generatePng(prompt: string): Promise<Buffer> {
  const apiKey = requireEnv('OPENAI_API_KEY')
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: `${prompt} Fully transparent background, no backdrop, no floor shadow, isolated subject only.`,
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

async function saveWebp(categoryId: string, png: Buffer) {
  const filename = `${categoryId}.webp`
  await sharp(png).webp({ quality: 90, alphaQuality: 100 }).toFile(resolve(OUTPUT_DIR, filename))
  return filename
}

function updateConfig(categoryId: string, filename: string) {
  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) as {
    images: Record<string, string>
  }
  config.images[categoryId] = filename
  writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, 'utf8')
}

function parseArgs() {
  const args = process.argv.slice(2)
  const only: string[] = []
  let force = false
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--only') only.push(args[++i]!)
    if (args[i] === '--force') force = true
  }
  return { only, force }
}

const { only, force } = parseArgs()
const queue = (only.length ? only : Object.keys(CATEGORY_PROMPTS)).filter((id) =>
  CATEGORY_PROMPTS[id],
)

for (const categoryId of queue) {
  const outPath = resolve(OUTPUT_DIR, `${categoryId}.webp`)
  if (!force && existsSync(outPath)) {
    console.log(`Skip ${categoryId} (exists)`)
    continue
  }

  console.log(`Generating ${categoryId}…`)
  const png = await generatePng(CATEGORY_PROMPTS[categoryId]!)
  const filename = await saveWebp(categoryId, png)
  updateConfig(categoryId, filename)
  console.log(`Saved ${filename}`)
  await sleep(1200)
}

console.log('Done.')
