<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import CabinetPicker from '@/features/cabinet/CabinetPicker.vue'
import { useCabinetStore } from '@/stores/cabinetStore'
import { useJourneyStore } from '@/stores/journeyStore'
import { useSessionStore } from '@/stores/sessionStore'

const cabinet = useCabinetStore()
const journey = useJourneyStore()
const session = useSessionStore()

const moodDraft = computed({
  get: () =>
    session.userRequest === 'What should I make from my cabinet?' ? '' : session.userRequest,
  set: (v: string) => session.setUserRequest(v || 'What should I make from my cabinet?'),
})
</script>

<template>
  <section class="journey-cabinet">
    <header class="journey-cabinet__intro">
      <h1 class="journey-cabinet__title">What shall we make tonight?</h1>
      <p
        v-if="session.status === 'ready' && session.ranked.length === 0"
        class="journey-cabinet__empty"
      >
        Nothing matched that combination — try different ingredients.
      </p>
    </header>

    <div class="journey-cabinet__form">
      <CabinetPicker />

      <label class="journey-cabinet__mood">
        <span>Anything in particular? (optional)</span>
        <input
          v-model="moodDraft"
          type="text"
          placeholder="Something dry, perhaps…"
          spellcheck="true"
        />
      </label>

      <AppButton :disabled="!cabinet.canShake" @click="journey.startShake()">
        Shake it
      </AppButton>
    </div>
  </section>
</template>

<style scoped>
.journey-cabinet {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xl);
  padding: var(--space-lg) 0 var(--space-2xl);
  min-height: min(70vh, 32rem);
  justify-content: center;
}

.journey-cabinet__intro {
  width: 100%;
  max-width: 28rem;
  text-align: center;
}

.journey-cabinet__title {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 2rem);
  margin: 0;
  line-height: 1.3;
}

.journey-cabinet__empty {
  margin: var(--space-md) 0 0;
  color: var(--color-accent);
  font-family: var(--font-display);
  font-size: 1.05rem;
}

.journey-cabinet__form {
  width: 100%;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.journey-cabinet__mood {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.journey-cabinet__mood input {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
}
</style>
