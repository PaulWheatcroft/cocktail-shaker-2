<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="shell">
    <header class="shell__header">
      <RouterLink to="/" class="shell__brand">Cocktail Shaker</RouterLink>
      <nav class="shell__nav">
        <RouterLink to="/">Cabinet</RouterLink>
        <RouterLink to="/preferences">Preferences</RouterLink>
      </nav>
    </header>
    <main class="shell__main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.shell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  min-height: var(--header-height);
}

.shell__brand {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.shell__brand:hover {
  color: var(--color-accent);
  text-decoration: none;
}

.shell__nav {
  display: flex;
  gap: var(--space-lg);
  font-size: 0.9rem;
}

.shell__nav a {
  color: var(--color-text-muted);
}

.shell__nav a.router-link-active {
  color: var(--color-accent);
}

.shell__main {
  flex: 1;
  padding: var(--space-lg);
  max-width: 56rem;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 480px) {
  .shell__header {
    padding: var(--space-sm) var(--space-md);
  }

  .shell__main {
    padding: var(--space-md);
  }
}
</style>
