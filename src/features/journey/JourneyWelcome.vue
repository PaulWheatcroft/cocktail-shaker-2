<script setup lang="ts">
import HostessPortrait from '@/components/hostess/HostessPortrait.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useJourneyStore } from '@/stores/journeyStore'

const journey = useJourneyStore()
</script>

<template>
  <section class="journey-welcome">
    <HostessPortrait variant="welcome" />
    <div class="journey-welcome__copy">
      <p v-if="journey.greetingLoading" class="journey-welcome__loading">The hostess is arriving…</p>
      <template v-else-if="journey.greeting">
        <h1 class="journey-welcome__headline">{{ journey.greeting.greeting }}</h1>
        <p v-if="journey.greeting.favouritesCommentary" class="journey-welcome__commentary">
          {{ journey.greeting.favouritesCommentary }}
        </p>
      </template>
    </div>
    <AppButton :disabled="journey.greetingLoading" @click="journey.advanceToCabinet()">
      Enter the bar
    </AppButton>
  </section>
</template>

<style scoped>
.journey-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xl);
  text-align: center;
  padding: var(--space-lg) 0 var(--space-2xl);
}

.journey-welcome__headline {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 2rem);
  line-height: 1.3;
  margin: 0 0 var(--space-md);
}

.journey-welcome__commentary {
  color: var(--color-text-muted);
  font-size: 1.05rem;
  line-height: 1.55;
  margin: 0;
  font-style: italic;
}

.journey-welcome__loading {
  font-family: var(--font-display);
  color: var(--color-accent);
  margin: 0;
}
</style>
