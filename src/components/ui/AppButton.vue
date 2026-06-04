<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'ghost'
  disabled?: boolean
}>()
</script>

<template>
  <button
    type="button"
    class="btn"
    :class="`btn--${variant ?? 'primary'}`"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--primary {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.btn--ghost {
  border-color: var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
}
</style>
