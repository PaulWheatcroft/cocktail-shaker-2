<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import type { FallbackMode } from '@/services/cocktails/discover'
import type { SessionStatus } from '@/stores/sessionStore'

defineProps<{
  status: SessionStatus
  fallbackMode: FallbackMode
  errorMessage: string | null
  activeIngredients: string[]
}>()

const emit = defineEmits<{
  shakeFirst: []
  shakeSecond: []
  retry: []
}>()
</script>

<template>
  <div class="discovery-states">
    <p v-if="status === 'loading'" class="discovery-states__loading">We are shaking it…</p>

    <p v-else-if="errorMessage" class="discovery-states__error">{{ errorMessage }}</p>

    <p
      v-if="status === 'ready' && fallbackMode"
      class="discovery-states__fallback"
    >
      Nothing matched both ingredients. Showing results for
      <strong>{{ fallbackMode === 'first' ? activeIngredients[0] : activeIngredients[1] }}</strong>
      only.
    </p>

    <slot v-if="status === 'ready'" name="empty" />

    <AppButton v-if="errorMessage" variant="ghost" @click="emit('retry')">Try again</AppButton>
  </div>
</template>

<style scoped>
.discovery-states__loading {
  color: var(--color-accent);
  font-family: var(--font-display);
  font-size: 1.25rem;
}

.discovery-states__error {
  color: var(--color-danger);
}

.discovery-states__fallback,
.discovery-states__empty {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.discovery-states__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}
</style>
