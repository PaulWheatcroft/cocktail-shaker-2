<script setup lang="ts">
import JourneyWelcome from '@/features/journey/JourneyWelcome.vue'
import JourneyCabinet from '@/features/journey/JourneyCabinet.vue'
import JourneyShaking from '@/features/journey/JourneyShaking.vue'
import JourneyReveal from '@/features/journey/JourneyReveal.vue'
import { useJourneyStore } from '@/stores/journeyStore'

const journey = useJourneyStore()
</script>

<template>
  <div class="home-journey">
    <Transition name="step" mode="out-in">
      <JourneyWelcome v-if="journey.step === 'welcome'" key="welcome" />
      <JourneyCabinet v-else-if="journey.step === 'cabinet'" key="cabinet" />
      <JourneyShaking v-else-if="journey.step === 'shaking'" key="shaking" />
      <JourneyReveal v-else-if="journey.step === 'reveal'" key="reveal" />
    </Transition>
  </div>
</template>

<style scoped>
.home-journey {
  min-height: 0;
}

.step-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.step-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.step-enter-from {
  opacity: 0;
  transform: translateY(24px);
}

.step-leave-to {
  opacity: 0;
  transform: translateY(-24px);
}

@media (prefers-reduced-motion: reduce) {
  .step-enter-active,
  .step-leave-active {
    transition: none;
  }
}

.home-journey:has(.journey-cabinet),
.home-journey:has(.journey-welcome) {
  height: calc(100dvh - var(--header-height) - var(--space-lg) * 2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (max-width: 480px) {
  .home-journey:has(.journey-cabinet),
  .home-journey:has(.journey-welcome) {
    height: calc(100dvh - var(--header-height) - var(--space-md) * 2);
  }
}
</style>
