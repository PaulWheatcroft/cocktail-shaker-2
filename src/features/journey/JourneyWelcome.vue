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
          <div
            v-if="journey.greetingLoading"
            class="journey-welcome__loading"
            role="status"
            aria-live="polite"
            aria-label="The hostess is arriving"
          >
            <span class="journey-welcome__loader" aria-hidden="true" />
            <h1 class="journey-welcome__headline">The hostess is arriving…</h1>
          </div>
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
  background: rgba(15, 18, 20, 0.6);
  backdrop-filter: blur(16px) saturate(200%);
  -webkit-backdrop-filter: blur(16px) saturate(200%);
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
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.journey-welcome__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.journey-welcome__loading .journey-welcome__headline {
  margin: 0;
}

.journey-welcome__loader {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 1px solid rgba(201, 169, 98, 0.22);
  border-top-color: var(--color-accent);
  animation: journey-welcome-spin 0.85s linear infinite;
}

@keyframes journey-welcome-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .journey-welcome__loader {
    animation: none;
    border-top-color: rgba(201, 169, 98, 0.55);
    opacity: 0.85;
  }
}

.journey-welcome__commentary {
  color: var(--color-text-muted);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  font-style: italic;
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
