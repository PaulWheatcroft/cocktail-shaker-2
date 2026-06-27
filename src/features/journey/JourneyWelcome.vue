<script setup lang="ts">
import HostessPortrait from '@/components/hostess/HostessPortrait.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useJourneyStore } from '@/stores/journeyStore'

const journey = useJourneyStore()
</script>

<template>
  <section class="journey-welcome">
    <div class="journey-welcome__stage">
      <HostessPortrait variant="welcome" full-height class="journey-welcome__portrait" />

      <div class="journey-welcome__card">
        <div class="journey-welcome__scroll">
          <p v-if="journey.greetingLoading" class="journey-welcome__loading">
            The hostess is arriving…
          </p>
          <template v-else-if="journey.greeting">
            <h1 class="journey-welcome__headline">{{ journey.greeting.greeting }}</h1>
            <p v-if="journey.greeting.favouritesCommentary" class="journey-welcome__commentary">
              {{ journey.greeting.favouritesCommentary }}
            </p>
          </template>
        </div>

        <div class="journey-welcome__actions">
          <AppButton :disabled="journey.greetingLoading" @click="journey.advanceToCabinet()">
            Enter the bar
          </AppButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.journey-welcome {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 0;
}

.journey-welcome__stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
}

.journey-welcome__stage :deep(.hostess-portrait) {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.journey-welcome__card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 28rem;
  max-height: min(48vh, 20rem);
  display: flex;
  flex-direction: column;
  background: rgba(15, 18, 20, 0.45);
  backdrop-filter: blur(16px) saturate(130%);
  -webkit-backdrop-filter: blur(16px) saturate(130%);
  border: 1px solid rgba(232, 228, 220, 0.1);
  border-radius: var(--radius-lg);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.journey-welcome__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-lg);
  text-align: center;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 98, 0.35) transparent;
}

.journey-welcome__scroll::-webkit-scrollbar {
  width: 6px;
}

.journey-welcome__scroll::-webkit-scrollbar-thumb {
  background: rgba(201, 169, 98, 0.35);
  border-radius: 3px;
}

.journey-welcome__headline {
  line-height: 1.35;
  margin: 0 0 var(--space-md);
}

.journey-welcome__commentary {
  color: var(--color-text-muted);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  font-style: italic;
}

.journey-welcome__loading {
  font-family: var(--font-display);
  color: var(--color-accent);
  margin: 0;
}

.journey-welcome__actions {
  flex-shrink: 0;
  padding: var(--space-md) var(--space-lg) var(--space-lg);
  border-top: 1px solid rgba(232, 228, 220, 0.08);
  display: flex;
  justify-content: center;
  background: rgba(15, 18, 20, 0.2);
}
</style>
