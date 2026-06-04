<script setup lang="ts">
import type { HostessResponse } from '@/types/domain'

defineProps<{
  response: HostessResponse | null
}>()
</script>

<template>
  <section v-if="response" class="hostess">
    <p class="hostess__verdict">{{ response.verdict }}</p>
    <p class="hostess__primary">
      <span class="hostess__label">Her choice</span>
      {{ response.primaryRecommendation }}
    </p>
    <p class="hostess__rationale">{{ response.rationale }}</p>
    <ul v-if="response.alternatives.length" class="hostess__alts">
      <li v-for="alt in response.alternatives" :key="alt">Also tolerable: {{ alt }}</li>
    </ul>
  </section>
</template>

<style scoped>
.hostess {
  padding: var(--space-lg);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-lg);
}

.hostess__verdict {
  font-family: var(--font-display);
  font-size: 1.35rem;
  line-height: 1.3;
  color: var(--color-text);
  margin: 0 0 var(--space-md);
}

.hostess__primary {
  font-weight: 600;
  color: var(--color-accent);
  margin: 0 0 var(--space-sm);
}

.hostess__label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.hostess__rationale {
  color: var(--color-text-muted);
  margin: 0 0 var(--space-sm);
}

.hostess__alts {
  margin: 0;
  padding-left: var(--space-lg);
  font-size: 0.9rem;
  color: var(--color-text-muted);
}
</style>
