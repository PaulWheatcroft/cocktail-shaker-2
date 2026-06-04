<script setup lang="ts">
defineProps<{
  label: string
  active?: boolean
  removable?: boolean
}>()

const emit = defineEmits<{
  click: []
  remove: []
}>()
</script>

<template>
  <button
    type="button"
    class="chip"
    :class="{ 'chip--active': active }"
    @click="emit('click')"
  >
    <span>{{ label }}</span>
    <span
      v-if="removable"
      class="chip__remove"
      aria-label="Remove"
      @click.stop="emit('remove')"
    >×</span>
  </button>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.9rem;
  cursor: pointer;
}

.chip--active {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.chip__remove {
  font-size: 1.1rem;
  line-height: 1;
  opacity: 0.8;
}
</style>
