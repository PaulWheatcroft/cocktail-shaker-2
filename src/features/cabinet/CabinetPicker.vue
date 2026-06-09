<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import CabinetCarousel from '@/features/cabinet/CabinetCarousel.vue'
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
    <section class="cabinet-picker__add" aria-label="Add to cabinet">
      <div class="cabinet-picker__add-row">
        <div class="cabinet-picker__search">
          <input
            v-model="draft"
            type="text"
            placeholder="Search ingredients…"
            autocomplete="off"
            spellcheck="false"
            @input="onDraftInput"
            @keydown.enter.prevent="addDraft"
          />
          <ul v-if="suggestions.length && draft" class="cabinet-picker__suggestions">
            <li v-for="s in suggestions.slice(0, 6)" :key="s">
              <button type="button" @click="pickSuggestion(s)">{{ s }}</button>
            </li>
          </ul>
        </div>
        <AppButton variant="ghost" @click="addDraft">Add</AppButton>
      </div>

      <p v-if="inputError" class="cabinet-picker__error">{{ inputError }}</p>
    </section>

    <section
      class="cabinet-picker__stock"
      aria-label="Your cabinet"
      :aria-labelledby="hideSectionHeadings ? undefined : 'cabinet-stock-heading'"
    >
      <h2
        v-if="!hideSectionHeadings"
        id="cabinet-stock-heading"
        class="cabinet-picker__heading cabinet-picker__heading--center"
      >
        Your cabinet
      </h2>
      <p class="cabinet-picker__stock-hint">
        Drag up to two onto the bar (or tap) to use them for this shake.
      </p>

      <CabinetCarousel />
    </section>
  </div>
</template>

<style scoped>
.cabinet-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  min-height: 0;
}

.cabinet-picker__heading {
  margin: 0 0 var(--space-xs);
  font-weight: 600;
  color: var(--color-text);
}

.cabinet-picker__heading--center {
  text-align: center;
}

.cabinet-picker__add {
  flex: 0 0 auto;
}

.cabinet-picker__stock {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: var(--space-lg) var(--space-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: visible;
}

.cabinet-picker__stock-hint {
  margin: 0 0 var(--space-sm);
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.cabinet-picker__add-row {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-start;
}

.cabinet-picker__search {
  position: relative;
  flex: 1;
  min-width: 0;
}

.cabinet-picker__search input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
}

.cabinet-picker__search input:focus-visible {
  outline-offset: 0;
}

.cabinet-picker__error {
  color: var(--color-danger);
  font-size: 0.8rem;
  margin: var(--space-xs) 0 0;
}

.cabinet-picker__suggestions {
  position: absolute;
  top: calc(100% + var(--space-xs));
  left: 0;
  right: 0;
  z-index: 5;
  list-style: none;
  padding: var(--space-xs);
  margin: 0;
  max-height: 9rem;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
}

.cabinet-picker__suggestions button {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: var(--color-accent);
  cursor: pointer;
  padding: var(--space-xs) var(--space-sm);
  font-size: 0.85rem;
  border-radius: var(--radius-sm);
}

.cabinet-picker__suggestions button:hover {
  background: var(--color-accent-soft);
}
</style>
