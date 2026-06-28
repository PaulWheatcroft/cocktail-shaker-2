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
        How strongly the hostess favours the classics.
        <strong>Low</strong> and everything ranks equally.
        <strong>High</strong> and proper classics (martini, negroni, old fashioned) come first,
        flashy party drinks last.
      </p>
      <p class="prefs-note">Go low and brace yourself to be judged!</p>
      <p class="prefs-note">Go high and let the classics shine.</p>
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
