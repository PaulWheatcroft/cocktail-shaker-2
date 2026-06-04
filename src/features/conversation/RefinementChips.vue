<script setup lang="ts">
import AppChip from '@/components/ui/AppChip.vue'

defineProps<{
  suggestions: string[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: [chip: string]
}>()
</script>

<template>
  <div v-if="suggestions.length" class="refine">
    <p class="refine__label">Refine</p>
    <div class="refine__chips">
      <AppChip
        v-for="chip in suggestions"
        :key="chip"
        :label="chip"
        :active="false"
        @click="!disabled && emit('select', chip)"
      />
    </div>
  </div>
</template>

<style scoped>
.refine__label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
}

.refine__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
</style>
