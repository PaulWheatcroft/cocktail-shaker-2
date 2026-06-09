<script setup lang="ts">
import type { Cocktail, DrinkPresentation } from '@/types/domain'
import { useFavouritesStore } from '@/stores/favouritesStore'

defineProps<{
  cocktail: Cocktail
  presentation: DrinkPresentation | null
  verdict?: string | null
  bare?: boolean
}>()

const favourites = useFavouritesStore()
</script>

<template>
  <article class="drink-hero" :class="{ 'drink-hero--bare': bare }">
    <div class="drink-hero__title-row">
      <h1 class="drink-hero__name">{{ cocktail.name }}</h1>
    </div>

    <img
      v-if="cocktail.image"
      :src="cocktail.image"
      :alt="cocktail.name"
      class="drink-hero__image"
      loading="lazy"
    />

    <div class="drink-hero__body">
      <div class="drink-hero__meta-row">
        <p v-if="cocktail.glass" class="drink-hero__meta">{{ cocktail.glass }}</p>
        <button
          type="button"
          class="drink-hero__favourite"
          :class="{ 'drink-hero__favourite--active': favourites.isFavourite(cocktail.id) }"
          :aria-pressed="favourites.isFavourite(cocktail.id)"
          :aria-label="
            favourites.isFavourite(cocktail.id)
              ? `Remove ${cocktail.name} from favourites`
              : `Add ${cocktail.name} to favourites`
          "
          @click="favourites.toggle(cocktail.id, cocktail.name)"
        >
          <span aria-hidden="true">{{ favourites.isFavourite(cocktail.id) ? '♥' : '♡' }}</span>
        </button>
      </div>

      <p v-if="verdict" class="drink-hero__verdict">{{ verdict }}</p>

      <p v-if="presentation?.pitch" class="drink-hero__pitch">{{ presentation.pitch }}</p>
      <p v-else-if="cocktail.instructions" class="drink-hero__pitch drink-hero__pitch--plain">
        {{ cocktail.instructions }}
      </p>

      <ul class="drink-hero__ingredients">
        <li v-for="(ing, i) in cocktail.ingredients" :key="i">
          <span v-if="ing.measure" class="drink-hero__measure">{{ ing.measure }}</span>
          {{ ing.name }}
        </li>
      </ul>

      <section v-if="presentation?.preparationSteps?.length" class="drink-hero__method">
        <h3>Her method</h3>
        <ol>
          <li v-for="(step, i) in presentation.preparationSteps" :key="i">{{ step }}</li>
        </ol>
      </section>
    </div>
  </article>
</template>

<style scoped>
.drink-hero {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.drink-hero--bare {
  background: none;
  border: none;
  border-radius: 0;
  overflow: visible;
}

.drink-hero__title-row {
  padding: 0 0 var(--space-sm);
  text-align: center;
}

.drink-hero__name {
  margin: 0;
  line-height: 1.25;
}

.drink-hero__meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.drink-hero__favourite {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  margin-left: auto;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: 1.65rem;
  line-height: 1;
  cursor: pointer;
}

.drink-hero__favourite--active {
  color: var(--color-accent);
}

.drink-hero__favourite:hover,
.drink-hero__favourite:focus-visible {
  color: var(--color-accent);
}

/* Blend keeps gold display type legible over the blurred portrait behind the card. */
.drink-hero--bare .drink-hero__name,
.drink-hero--bare .drink-hero__verdict {
  color: var(--color-accent);
  mix-blend-mode: exclusion;
}

.drink-hero__image {
  width: 100%;
  max-height: 14rem;
  object-fit: cover;
  background: var(--color-surface);
}

.drink-hero--bare .drink-hero__image {
  border-radius: var(--radius-md);
  max-height: 10rem;
}

.drink-hero__body {
  padding: var(--space-lg);
}

.drink-hero--bare .drink-hero__body {
  padding: var(--space-md) 0 0;
}

.drink-hero__meta {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.drink-hero__verdict {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--color-accent);
  margin: 0 0 var(--space-md);
  line-height: 1.35;
}

.drink-hero__pitch {
  color: var(--color-text);
  line-height: 1.55;
  margin: 0 0 var(--space-md);
}

.drink-hero__pitch--plain {
  color: var(--color-text-muted);
  white-space: pre-wrap;
}

.drink-hero__ingredients {
  margin: 0 0 var(--space-md);
  padding-left: var(--space-lg);
}

.drink-hero__measure {
  color: var(--color-accent);
  margin-right: var(--space-xs);
}

.drink-hero__method h3 {
  margin: 0 0 var(--space-sm);
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-accent);
}

.drink-hero__method ol {
  margin: 0;
  padding-left: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  line-height: 1.55;
}
</style>
