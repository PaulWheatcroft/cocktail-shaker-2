<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import IngredientGraphic from './IngredientGraphic.vue'
import { categoryFor } from './ingredientGraphics'
import { useCabinetStore } from '@/stores/cabinetStore'

const MAX_ON_BAR = 2

const cabinet = useCabinetStore()

const barItems = ref<string[]>([...cabinet.activeForShake])
let internalUpdate = false

watch(
  () => cabinet.activeForShake.slice(),
  (next) => {
    if (internalUpdate) return
    barItems.value = [...next]
  },
  { deep: true },
)

function iconFor(name: string) {
  return categoryFor(name)
}

function commitBar() {
  const seen = new Set<string>()
  const cleaned: string[] = []
  for (const item of barItems.value) {
    const key = item.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    cleaned.push(item)
    if (cleaned.length >= MAX_ON_BAR) break
  }
  barItems.value = cleaned
  internalUpdate = true
  cabinet.setActiveForShake(cleaned)
  void nextTick(() => {
    internalUpdate = false
  })
}

function canPutOnBar() {
  return barItems.value.length < MAX_ON_BAR
}

function onShelfCardClick(name: string) {
  cabinet.toggleActive(name)
}
</script>

<template>
  <div class="cabinet-carousel">
    <p v-if="!cabinet.items.length" class="cabinet-carousel__empty">
      Nothing in your cabinet yet — add something above.
    </p>

    <draggable
      v-else
      class="cabinet-carousel__shelf"
      :list="cabinet.items"
      :group="{ name: 'cabinet', pull: 'clone', put: false }"
      :sort="false"
      :delay="120"
      :delay-on-touch-only="true"
      :touch-start-threshold="6"
      :item-key="(name: string) => name"
      role="list"
      aria-label="Your cabinet"
    >
      <template #item="{ element }">
        <div class="shelf-card-wrap" role="listitem">
          <button
            type="button"
            class="shelf-card"
            :class="{ 'shelf-card--active': cabinet.isActive(element) }"
            :aria-pressed="cabinet.isActive(element)"
            @click="onShelfCardClick(element)"
          >
            <span v-if="cabinet.isActive(element)" class="shelf-card__tick" aria-hidden="true">
              ✓
            </span>
            <span class="shelf-card__art">
              <IngredientGraphic :icon="iconFor(element)" />
            </span>
            <span class="shelf-card__label">{{ element }}</span>
          </button>
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
      <h3 class="cabinet-bar__title">The bar</h3>
      <draggable
        v-model="barItems"
        class="cabinet-bar__drop"
        :class="{ 'cabinet-bar__drop--empty': !barItems.length }"
        :group="{ name: 'cabinet', pull: true, put: canPutOnBar }"
        :item-key="(name: string) => name"
        role="list"
        @change="commitBar"
      >
        <template #item="{ element }">
          <button
            type="button"
            class="bar-item"
            role="listitem"
            :aria-label="`Remove ${element} from the bar`"
            @click="cabinet.toggleActive(element)"
          >
            <span class="bar-item__art">
              <IngredientGraphic :icon="iconFor(element)" />
            </span>
            <span class="bar-item__label">{{ element }}</span>
            <span class="bar-item__remove" aria-hidden="true">×</span>
          </button>
        </template>
      </draggable>
      <p v-if="!barItems.length" class="cabinet-bar__placeholder">
        Drag a bottle here to use it for this shake.
      </p>
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
  align-items: stretch;
  overflow-x: auto;
  overflow-y: hidden;
  padding: var(--space-sm) var(--space-xs) var(--space-md);
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
  height: 100%;
  min-height: 6.75rem;
  padding: var(--space-sm) var(--space-xs) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: grab;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease,
    background 0.15s ease;
}

.shelf-card:hover {
  transform: translateY(-2px);
}

.shelf-card:active {
  cursor: grabbing;
}

.shelf-card--active {
  border-color: var(--color-success);
  background: var(--color-success-soft);
  color: var(--color-text);
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

.shelf-card__tick {
  position: absolute;
  top: -0.4rem;
  left: -0.4rem;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 999px;
  background: var(--color-success);
  color: #0f1214;
  font-size: 0.8rem;
  font-weight: 700;
}

.shelf-card__remove {
  position: absolute;
  top: -0.4rem;
  right: -0.4rem;
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
  background: linear-gradient(180deg, transparent, var(--color-bg-elevated));
}

.cabinet-bar__title {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display);
  font-size: 0.9rem;
  color: var(--color-text);
}

.cabinet-bar__drop {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  min-height: 3.75rem;
  align-items: center;
}

.cabinet-bar__placeholder {
  margin: var(--space-xs) 0 0;
  font-size: 0.75rem;
  font-style: italic;
  color: var(--color-text-muted);
}

.bar-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-success);
  border-radius: 999px;
  background: var(--color-success-soft);
  color: var(--color-text);
  cursor: pointer;
}

.bar-item__art {
  display: block;
  width: 1.75rem;
  height: 1.75rem;
}

.bar-item__label {
  font-size: 0.85rem;
}

.bar-item__remove {
  font-size: 1.05rem;
  line-height: 1;
  color: var(--color-text-muted);
}
</style>
