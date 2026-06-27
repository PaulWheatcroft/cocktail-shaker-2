<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import IngredientArt from '@/features/cabinet/IngredientArt.vue'
import { resolveCategoryImage, listCategoryImageAssets } from '@/features/cabinet/categoryImages'
import {
  buildIssueExport,
  defaultReviewEntry,
  loadReviewState,
  saveReviewState,
  type IngredientReviewState,
  type ReviewStatus,
} from '@/features/dev/ingredientImageReview'
import { getIngredientCatalog } from '@/services/cocktailApi/catalog'

const ingredients = ref<string[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')
const filter = ref<'all' | 'unset' | 'wrong'>('all')
const reviews = ref<IngredientReviewState>(loadReviewState())
const exportJson = ref('')
const copyMessage = ref<string | null>(null)
const categoryImages = listCategoryImageAssets()

onMounted(async () => {
  try {
    ingredients.value = await getIngredientCatalog()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not load ingredient catalogue.'
  } finally {
    loading.value = false
  }
})

watch(reviews, (state) => saveReviewState(state), { deep: true })

const filteredIngredients = computed(() => {
  const query = search.value.trim().toLowerCase()
  return ingredients.value.filter((name) => {
    const review = reviews.value[name] ?? defaultReviewEntry()
    if (filter.value === 'unset' && review.status !== 'unset') return false
    if (filter.value === 'wrong' && review.status !== 'wrong') return false
    if (query && !name.toLowerCase().includes(query)) return false
    return true
  })
})

const stats = computed(() => {
  let reviewed = 0
  let wrong = 0
  for (const name of ingredients.value) {
    const status = (reviews.value[name] ?? defaultReviewEntry()).status
    if (status !== 'unset') reviewed++
    if (status === 'wrong') wrong++
  }
  return { total: ingredients.value.length, reviewed, wrong }
})

function reviewFor(name: string) {
  return reviews.value[name] ?? defaultReviewEntry()
}

function setStatus(name: string, status: ReviewStatus) {
  const current = reviewFor(name)
  reviews.value = {
    ...reviews.value,
    [name]: { ...current, status },
  }
}

function setNote(name: string, note: string) {
  const current = reviewFor(name)
  reviews.value = {
    ...reviews.value,
    [name]: { ...current, note },
  }
}

function markAllVisibleCorrect() {
  const next = { ...reviews.value }
  for (const name of filteredIngredients.value) {
    next[name] = { ...reviewFor(name), status: 'correct' }
  }
  reviews.value = next
}

function generateExport() {
  const payload = buildIssueExport(ingredients.value, reviews.value, resolveCategoryImage)
  exportJson.value = JSON.stringify(payload, null, 2)
}

async function copyExport() {
  generateExport()
  await navigator.clipboard.writeText(exportJson.value)
  copyMessage.value = 'Copied to clipboard.'
  window.setTimeout(() => {
    copyMessage.value = null
  }, 2000)
}

function resolutionFor(name: string) {
  return resolveCategoryImage(name)
}

function downloadExport() {
  generateExport()
  const blob = new Blob([exportJson.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ingredient-image-issues-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="ingredient-review">
    <div class="ingredient-review__main">
      <section class="ingredient-review__content">
        <header class="ingredient-review__header">
      <div>
        <p class="ingredient-review__eyebrow">Dev only</p>
        <h1>Ingredient image review</h1>
        <p class="ingredient-review__intro">
          Review catalogue ingredients against their assigned generic image. Mark anything wrong and
          add a note, then export the JSON for fixes.
        </p>
      </div>

      <dl class="ingredient-review__stats">
        <div>
          <dt>Total</dt>
          <dd>{{ stats.total }}</dd>
        </div>
        <div>
          <dt>Reviewed</dt>
          <dd>{{ stats.reviewed }}</dd>
        </div>
        <div>
          <dt>Wrong</dt>
          <dd>{{ stats.wrong }}</dd>
        </div>
      </dl>
    </header>

    <div class="ingredient-review__toolbar">
      <input
        v-model="search"
        type="search"
        placeholder="Search ingredients…"
        class="ingredient-review__search"
      />

      <label class="ingredient-review__filter">
        Show
        <select v-model="filter">
          <option value="all">All</option>
          <option value="unset">Unreviewed</option>
          <option value="wrong">Wrong only</option>
        </select>
      </label>

      <button type="button" class="ingredient-review__action" @click="markAllVisibleCorrect">
        Mark visible correct
      </button>
      <button type="button" class="ingredient-review__action" @click="generateExport">
        Generate JSON
      </button>
      <button type="button" class="ingredient-review__action" @click="copyExport">
        Copy JSON
      </button>
      <button type="button" class="ingredient-review__action" @click="downloadExport">
        Download JSON
      </button>
      <p v-if="copyMessage" class="ingredient-review__copy-msg">{{ copyMessage }}</p>
    </div>

    <p v-if="loading" class="ingredient-review__status">Loading catalogue…</p>
    <p v-else-if="error" class="ingredient-review__error">{{ error }}</p>

    <ul v-else class="ingredient-review__list">
      <li
        v-for="name in filteredIngredients"
        :key="name"
        class="ingredient-review__item"
        :class="{ 'ingredient-review__item--wrong': reviewFor(name).status === 'wrong' }"
      >
        <div class="ingredient-review__art">
          <IngredientArt :name="name" />
        </div>

        <div class="ingredient-review__details">
          <h2>{{ name }}</h2>
          <p class="ingredient-review__meta">
            Icon: {{ resolutionFor(name).icon }} · Category:
            {{ resolutionFor(name).categoryId ?? 'none' }} · Source:
            {{ resolutionFor(name).source }}
          </p>
          <p v-if="resolutionFor(name).imageSrc" class="ingredient-review__meta">
            Image: {{ resolutionFor(name).imageSrc }}
          </p>
          <p v-else class="ingredient-review__meta ingredient-review__meta--fallback">SVG fallback</p>

          <fieldset class="ingredient-review__verdict">
            <legend class="ingredient-review__legend">Looks correct?</legend>
            <label>
              <input
                type="radio"
                :name="`verdict-${name}`"
                value="correct"
                :checked="reviewFor(name).status === 'correct'"
                @change="setStatus(name, 'correct')"
              />
              Correct
            </label>
            <label>
              <input
                type="radio"
                :name="`verdict-${name}`"
                value="wrong"
                :checked="reviewFor(name).status === 'wrong'"
                @change="setStatus(name, 'wrong')"
              />
              Wrong
            </label>
          </fieldset>

          <label class="ingredient-review__note">
            Note
            <textarea
              :value="reviewFor(name).note"
              rows="2"
              placeholder="What should change?"
              @input="setNote(name, ($event.target as HTMLTextAreaElement).value)"
            />
          </label>
        </div>
      </li>
    </ul>

    <textarea
      v-if="exportJson"
      class="ingredient-review__export"
      readonly
      rows="12"
      :value="exportJson"
    />
      </section>
    </div>

    <aside class="ingredient-review__catalog" aria-label="Available category images">
      <div class="ingredient-review__catalog-inner">
        <h2 class="ingredient-review__catalog-title">Category images</h2>
        <p class="ingredient-review__catalog-count">{{ categoryImages.length }} available</p>
        <ul class="ingredient-review__catalog-list">
          <li v-for="asset in categoryImages" :key="asset.id" class="ingredient-review__catalog-item">
            <div class="ingredient-review__catalog-art">
              <img :src="asset.src" :alt="asset.id" loading="lazy" decoding="async" />
            </div>
            <p class="ingredient-review__catalog-label">{{ asset.id }}</p>
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.ingredient-review {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 13.5rem;
  gap: var(--space-xl);
  max-width: 90rem;
  margin: 0 auto;
  align-items: start;
}

.ingredient-review__main {
  min-width: 0;
}

.ingredient-review__content {
  padding: 0;
}

.ingredient-review__header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.ingredient-review__eyebrow {
  margin: 0 0 var(--space-xs);
  color: var(--color-accent);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.ingredient-review__intro {
  margin: 0;
  color: var(--color-text-muted);
}

.ingredient-review__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(4rem, 1fr));
  gap: var(--space-sm);
  margin: 0;
}

.ingredient-review__stats div {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-align: center;
}

.ingredient-review__stats dt {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.ingredient-review__stats dd {
  margin: var(--space-xs) 0 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.ingredient-review__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: center;
  margin-bottom: var(--space-lg);
}

.ingredient-review__search {
  flex: 1 1 12rem;
  min-width: 0;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
}

.ingredient-review__filter {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.9rem;
}

.ingredient-review__filter select {
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
}

.ingredient-review__action {
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  color: var(--color-text);
  cursor: pointer;
}

.ingredient-review__action:hover {
  border-color: var(--color-accent);
}

.ingredient-review__copy-msg {
  margin: 0;
  color: var(--color-success);
  font-size: 0.85rem;
}

.ingredient-review__status,
.ingredient-review__error {
  margin: 0;
}

.ingredient-review__error {
  color: var(--color-danger);
}

.ingredient-review__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: var(--space-md);
}

.ingredient-review__item {
  display: grid;
  grid-template-columns: 6rem 1fr;
  gap: var(--space-md);
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
}

.ingredient-review__item--wrong {
  border-color: var(--color-danger);
}

.ingredient-review__art {
  width: 6rem;
  height: 6rem;
  display: grid;
  place-items: center;
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.2);
}

.ingredient-review__details h2 {
  margin: 0 0 var(--space-xs);
  text-align: left;
  font-size: 1.1rem;
}

.ingredient-review__meta {
  margin: 0 0 var(--space-xs);
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.ingredient-review__meta--fallback {
  color: var(--color-accent);
}

.ingredient-review__verdict {
  display: flex;
  gap: var(--space-md);
  margin: var(--space-sm) 0;
  padding: 0;
  border: none;
}

.ingredient-review__legend {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.ingredient-review__verdict label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.9rem;
}

.ingredient-review__note {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  font-size: 0.85rem;
}

.ingredient-review__note textarea {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  resize: vertical;
}

.ingredient-review__export {
  width: 100%;
  margin-top: var(--space-lg);
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text);
  font-family: ui-monospace, monospace;
  font-size: 0.8rem;
}

.ingredient-review__catalog {
  position: sticky;
  top: calc(var(--header-height) + var(--space-md));
  align-self: start;
}

.ingredient-review__catalog-inner {
  max-height: calc(100dvh - var(--header-height) - var(--space-lg) * 2);
  overflow-y: auto;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
  scrollbar-width: thin;
}

.ingredient-review__catalog-title {
  margin: 0 0 var(--space-xs);
  font-size: 1rem;
  text-align: left;
}

.ingredient-review__catalog-count {
  margin: 0 0 var(--space-md);
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.ingredient-review__catalog-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: var(--space-sm);
}

.ingredient-review__catalog-item {
  padding: var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.15);
}

.ingredient-review__catalog-art {
  width: 100%;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  padding: var(--space-xs);
}

.ingredient-review__catalog-art img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
}

.ingredient-review__catalog-label {
  margin: var(--space-xs) 0 0;
  font-size: 0.72rem;
  line-height: 1.2;
  color: var(--color-text-muted);
  word-break: break-word;
  text-align: center;
}
</style>
