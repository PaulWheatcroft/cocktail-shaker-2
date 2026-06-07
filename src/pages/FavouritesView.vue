<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import { useFavouritesStore } from '@/stores/favouritesStore'

const favourites = useFavouritesStore()
</script>

<template>
  <section>
    <h1>Favourites</h1>
    <p class="favourites__intro">Cocktails you have marked to return to — stored locally, synced when signed in.</p>

    <p v-if="favourites.count === 0" class="favourites__empty">No favourites yet. Heart a recipe after shaking.</p>

    <ul v-else class="favourites__list">
      <li v-for="fav in favourites.items" :key="fav.cocktailId" class="favourites__item">
        <span>{{ fav.cocktailName }}</span>
        <AppButton variant="ghost" @click="favourites.remove(fav.cocktailId)">Remove</AppButton>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.favourites__intro {
  color: var(--color-text-muted);
  margin-bottom: var(--space-lg);
}

.favourites__empty {
  font-style: italic;
  color: var(--color-text-muted);
}

.favourites__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.favourites__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
</style>
