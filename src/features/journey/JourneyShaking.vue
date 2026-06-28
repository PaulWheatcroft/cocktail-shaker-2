<script setup lang="ts">
import { computed } from 'vue'
import ShakerAnimation from '@/components/animation/ShakerAnimation.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useJourneyStore } from '@/stores/journeyStore'
import { useSessionStore } from '@/stores/sessionStore'

const journey = useJourneyStore()
const session = useSessionStore()

const quip = computed(() => {
  if (session.status === 'error') {
    return session.errorMessage ?? 'Something went awry.'
  }
  if (session.status === 'loading' || session.hostessStatus === 'loading') {
    return 'The hostess is forming an opinion…'
  }
  return 'Almost ready…'
})

async function retry() {
  await journey.startShake()
}
</script>

<template>
  <section class="journey-shaker-screen journey-shaking">
    <ShakerAnimation :label="quip" />
    <p v-if="session.hostessDegraded && session.hostessError" class="journey-shaking__warn">
      {{ session.hostessError }}
    </p>
    <AppButton v-if="session.status === 'error'" variant="ghost" @click="retry">
      Try again
    </AppButton>
  </section>
</template>

<style scoped>
.journey-shaking__warn {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
}
</style>
