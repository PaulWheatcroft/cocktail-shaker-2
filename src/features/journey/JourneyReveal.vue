<script setup lang="ts">
import { computed } from 'vue'
import ShakerAnimation from '@/components/animation/ShakerAnimation.vue'
import HostessPortrait from '@/components/hostess/HostessPortrait.vue'
import AppButton from '@/components/ui/AppButton.vue'
import DrinkHero from '@/features/cocktails/DrinkHero.vue'
import RefinementChips from '@/features/conversation/RefinementChips.vue'
import { useJourneyStore } from '@/stores/journeyStore'
import { useSessionStore } from '@/stores/sessionStore'

const journey = useJourneyStore()
const session = useSessionStore()

const showVerdict = computed(
  () =>
    session.selectedCandidate?.cocktail.name.toLowerCase() ===
    session.hostessPrimaryName?.toLowerCase(),
)

function selectAlternative(id: string) {
  session.selectCocktail(id)
}
</script>

<template>
  <section class="journey-reveal">
    <ShakerAnimation
      v-if="session.hostessStatus === 'loading'"
      label="The hostess is reconsidering…"
    />
    <template v-else>
    <HostessPortrait variant="reveal" />

    <p
      v-if="session.fallbackMode"
      class="journey-reveal__fallback"
    >
      Nothing matched both ingredients — showing results for one only.
    </p>

    <DrinkHero
      v-if="session.selectedCandidate"
      :cocktail="session.selectedCandidate.cocktail"
      :presentation="session.selectedPresentation"
      :verdict="showVerdict ? session.hostessResponse?.verdict : null"
    />

    <div v-if="session.topThree.length > 1" class="journey-reveal__alts">
      <h3 class="journey-reveal__alts-title">Also tolerable</h3>
      <div class="journey-reveal__alt-row">
        <button
          v-for="item in session.topThree"
          :key="item.cocktail.id"
          type="button"
          class="journey-reveal__alt"
          :class="{
            'journey-reveal__alt--selected': item.cocktail.id === session.selectedId,
            'journey-reveal__alt--primary':
              item.cocktail.name.toLowerCase() === session.hostessPrimaryName?.toLowerCase(),
          }"
          @click="selectAlternative(item.cocktail.id)"
        >
          {{ item.cocktail.name }}
        </button>
      </div>
    </div>

    <RefinementChips
      v-if="session.hostessResponse?.followUpSuggestions.length"
      :suggestions="session.hostessResponse.followUpSuggestions"
      @select="session.applyRefinement"
    />

    <p v-if="session.hostessDegraded" class="journey-reveal__degraded">
      The hostess was briefly indisposed — you have a serviceable recommendation nonetheless.
    </p>

    <AppButton variant="ghost" @click="journey.newRound()">Another round</AppButton>
    </template>
  </section>
</template>

<style scoped>
.journey-reveal {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-md) 0 var(--space-2xl);
}

.journey-reveal__fallback {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
}

.journey-reveal__alts-title {
  margin: 0 0 var(--space-sm);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.journey-reveal__alt-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.journey-reveal__alt {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.9rem;
}

.journey-reveal__alt:hover {
  border-color: var(--color-accent);
}

.journey-reveal__alt--selected {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.journey-reveal__alt--primary::after {
  content: ' ★';
  color: var(--color-accent);
}

.journey-reveal__degraded {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-style: italic;
  margin: 0;
}
</style>
