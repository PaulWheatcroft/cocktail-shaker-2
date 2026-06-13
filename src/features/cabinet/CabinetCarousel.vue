<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import IngredientGraphic from './IngredientGraphic.vue'
import { categoryFor } from './ingredientGraphics'
import { useCabinetStore } from '@/stores/cabinetStore'

const MAX_ON_BAR = 2
const SHINE_MS = 900

const cabinet = useCabinetStore()

function activeKeys() {
  return new Set(cabinet.activeForShake.map((i) => i.toLowerCase()))
}

function buildShelf(): string[] {
  const active = activeKeys()
  return cabinet.items.filter((i) => !active.has(i.toLowerCase()))
}

const shelfItems = ref<string[]>(buildShelf())
const barItems = ref<string[]>([...cabinet.activeForShake])
const justLocked = ref<string | null>(null)
let shineTimer: ReturnType<typeof setTimeout> | null = null

let internalUpdate = false

watch(
  () => [cabinet.items.slice(), cabinet.activeForShake.slice()],
  () => {
    if (internalUpdate) return
    shelfItems.value = buildShelf()
    barItems.value = [...cabinet.activeForShake]
  },
  { deep: true },
)

const emptySlots = computed(() => Math.max(0, MAX_ON_BAR - barItems.value.length))

function iconFor(name: string) {
  return categoryFor(name)
}

function dedupe(list: string[]) {
  const seen = new Set<string>()
  const cleaned: string[] = []
  for (const item of list) {
    const key = item.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    cleaned.push(item)
  }
  return cleaned
}

function commit() {
  const bar = dedupe(barItems.value).slice(0, MAX_ON_BAR)
  const shelf = dedupe(shelfItems.value)
  barItems.value = bar
  shelfItems.value = shelf

  internalUpdate = true
  cabinet.setActiveForShake(bar)
  cabinet.setItems(dedupe([...shelf, ...bar]))
  void nextTick(() => {
    internalUpdate = false
  })
}

function canPutOnBar() {
  return barItems.value.length < MAX_ON_BAR
}

function onBarChange(event: { added?: { element: string } }) {
  if (event.added) {
    triggerShine(event.added.element)
  }
  commit()
}

function triggerShine(name: string) {
  justLocked.value = name
  if (shineTimer) clearTimeout(shineTimer)
  shineTimer = setTimeout(() => {
    justLocked.value = null
    shineTimer = null
  }, SHINE_MS)
}

function isShining(name: string) {
  return justLocked.value?.toLowerCase() === name.toLowerCase()
}
</script>

<template>
  <div class="cabinet-carousel">
    <p v-if="!cabinet.items.length" class="cabinet-carousel__empty">
      Nothing in your cabinet yet — add something above.
    </p>

    <draggable
      v-else
      v-model="shelfItems"
      class="cabinet-carousel__shelf"
      :group="{ name: 'cabinet', pull: true, put: true }"
      :sort="true"
      :animation="180"
      :force-fallback="true"
      :fallback-on-body="true"
      fallback-class="card-drag-ghost"
      :delay="120"
      :delay-on-touch-only="true"
      :touch-start-threshold="6"
      :item-key="(name: string) => name"
      role="list"
      aria-label="Your cabinet"
      @change="commit"
    >
      <template #item="{ element }">
        <div class="shelf-card-wrap" role="listitem">
          <div class="shelf-card">
            <span class="shelf-card__art">
              <IngredientGraphic :icon="iconFor(element)" />
            </span>
            <span class="shelf-card__label">{{ element }}</span>
          </div>
          <button
            type="button"
            class="shelf-card__remove"
            :aria-label="`Remove ${element} from cabinet`"
            @click="cabinet.removeItem(element)"
          >
            ×
          </button>
        </div>
      </template>
    </draggable>

    <section class="cabinet-bar" aria-label="The bar — items selected for this shake">
      <h2>The bar</h2>
      <div class="cabinet-bar__slots">
        <div class="cabinet-bar__underlay" aria-hidden="true">
          <div
            v-for="n in MAX_ON_BAR"
            :key="n"
            class="bar-slot"
            :class="{ 'bar-slot--empty': n > barItems.length }"
          >
            <span v-if="n > barItems.length" class="bar-slot__label">Empty</span>
          </div>
        </div>
        <draggable
          v-model="barItems"
          class="cabinet-bar__drop"
          :group="{ name: 'cabinet', pull: true, put: canPutOnBar }"
          :animation="180"
          :force-fallback="true"
          :fallback-on-body="true"
          fallback-class="card-drag-ghost"
          :item-key="(name: string) => name"
          role="list"
          @change="onBarChange"
        >
          <template #item="{ element }">
            <div class="shelf-card-wrap shelf-card-wrap--bar" role="listitem">
              <div class="shelf-card shelf-card--bar" :class="{ 'shelf-card--shiny': isShining(element) }">
                <span class="shelf-card__art">
                  <IngredientGraphic :icon="iconFor(element)" />
                </span>
                <span class="shelf-card__label">{{ element }}</span>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cabinet-carousel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.cabinet-carousel__empty {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.cabinet-carousel__shelf {
  display: flex;
  gap: var(--space-md);
  flex: 1;
  min-height: 7.5rem;
  align-items: center;
  overflow-x: auto;
  overflow-y: visible;
  padding: var(--space-sm) var(--space-md) var(--space-md);
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.shelf-card-wrap {
  position: relative;
  flex: 0 0 auto;
  scroll-snap-align: start;
}

.shelf-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  width: 6.25rem;
  height: 6.75rem;
  padding: var(--space-sm) var(--space-xs) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-text);
  cursor: grab;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease,
    color 0.15s ease;
}

.shelf-card:hover {
  transform: translateY(-2px);
}

.shelf-card:active {
  cursor: grabbing;
}

.shelf-card__art {
  display: block;
  width: 3.5rem;
  height: 3.5rem;
}

.shelf-card__label {
  font-size: 0.8rem;
  line-height: 1.15;
  text-align: center;
  word-break: break-word;
}

.shelf-card__remove {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  width: 1.35rem;
  height: 1.35rem;
  display: grid;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-bg-elevated);
  color: var(--color-text-muted);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.shelf-card-wrap:hover .shelf-card__remove,
.shelf-card__remove:focus-visible {
  opacity: 1;
}

.cabinet-bar {
  flex: 0 0 auto;
  padding: var(--space-md);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
}

.cabinet-bar__slots {
  position: relative;
  width: calc(2 * 6.25rem + var(--space-md));
  margin: 0 auto;
}

.cabinet-bar__underlay {
  position: absolute;
  inset: 0;
  display: flex;
  gap: var(--space-md);
  pointer-events: none;
}

.bar-slot {
  width: 6.25rem;
  min-height: 6.75rem;
  border-radius: var(--radius-lg);
}

.bar-slot--empty {
  display: grid;
  place-items: center;
  background: var(--color-bg);
}

.bar-slot__label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.cabinet-bar__drop {
  position: relative;
  display: flex;
  gap: var(--space-md);
  min-height: 6.75rem;
  align-items: center;
}

.shelf-card-wrap--bar {
  scroll-snap-align: none;
}

.shelf-card--bar {
  border-color: var(--color-accent);
}

.shelf-card-wrap.sortable-chosen .shelf-card {
  border-color: var(--color-accent);
  color: var(--color-text);
  box-shadow: 0 0 0 1px var(--color-accent);
}

/* Hide the live placeholder while dragging so the destination card only
   appears once the user drops it (the floating drag preview stays visible). */
.shelf-card-wrap.sortable-ghost {
  opacity: 0;
}

.shelf-card--shiny {
  position: relative;
  overflow: hidden;
  animation: bar-card-pop 0.45s ease;
}

.shelf-card--shiny::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    transparent 0%,
    transparent 35%,
    rgba(201, 169, 98, 0.35) 45%,
    rgba(230, 207, 150, 0.85) 50%,
    rgba(201, 169, 98, 0.35) 55%,
    transparent 65%,
    transparent 100%
  );
  transform: translateX(-120%);
  animation: bar-card-shine 0.9s ease forwards;
  pointer-events: none;
}

@keyframes bar-card-shine {
  to {
    transform: translateX(120%);
  }
}

@keyframes bar-card-pop {
  0% {
    transform: scale(0.92);
  }
  55% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .shelf-card--shiny,
  .shelf-card--shiny::after {
    animation: none;
  }
}
</style>
