<script setup lang="ts">
import { computed, useId } from 'vue'
import type { IconId } from './ingredientGraphics'

const props = defineProps<{
  icon: IconId
}>()

type ShapeId =
  | 'tallBottle'
  | 'squatBottle'
  | 'wineBottle'
  | 'sparklingBottle'
  | 'can'
  | 'glass'
  | 'mug'
  | 'citrus'
  | 'berries'
  | 'cherry'
  | 'cucumber'
  | 'olive'
  | 'leaf'
  | 'egg'
  | 'spice'
  | 'sugar'
  | 'salt'
  | 'ice'
  | 'plate'

interface ShapeConfig {
  shape: ShapeId
  fill: string
}

const CONFIG: Record<IconId, ShapeConfig> = {
  gin: { shape: 'tallBottle', fill: '#cfd8dc' },
  vodka: { shape: 'tallBottle', fill: '#e8eef2' },
  whisky: { shape: 'tallBottle', fill: '#b5651d' },
  rum: { shape: 'tallBottle', fill: '#8d5524' },
  tequila: { shape: 'tallBottle', fill: '#d9c26a' },
  brandy: { shape: 'tallBottle', fill: '#7a3b1f' },
  absinthe: { shape: 'tallBottle', fill: '#7cb342' },
  vermouth: { shape: 'squatBottle', fill: '#8a2f2f' },
  bitters: { shape: 'squatBottle', fill: '#c0392b' },
  liqueur: { shape: 'squatBottle', fill: '#b9770e' },
  syrup: { shape: 'squatBottle', fill: '#c2410c' },
  wine: { shape: 'wineBottle', fill: '#5b2333' },
  fortified: { shape: 'wineBottle', fill: '#7b1e2b' },
  sparkling: { shape: 'sparklingBottle', fill: '#3f5d4f' },
  soda: { shape: 'can', fill: '#c9a962' },
  juice: { shape: 'glass', fill: '#e8923a' },
  milk: { shape: 'glass', fill: '#f2efe6' },
  coffee: { shape: 'mug', fill: '#4a2c2a' },
  tea: { shape: 'mug', fill: '#a9744f' },
  citrus: { shape: 'citrus', fill: '#e8b33a' },
  berries: { shape: 'berries', fill: '#7b3f6e' },
  cherry: { shape: 'cherry', fill: '#b3243a' },
  cucumber: { shape: 'cucumber', fill: '#6fae5a' },
  olive: { shape: 'olive', fill: '#6b8e23' },
  herb: { shape: 'leaf', fill: '#5a9e4f' },
  egg: { shape: 'egg', fill: '#f3e9d2' },
  spice: { shape: 'spice', fill: '#8a5a2b' },
  sugar: { shape: 'sugar', fill: '#e8e4dc' },
  salt: { shape: 'salt', fill: '#d7d2c8' },
  ice: { shape: 'ice', fill: '#bcd6e8' },
  bottle: { shape: 'tallBottle', fill: '#6b7b85' },
  food: { shape: 'plate', fill: '#c9a962' },
}

function parseHex(hex: string) {
  const normalized = hex.replace('#', '')
  const value = Number.parseInt(normalized, 16)
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function toHex(r: number, g: number, b: number) {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')}`
}

function adjustHex(hex: string, amount: number) {
  const { r, g, b } = parseHex(hex)
  const factor = amount / 100
  return toHex(r + (255 - r) * factor, g + (255 - g) * factor, b + (255 - b) * factor)
}

function darkenHex(hex: string, amount: number) {
  const { r, g, b } = parseHex(hex)
  const factor = 1 - amount / 100
  return toHex(r * factor, g * factor, b * factor)
}

const uid = useId()
const config = computed(() => CONFIG[props.icon] ?? CONFIG.bottle)
const shape = computed(() => config.value.shape)
const fill = computed(() => config.value.fill)

const isGlassShape = computed(() =>
  ['tallBottle', 'squatBottle', 'wineBottle', 'sparklingBottle', 'glass'].includes(shape.value),
)

const glassBodyId = computed(() => `glass-body-${uid}`)
const liquidFillId = computed(() => `liquid-fill-${uid}`)
const glassShineId = computed(() => `glass-shine-${uid}`)

const glassHighlight = computed(() => adjustHex(fill.value, 55))
const glassMid = computed(() => adjustHex(fill.value, 15))
const glassShadow = computed(() => darkenHex(fill.value, 35))
const liquidColor = computed(() => darkenHex(fill.value, 10))
</script>

<template>
  <svg
    class="ingredient-graphic"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <defs v-if="isGlassShape">
      <linearGradient :id="glassBodyId" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="glassHighlight" stop-opacity="0.85" />
        <stop offset="45%" :stop-color="glassMid" stop-opacity="0.65" />
        <stop offset="100%" :stop-color="glassShadow" stop-opacity="0.75" />
      </linearGradient>
      <linearGradient :id="liquidFillId" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" :stop-color="adjustHex(fill, 10)" stop-opacity="0.95" />
        <stop offset="100%" :stop-color="liquidColor" stop-opacity="0.98" />
      </linearGradient>
      <linearGradient :id="glassShineId" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="35%" stop-color="#ffffff" stop-opacity="0.55" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
    </defs>

    <g
      stroke="rgba(0, 0, 0, 0.28)"
      stroke-width="1.6"
      stroke-linejoin="round"
      stroke-linecap="round"
    >
      <!-- Tall spirit bottle -->
      <g v-if="shape === 'tallBottle'">
        <rect x="28" y="4" width="8" height="5" rx="1.2" fill="#2c2c2c" />
        <rect x="29" y="8" width="6" height="9" fill="#444" stroke="none" />
        <rect x="22" y="15" width="20" height="45" rx="7" :fill="`url(#${glassBodyId})`" />
        <rect x="23.5" y="22" width="17" height="36" rx="6" :fill="`url(#${liquidFillId})`" stroke="none" />
        <rect x="24.5" y="35" width="15" height="14" rx="2" fill="rgba(255,255,255,0.7)" stroke="none" />
        <ellipse cx="27" cy="28" rx="2.5" ry="14" :fill="`url(#${glassShineId})`" stroke="none" />
        <rect x="22" y="15" width="20" height="45" rx="7" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.8" />
      </g>

      <!-- Squat liqueur / vermouth bottle -->
      <g v-else-if="shape === 'squatBottle'">
        <rect x="27" y="7" width="10" height="5" rx="1.2" fill="#2c2c2c" />
        <rect x="29" y="11" width="6" height="7" fill="#444" stroke="none" />
        <rect x="18" y="17" width="28" height="42" rx="8" :fill="`url(#${glassBodyId})`" />
        <rect x="19.5" y="24" width="25" height="32" rx="7" :fill="`url(#${liquidFillId})`" stroke="none" />
        <rect x="21" y="33" width="22" height="15" rx="2" fill="rgba(255,255,255,0.7)" stroke="none" />
        <ellipse cx="23" cy="32" rx="2.8" ry="12" :fill="`url(#${glassShineId})`" stroke="none" />
        <rect x="18" y="17" width="28" height="42" rx="8" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.8" />
      </g>

      <!-- Wine / fortified bottle -->
      <g v-else-if="shape === 'wineBottle'">
        <rect x="29" y="4" width="6" height="7" rx="1" fill="#2c2c2c" />
        <rect x="29" y="10" width="6" height="14" fill="#444" stroke="none" />
        <path
          d="M24 60 L24 36 C24 29 27 26 29 24 L35 24 C37 26 40 29 40 36 L40 60 Z"
          :fill="`url(#${glassBodyId})`"
        />
        <path
          d="M25 58 L25 37 C25 31 27.5 28 29 26.5 L35 26.5 C36.5 28 39 31 39 37 L39 58 Z"
          :fill="`url(#${liquidFillId})`"
          stroke="none"
        />
        <rect x="26" y="40" width="12" height="13" rx="1.5" fill="rgba(255,255,255,0.7)" stroke="none" />
        <ellipse cx="26.5" cy="38" rx="2" ry="12" :fill="`url(#${glassShineId})`" stroke="none" />
        <path
          d="M24 60 L24 36 C24 29 27 26 29 24 L35 24 C37 26 40 29 40 36 L40 60 Z"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          stroke-width="0.8"
        />
      </g>

      <!-- Sparkling bottle -->
      <g v-else-if="shape === 'sparklingBottle'">
        <rect x="29" y="2" width="6" height="5" rx="2" fill="#b08d57" />
        <path d="M27 7 L37 7 L35 14 L29 14 Z" fill="#d4af37" />
        <rect x="29.5" y="13" width="5" height="11" fill="#444" stroke="none" />
        <path
          d="M24 60 L24 36 C24 29 27 26 29 24 L35 24 C37 26 40 29 40 36 L40 60 Z"
          :fill="`url(#${glassBodyId})`"
        />
        <path
          d="M25 58 L25 37 C25 31 27.5 28 29 26.5 L35 26.5 C36.5 28 39 31 39 37 L39 58 Z"
          :fill="`url(#${liquidFillId})`"
          stroke="none"
        />
        <ellipse cx="26.5" cy="38" rx="2" ry="12" :fill="`url(#${glassShineId})`" stroke="none" />
        <path
          d="M24 60 L24 36 C24 29 27 26 29 24 L35 24 C37 26 40 29 40 36 L40 60 Z"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          stroke-width="0.8"
        />
      </g>

      <!-- Soda can -->
      <g v-else-if="shape === 'can'">
        <rect x="22" y="9" width="20" height="47" rx="5" :fill="fill" />
        <ellipse cx="32" cy="11" rx="10" ry="3" fill="#9aa3ad" />
        <rect x="27" y="26" width="10" height="14" rx="1.5" fill="rgba(255,255,255,0.8)" />
      </g>

      <!-- Glass of juice / milk -->
      <g v-else-if="shape === 'glass'">
        <path d="M23 14 L41 14 L38 58 L26 58 Z" fill="rgba(255,255,255,0.12)" />
        <path d="M25 30 L39 30 L37.2 55 L26.8 55 Z" :fill="`url(#${liquidFillId})`" stroke="none" />
        <path d="M23 14 L41 14 L38 58 L26 58 Z" fill="none" />
        <path
          d="M24 16 L26 56"
          stroke="rgba(255,255,255,0.45)"
          stroke-width="1.4"
          stroke-linecap="round"
        />
        <path
          d="M23 14 L41 14 L38 58 L26 58 Z"
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          stroke-width="0.8"
        />
      </g>

      <!-- Mug of coffee / tea -->
      <g v-else-if="shape === 'mug'">
        <rect x="18" y="20" width="24" height="32" rx="4" :fill="fill" />
        <path d="M42 26 C50 26 50 40 42 40" fill="none" stroke-width="3" />
        <ellipse cx="30" cy="22" rx="12" ry="3.2" fill="rgba(255,255,255,0.35)" />
      </g>

      <!-- Citrus -->
      <g v-else-if="shape === 'citrus'">
        <circle cx="32" cy="34" r="19" :fill="fill" />
        <circle cx="32" cy="34" r="12" fill="rgba(255,255,255,0.5)" stroke="none" />
        <g stroke="rgba(0,0,0,0.2)" stroke-width="1.2">
          <line x1="32" y1="22" x2="32" y2="46" />
          <line x1="20" y1="34" x2="44" y2="34" />
          <line x1="23.5" y1="25.5" x2="40.5" y2="42.5" />
          <line x1="40.5" y1="25.5" x2="23.5" y2="42.5" />
        </g>
      </g>

      <!-- Berries -->
      <g v-else-if="shape === 'berries'">
        <circle cx="25" cy="38" r="10" :fill="fill" />
        <circle cx="39" cy="38" r="10" :fill="fill" />
        <circle cx="32" cy="26" r="10" :fill="fill" />
        <path d="M32 17 L34 11 L29 13" fill="#5a9e4f" />
      </g>

      <!-- Cherry -->
      <g v-else-if="shape === 'cherry'">
        <path d="M30 18 C30 30 22 32 22 32" fill="none" stroke-width="2" />
        <path d="M30 18 C30 30 42 32 42 32" fill="none" stroke-width="2" />
        <circle cx="22" cy="44" r="10" :fill="fill" />
        <circle cx="42" cy="44" r="10" :fill="fill" />
        <path d="M26 16 L34 13 L31 20" fill="#5a9e4f" />
      </g>

      <!-- Cucumber slice -->
      <g v-else-if="shape === 'cucumber'">
        <circle cx="32" cy="34" r="19" fill="#3f7a33" />
        <circle cx="32" cy="34" r="14" :fill="fill" stroke="none" />
        <g fill="#eef6e6" stroke="none">
          <ellipse cx="32" cy="27" rx="1.6" ry="2.4" />
          <ellipse cx="26" cy="33" rx="1.6" ry="2.4" />
          <ellipse cx="38" cy="33" rx="1.6" ry="2.4" />
          <ellipse cx="29" cy="40" rx="1.6" ry="2.4" />
          <ellipse cx="35" cy="40" rx="1.6" ry="2.4" />
        </g>
      </g>

      <!-- Olive on a pick -->
      <g v-else-if="shape === 'olive'">
        <line x1="44" y1="12" x2="24" y2="44" stroke="#b08d57" stroke-width="2.2" />
        <ellipse cx="28" cy="42" rx="12" ry="14" :fill="fill" />
        <circle cx="28" cy="42" r="4" fill="#c0392b" stroke="none" />
      </g>

      <!-- Herb leaf -->
      <g v-else-if="shape === 'leaf'">
        <path d="M32 8 C46 18 46 42 32 56 C18 42 18 18 32 8 Z" :fill="fill" />
        <line x1="32" y1="12" x2="32" y2="52" stroke="rgba(0,0,0,0.22)" stroke-width="1.4" />
        <g stroke="rgba(0,0,0,0.18)" stroke-width="1.1">
          <line x1="32" y1="22" x2="40" y2="20" />
          <line x1="32" y1="22" x2="24" y2="20" />
          <line x1="32" y1="34" x2="42" y2="33" />
          <line x1="32" y1="34" x2="22" y2="33" />
        </g>
      </g>

      <!-- Egg -->
      <g v-else-if="shape === 'egg'">
        <path d="M32 8 C44 8 46 36 46 42 C46 52 40 58 32 58 C24 58 18 52 18 42 C18 36 20 8 32 8 Z" :fill="fill" />
        <ellipse cx="27" cy="26" rx="4" ry="6" fill="rgba(255,255,255,0.5)" stroke="none" />
      </g>

      <!-- Spice (star anise) -->
      <g v-else-if="shape === 'spice'">
        <g :fill="fill">
          <ellipse cx="32" cy="16" rx="5" ry="11" />
          <ellipse cx="32" cy="48" rx="5" ry="11" />
          <ellipse cx="16" cy="32" rx="11" ry="5" />
          <ellipse cx="48" cy="32" rx="11" ry="5" />
          <ellipse cx="21" cy="21" rx="9" ry="4" transform="rotate(45 21 21)" />
          <ellipse cx="43" cy="43" rx="9" ry="4" transform="rotate(45 43 43)" />
          <ellipse cx="43" cy="21" rx="9" ry="4" transform="rotate(-45 43 21)" />
          <ellipse cx="21" cy="43" rx="9" ry="4" transform="rotate(-45 21 43)" />
        </g>
        <circle cx="32" cy="32" r="6" fill="#5a3a1c" stroke="none" />
      </g>

      <!-- Sugar cubes -->
      <g v-else-if="shape === 'sugar'">
        <rect x="14" y="30" width="22" height="22" rx="2" :fill="fill" />
        <rect x="30" y="16" width="22" height="22" rx="2" :fill="fill" />
      </g>

      <!-- Salt shaker -->
      <g v-else-if="shape === 'salt'">
        <path d="M22 24 L42 24 L44 58 L20 58 Z" :fill="fill" />
        <rect x="24" y="16" width="16" height="9" rx="3" fill="#9aa3ad" />
        <g fill="rgba(0,0,0,0.45)" stroke="none">
          <circle cx="29" cy="20" r="1.2" />
          <circle cx="35" cy="20" r="1.2" />
          <circle cx="32" cy="22.5" r="1.2" />
        </g>
      </g>

      <!-- Ice cube -->
      <g v-else-if="shape === 'ice'">
        <path d="M16 24 L32 16 L48 24 L48 44 L32 52 L16 44 Z" :fill="fill" />
        <path d="M16 24 L32 32 L48 24" fill="none" />
        <line x1="32" y1="32" x2="32" y2="52" />
        <path d="M22 28 L26 26" stroke="rgba(255,255,255,0.7)" stroke-width="1.4" />
      </g>

      <!-- Plate (generic food) -->
      <g v-else-if="shape === 'plate'">
        <ellipse cx="32" cy="44" rx="24" ry="8" fill="#d8d2c4" />
        <ellipse cx="32" cy="42" rx="16" ry="5" fill="rgba(255,255,255,0.5)" stroke="none" />
        <path d="M20 38 C24 24 40 24 44 38 Z" :fill="fill" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.ingredient-graphic {
  display: block;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
}
</style>
