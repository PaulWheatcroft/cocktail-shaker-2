<script setup lang="ts">
import { usePreferencesStore } from '@/stores/preferencesStore'

const preferences = usePreferencesStore()
</script>

<template>
  <section>
    <h1>Preferences</h1>
    <p>Saved on this device and synced when you sign in.</p>

    <div class="prefs-card">
      <label class="prefs-row">
        <span class="prefs-label">House strictness</span>
        <input
          v-model.number="preferences.houseStrictness"
          type="range"
          min="0"
          max="100"
          step="5"
          aria-describedby="house-strictness-help"
        />
        <span class="prefs-value">{{ preferences.houseStrictness }}%</span>
      </label>
      <p id="house-strictness-help" class="prefs-note">
        How opinionated the hostess is when she orders your matching drinks.
        <strong>Low</strong> — classics and novelty cocktails are treated much the same.
        <strong>High</strong> — proper classics (martini, negroni, old fashioned and the like)
        rise to the top; flashy party drinks sink.
        Your cabinet still decides what you can make — this only changes which match she puts first.
      </p>
    </div>
  </section>
</template>

<style scoped>
.prefs-card {
  margin-top: var(--space-lg);
  padding: var(--space-lg);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.prefs-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-sm) var(--space-md);
  align-items: center;
}

.prefs-label {
  grid-column: 1 / -1;
  color: var(--color-text);
}

.prefs-note strong {
  color: var(--color-text);
  font-weight: 600;
}

.prefs-value {
  font-variant-numeric: tabular-nums;
  color: var(--color-accent);
  min-width: 3ch;
}

.prefs-note {
  margin-top: var(--space-md);
  margin-bottom: 0;
  font-size: 0.9rem;
}
</style>
