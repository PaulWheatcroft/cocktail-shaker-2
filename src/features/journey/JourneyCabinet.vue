<script setup lang="ts">
import { computed } from 'vue'
import HostessPortrait from '@/components/hostess/HostessPortrait.vue'
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
    <HostessPortrait variant="cabinet" />
    <div class="journey-cabinet__dialogue">
      <h1 class="journey-cabinet__prompt">What shall we raid from your cabinet tonight?</h1>
      <p class="journey-cabinet__hint">Select up to two ingredients, or add something new.</p>
      <p
        v-if="session.status === 'ready' && session.ranked.length === 0"
        class="journey-cabinet__empty"
      >
        Nothing matched that combination — the hostess expects you to try again with better stock.
      </p>
    </div>

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
  </section>
</template>

<style scoped>
.journey-cabinet {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-md) 0 var(--space-2xl);
}

.journey-cabinet__prompt {
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 3.5vw, 1.75rem);
  margin: 0 0 var(--space-sm);
  text-align: center;
}

.journey-cabinet__hint {
  text-align: center;
  color: var(--color-text-muted);
  margin: 0;
  font-size: 0.95rem;
}

.journey-cabinet__empty {
  text-align: center;
  color: var(--color-accent);
  font-family: var(--font-display);
  margin: var(--space-md) 0 0;
  font-size: 1.05rem;
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
