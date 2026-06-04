<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import type { HostessStatus } from '@/stores/sessionStore'

defineProps<{
  status: HostessStatus
  degraded: boolean
  errorMessage: string | null
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div v-if="status === 'loading'" class="hostess-states">
    <p class="hostess-states__loading">The hostess is forming an opinion…</p>
  </div>
  <div v-else-if="degraded || errorMessage" class="hostess-states">
    <p v-if="degraded" class="hostess-states__degraded">
      The hostess is briefly indisposed — a sensible recommendation follows.
    </p>
    <p v-if="errorMessage" class="hostess-states__error">{{ errorMessage }}</p>
    <AppButton variant="ghost" @click="emit('retry')">Ask again</AppButton>
  </div>
</template>

<style scoped>
.hostess-states {
  margin: var(--space-md) 0;
}

.hostess-states__loading {
  font-family: var(--font-display);
  color: var(--color-accent);
  font-size: 1.1rem;
}

.hostess-states__degraded {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
}

.hostess-states__error {
  font-size: 0.85rem;
  color: var(--color-danger);
  margin-bottom: var(--space-sm);
}
</style>
