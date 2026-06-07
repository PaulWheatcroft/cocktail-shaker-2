<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import type { Cocktail } from '@/types/domain'
import { useFavouritesStore } from '@/stores/favouritesStore'

defineProps<{
  cocktail: Cocktail | null
  preparationSteps?: string[] | null
}>()

const favourites = useFavouritesStore()
</script>

<template>
  <article v-if="cocktail" class="recipe-card">
    <img
      v-if="cocktail.image"
      :src="cocktail.image"
      :alt="cocktail.name"
      class="recipe-card__image"
      loading="lazy"
    />
    <div class="recipe-card__body">
      <div class="recipe-card__head">
        <h2>{{ cocktail.name }}</h2>
        <AppButton
          variant="ghost"
          :aria-pressed="favourites.isFavourite(cocktail.id)"
          @click="favourites.toggle(cocktail.id, cocktail.name)"
        >
          {{ favourites.isFavourite(cocktail.id) ? '♥ Favourited' : '♡ Favourite' }}
        </AppButton>
      </div>
      <p v-if="cocktail.glass" class="recipe-card__meta">{{ cocktail.glass }}</p>
      <ul class="recipe-card__ingredients">
        <li v-for="(ing, i) in cocktail.ingredients" :key="i">
          <span v-if="ing.measure" class="recipe-card__measure">{{ ing.measure }}</span>
          {{ ing.name }}
        </li>
      </ul>
      <section v-if="preparationSteps?.length" class="recipe-card__method">
        <h3 class="recipe-card__method-title">Her method</h3>
        <ol class="recipe-card__steps">
          <li v-for="(step, i) in preparationSteps" :key="i">{{ step }}</li>
        </ol>
      </section>
      <p
        v-else-if="cocktail.instructions"
        class="recipe-card__instructions"
      >
        {{ cocktail.instructions }}
      </p>
    </div>
  </article>
  <p v-else class="recipe-card__empty">Select a cocktail to view the recipe.</p>
</template>

<style scoped>
.recipe-card {
  display: grid;
  gap: var(--space-lg);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

@media (min-width: 520px) {
  .recipe-card {
    grid-template-columns: minmax(8rem, 10rem) 1fr;
  }
}

.recipe-card__image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: var(--color-surface);
}

.recipe-card__body {
  padding: var(--space-lg);
}

.recipe-card__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.recipe-card__head h2 {
  margin: 0;
}

.recipe-card__meta {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: var(--space-md);
}

.recipe-card__ingredients {
  margin: 0 0 var(--space-md);
  padding-left: var(--space-lg);
  color: var(--color-text);
}

.recipe-card__measure {
  color: var(--color-accent);
  margin-right: var(--space-xs);
}

.recipe-card__method {
  margin-top: var(--space-sm);
}

.recipe-card__method-title {
  margin: 0 0 var(--space-sm);
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-accent);
  letter-spacing: 0.02em;
}

.recipe-card__steps {
  margin: 0;
  padding-left: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  color: var(--color-text);
  line-height: 1.55;
}

.recipe-card__steps li {
  padding-left: var(--space-xs);
}

.recipe-card__instructions {
  color: var(--color-text-muted);
  white-space: pre-wrap;
  margin: 0;
}

.recipe-card__empty {
  color: var(--color-text-muted);
  font-style: italic;
}
</style>
