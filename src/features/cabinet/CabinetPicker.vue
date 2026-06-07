<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppChip from '@/components/ui/AppChip.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { suggestIngredients } from '@/services/cocktailApi/catalog'
import { useCabinetStore } from '@/stores/cabinetStore'

defineProps<{
  compact?: boolean
  hideSectionHeadings?: boolean
}>()

const cabinet = useCabinetStore()
const draft = ref('')
const suggestions = ref<string[]>([])
const inputError = ref<string | null>(null)

onMounted(async () => {
  suggestions.value = await suggestIngredients('')
})

async function onDraftInput() {
  inputError.value = null
  suggestions.value = await suggestIngredients(draft.value)
}

function addDraft() {
  const trimmed = draft.value.trim()
  if (!trimmed) return
  if (cabinet.activeCount >= 2 && !cabinet.isActive(trimmed)) {
    inputError.value = 'Select at most 2 ingredients to shake.'
    return
  }
  cabinet.addItem(trimmed)
  draft.value = ''
  inputError.value = null
  onDraftInput()
}

function pickSuggestion(name: string) {
  draft.value = name
  addDraft()
}
</script>

<template>
  <div class="cabinet-picker" :class="{ 'cabinet-picker--compact': compact }">
    <section
      class="cabinet-picker__stock"
      aria-label="Your cabinet"
      :aria-labelledby="hideSectionHeadings ? undefined : 'cabinet-stock-heading'"
    >
      <h2 v-if="!hideSectionHeadings" id="cabinet-stock-heading" class="cabinet-picker__heading">
        Your cabinet
      </h2>
      <p class="cabinet-picker__stock-hint">
        Select up to two for this shake. Highlighted items will be used.
      </p>

      <div v-if="cabinet.items.length" class="cabinet-picker__chips">
        <AppChip
          v-for="item in cabinet.items"
          :key="item"
          :label="item"
          :active="cabinet.isActive(item)"
          removable
          @click="cabinet.toggleActive(item)"
          @remove="cabinet.removeItem(item)"
        />
      </div>
      <p v-else class="cabinet-picker__empty">Nothing in your cabinet yet — add something below.</p>
    </section>

    <section
      class="cabinet-picker__add"
      aria-label="Add to cabinet"
      :aria-labelledby="hideSectionHeadings ? undefined : 'cabinet-add-heading'"
    >
      <h2 v-if="!hideSectionHeadings" id="cabinet-add-heading" class="cabinet-picker__heading">
        Add to cabinet
      </h2>

      <div class="cabinet-picker__add-row">
        <input
          v-model="draft"
          type="text"
          placeholder="Search ingredients…"
          autocomplete="off"
          spellcheck="false"
          @input="onDraftInput"
          @keydown.enter.prevent="addDraft"
        />
        <AppButton variant="ghost" @click="addDraft">Add</AppButton>
      </div>

      <p v-if="inputError" class="cabinet-picker__error">{{ inputError }}</p>

      <ul v-if="suggestions.length && draft" class="cabinet-picker__suggestions">
        <li v-for="s in suggestions.slice(0, 8)" :key="s">
          <button type="button" @click="pickSuggestion(s)">{{ s }}</button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.cabinet-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.cabinet-picker__heading {
  margin: 0 0 var(--space-xs);
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text);
}

.cabinet-picker__stock {
  padding: var(--space-lg);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.cabinet-picker__stock-hint {
  margin: 0 0 var(--space-md);
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.cabinet-picker__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.cabinet-picker__empty {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.cabinet-picker__add {
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.cabinet-picker--compact .cabinet-picker__add {
  padding-top: 0;
  border-top: none;
}

.cabinet-picker__add-row {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.cabinet-picker__add-row input {
  flex: 1;
  min-width: 10rem;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
}

.cabinet-picker__error {
  color: var(--color-danger);
  font-size: 0.9rem;
  margin-top: var(--space-sm);
}

.cabinet-picker__suggestions {
  list-style: none;
  padding: 0;
  margin: var(--space-sm) 0 0;
}

.cabinet-picker__suggestions button {
  background: none;
  border: none;
  color: var(--color-accent);
  cursor: pointer;
  padding: var(--space-xs) 0;
  font-size: 0.9rem;
}
</style>
