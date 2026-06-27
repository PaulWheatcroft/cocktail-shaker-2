<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import AuthPanel from '@/features/auth/AuthPanel.vue'
import CabinetPicker from '@/features/cabinet/CabinetPicker.vue'
import { isSupabaseConfigured } from '@/services/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { useCabinetStore } from '@/stores/cabinetStore'
import { useJourneyStore } from '@/stores/journeyStore'
import { useSessionStore } from '@/stores/sessionStore'
import { computed } from 'vue'

const auth = useAuthStore()
const cabinet = useCabinetStore()
const journey = useJourneyStore()
const session = useSessionStore()

const showCabinet = computed(
  () => !isSupabaseConfigured() || auth.isSignedIn,
)
</script>

<template>
  <section class="journey-cabinet">
    <header class="journey-cabinet__intro">
      <h1 class="journey-cabinet__title">What shall we shake</h1>
      <p
        v-if="showCabinet && session.status === 'ready' && session.ranked.length === 0"
        class="journey-cabinet__empty"
      >
        Nothing matched that combination — try different ingredients.
      </p>
    </header>

    <div class="journey-cabinet__form">
      <CabinetPicker v-if="showCabinet">
        <template #footer>
          <AppButton class="journey-cabinet__shake" :disabled="!cabinet.canShake" @click="journey.startShake()">
            Shake it
          </AppButton>
        </template>
      </CabinetPicker>

      <section v-else class="journey-cabinet__sign-in" aria-label="Your cabinet">
        <h2 class="journey-cabinet__cabinet-heading">Your cabinet</h2>
        <AuthPanel embedded />
      </section>
    </div>
  </section>
</template>

<style scoped>
.journey-cabinet {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  height: 100%;
  padding: 0;
  overflow-x: hidden;
  overflow-y: hidden;
}

.journey-cabinet__intro {
  flex: 0 0 auto;
  width: 100%;
  max-width: 32rem;
  text-align: center;
}

.journey-cabinet__title {
  margin: 0;
  line-height: 1.25;
}

.journey-cabinet__empty {
  margin: var(--space-xs) 0 0;
  color: var(--color-accent);
  font-family: var(--font-display);
  font-size: 0.95rem;
}

.journey-cabinet__form {
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 32rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding-inline: var(--space-sm);
}

.journey-cabinet__sign-in {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.journey-cabinet__cabinet-heading {
  margin: 0;
  text-align: center;
  font-size: 1.375rem;
}

.journey-cabinet__shake {
  flex: 0 0 auto;
}
</style>
