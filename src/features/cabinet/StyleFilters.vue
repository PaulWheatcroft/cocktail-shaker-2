<script setup lang="ts">
import AppChip from '@/components/ui/AppChip.vue'
import type { StyleTag } from '@/types/domain'
import { useSessionStore } from '@/stores/sessionStore'

const FILTERS: { tag: StyleTag; label: string }[] = [
  { tag: 'dry', label: 'Dry' },
  { tag: 'bitter', label: 'Bitter' },
  { tag: 'citrusy', label: 'Citrusy' },
  { tag: 'spirit-forward', label: 'Classic' },
]

const session = useSessionStore()
</script>

<template>
  <div class="style-filters">
    <p class="style-filters__label">Style (optional)</p>
    <div class="style-filters__chips">
      <AppChip
        v-for="f in FILTERS"
        :key="f.tag"
        :label="f.label"
        :active="session.styleFilters.includes(f.tag)"
        @click="session.toggleStyleFilter(f.tag)"
      />
    </div>
  </div>
</template>

<style scoped>
.style-filters__label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
}

.style-filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
</style>
