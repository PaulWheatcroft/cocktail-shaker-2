<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import { useFavouritesStore } from '@/stores/favouritesStore'
import { useJourneyStore } from '@/stores/journeyStore'
import { useSessionStore } from '@/stores/sessionStore'

const favourites = useFavouritesStore()
const journey = useJourneyStore()
const session = useSessionStore()
const router = useRouter()

function openFavourite(cocktailId: string) {
  void session.loadCocktailById(cocktailId)
  journey.step = 'reveal'
  void router.push('/')
}
</script>

<template>
  <section>
    <h1>Favourites</h1>
    <p class="favourites__intro">Cocktails you have marked to return to — stored locally, synced when signed in.</p>

    <p v-if="favourites.count === 0" class="favourites__empty">No favourites yet. Heart a recipe after shaking.</p>

    <ul v-else class="favourites__list">
      <li v-for="fav in favourites.items" :key="fav.cocktailId" class="favourites__item">
        <button type="button" class="favourites__name" @click="openFavourite(fav.cocktailId)">
          {{ fav.cocktailName }}
        </button>
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

.favourites__name {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.favourites__name:hover,
.favourites__name:focus-visible {
  color: var(--color-accent);
}
</style>
