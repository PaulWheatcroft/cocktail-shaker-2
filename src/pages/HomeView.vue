<script setup lang="ts">
import { onMounted } from 'vue'
import JourneyWelcome from '@/features/journey/JourneyWelcome.vue'
import JourneyCabinet from '@/features/journey/JourneyCabinet.vue'
import JourneyShaking from '@/features/journey/JourneyShaking.vue'
import JourneyReveal from '@/features/journey/JourneyReveal.vue'
import { useJourneyStore } from '@/stores/journeyStore'

const journey = useJourneyStore()

onMounted(() => {
  journey.resetToWelcome()
  journey.beginJourney()
})
</script>

<template>
  <div class="home-journey">
    <JourneyWelcome v-if="journey.step === 'welcome'" />
    <JourneyCabinet v-else-if="journey.step === 'cabinet'" />
    <JourneyShaking v-else-if="journey.step === 'shaking'" />
    <JourneyReveal v-else-if="journey.step === 'reveal'" />
  </div>
</template>

<style scoped>
.home-journey {
  min-height: 0;
}

.home-journey:has(.journey-cabinet) {
  height: calc(100dvh - var(--header-height) - var(--space-lg) * 2);
  overflow: hidden;
}

@media (max-width: 480px) {
  .home-journey:has(.journey-cabinet) {
    height: calc(100dvh - var(--header-height) - var(--space-md) * 2);
  }
}
</style>
