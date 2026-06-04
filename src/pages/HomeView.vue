<script setup lang="ts">
import CabinetInput from '@/features/cabinet/CabinetInput.vue'
import StyleFilters from '@/features/cabinet/StyleFilters.vue'
import DiscoveryStates from '@/features/cocktails/DiscoveryStates.vue'
import RankedResults from '@/features/cocktails/RankedResults.vue'
import RecipeCard from '@/features/cocktails/RecipeCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useCabinetStore } from '@/stores/cabinetStore'
import { useSessionStore } from '@/stores/sessionStore'

const cabinet = useCabinetStore()
const session = useSessionStore()

async function shakeFirstOnly() {
  const ing = cabinet.activeForShake[0]
  if (!ing) return
  cabinet.setActiveForShake([ing])
  await session.shake()
}

async function shakeSecondOnly() {
  const ing = cabinet.activeForShake[1]
  if (!ing) return
  cabinet.setActiveForShake([ing])
  await session.shake()
}
</script>

<template>
  <section class="home">
    <h1>Your cabinet, judged properly</h1>
    <p class="home__intro">
      Add what you have, choose up to two for a shake, and see what you can make — ranked before
      the hostess arrives.
    </p>

    <CabinetInput />
    <StyleFilters />

    <div class="home__shake">
      <AppButton :disabled="!cabinet.canShake || session.status === 'loading'" @click="session.shake()">
        {{ session.status === 'loading' ? 'Shaking…' : 'Shake it' }}
      </AppButton>
    </div>

    <DiscoveryStates
      :status="session.status"
      :fallback-mode="session.fallbackMode"
      :error-message="session.errorMessage"
      :active-ingredients="cabinet.ingredientsForShake()"
      @retry="session.shake()"
      @shake-first="shakeFirstOnly"
      @shake-second="shakeSecondOnly"
    >
      <template v-if="session.status === 'ready' && session.ranked.length === 0" #empty>
        <p class="discovery-states__empty">No cocktails found. Try different ingredients.</p>
        <div v-if="cabinet.ingredientsForShake().length === 2" class="discovery-states__actions">
          <AppButton variant="ghost" @click="shakeFirstOnly">
            Search with {{ cabinet.ingredientsForShake()[0] }}
          </AppButton>
          <AppButton variant="ghost" @click="shakeSecondOnly">
            Search with {{ cabinet.ingredientsForShake()[1] }}
          </AppButton>
        </div>
      </template>
    </DiscoveryStates>

    <div v-if="session.status === 'ready' && session.topThree.length" class="home__results">
      <h2>Recommendations</h2>
      <RankedResults
        :results="session.topThree"
        :selected-id="session.selectedId"
        @select="session.selectCocktail"
      />
      <RecipeCard :cocktail="session.selectedCandidate?.cocktail ?? null" />
    </div>
  </section>
</template>

<style scoped>
.home__intro {
  margin-bottom: var(--space-xl);
}

.home__shake {
  margin: var(--space-lg) 0;
}

.home__results {
  margin-top: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.home__results h2 {
  margin-bottom: 0;
}
</style>
