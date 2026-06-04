<script setup lang="ts">
import { usePreferencesStore } from '@/stores/preferencesStore'

const preferences = usePreferencesStore()
</script>

<template>
  <section>
    <h1>Preferences</h1>
    <p>House strictness and default style chips will land in Phase 3.</p>

    <div class="prefs-card">
      <label class="prefs-row">
        <span>House strictness</span>
        <input
          v-model.number="preferences.houseStrictness"
          type="range"
          min="0"
          max="100"
          step="5"
        />
        <span class="prefs-value">{{ preferences.houseStrictness }}%</span>
      </label>
      <p class="prefs-note">
        Affects editorial ranking weight only — recommendations stay deterministic.
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

.prefs-row span:first-child {
  grid-column: 1 / -1;
  color: var(--color-text);
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
