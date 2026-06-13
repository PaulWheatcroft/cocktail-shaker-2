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
      v-if="session.hostessStatus === 'loading' || session.status === 'loading'"
      label="The hostess is shaking your drink…"
    />

    <div v-else class="journey-reveal__stage">
      <div class="journey-reveal__card">
        <HostessPortrait variant="reveal" class="journey-reveal__portrait" />

        <div class="journey-reveal__scroll">
          <p v-if="session.fallbackMode" class="journey-reveal__fallback">
            Nothing matched both ingredients — showing results for one only.
          </p>

          <DrinkHero
            v-if="session.selectedCandidate"
            bare
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
        </div>

        <div class="journey-reveal__actions">
          <AppButton variant="ghost" @click="journey.newRound()">Another round</AppButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.journey-reveal {
  height: calc(100dvh - var(--header-height) - 2 * var(--space-lg));
  max-height: calc(100dvh - var(--header-height) - 2 * var(--space-lg));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
}

.journey-reveal__stage {
  position: relative;
  align-self: stretch;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: var(--space-sm) 0;
}

.journey-reveal__card {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 32rem;
  margin: var(--space-xs) 0;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(232, 228, 220, 0.1);
  border-radius: var(--radius-lg);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  overflow: hidden;
  isolation: isolate;
}

.journey-reveal__card :deep(.hostess-portrait) {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  pointer-events: none;
}

.journey-reveal__card :deep(.hostess-portrait__img) {
  height: 100%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  object-position: center;
}

.journey-reveal__scroll {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  background: rgba(15, 18, 20, 0.45);
  backdrop-filter: blur(16px) saturate(130%);
  -webkit-backdrop-filter: blur(16px) saturate(130%);
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 98, 0.35) transparent;
}

.journey-reveal__scroll::-webkit-scrollbar {
  width: 6px;
}

.journey-reveal__scroll::-webkit-scrollbar-thumb {
  background: rgba(201, 169, 98, 0.35);
  border-radius: 3px;
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
  border: 1px solid rgba(232, 228, 220, 0.15);
  border-radius: var(--radius-md);
  background: rgba(35, 42, 49, 0.45);
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
  background: rgba(201, 169, 98, 0.12);
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
  text-align: center;
}

.journey-reveal__actions {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  padding: var(--space-md) var(--space-lg) var(--space-lg);
  border-top: 1px solid rgba(232, 228, 220, 0.08);
  display: flex;
  justify-content: center;
  background: rgba(15, 18, 20, 0.5);
  backdrop-filter: blur(16px) saturate(130%);
  -webkit-backdrop-filter: blur(16px) saturate(130%);
}
</style>
