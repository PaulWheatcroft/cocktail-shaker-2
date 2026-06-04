<script setup lang="ts">
import type { RankedCandidate } from '@/types/domain'

defineProps<{
  results: RankedCandidate[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <ol v-if="results.length" class="ranked">
    <li
      v-for="(row, index) in results"
      :key="row.cocktail.id"
      class="ranked__item"
      :class="{
        'ranked__item--primary': index === 0,
        'ranked__item--selected': row.cocktail.id === selectedId,
      }"
    >
      <button type="button" class="ranked__button" @click="emit('select', row.cocktail.id)">
        <span class="ranked__rank">{{ index + 1 }}</span>
        <span class="ranked__name">{{ row.cocktail.name }}</span>
        <span class="ranked__score">{{ Math.round(row.score * 100) }}%</span>
        <span v-if="row.reasons.length" class="ranked__reasons">{{ row.reasons.join(' · ') }}</span>
      </button>
    </li>
  </ol>
</template>

<style scoped>
.ranked {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.ranked__button {
  width: 100%;
  text-align: left;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
}

.ranked__item--primary .ranked__button {
  border-color: var(--color-accent);
}

.ranked__item--selected .ranked__button {
  background: var(--color-accent-soft);
}

.ranked__rank {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--color-accent);
  margin-right: var(--space-sm);
}

.ranked__name {
  font-weight: 600;
}

.ranked__score {
  float: right;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.ranked__reasons {
  display: block;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
}
</style>
