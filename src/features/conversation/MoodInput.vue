<script setup lang="ts">
import { useSessionStore } from '@/stores/sessionStore'

const session = useSessionStore()
</script>

<template>
  <label class="mood">
    <span class="mood__label">What are you in the mood for? (optional)</span>
    <input
      :value="session.userRequest"
      type="text"
      placeholder="Something dry and serious…"
      autocomplete="off"
      @input="session.setUserRequest(($event.target as HTMLInputElement).value)"
    />
  </label>
</template>

<style scoped>
.mood {
  display: block;
  margin-bottom: var(--space-md);
}

.mood__label {
  display: block;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
}

.mood input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
}
</style>
