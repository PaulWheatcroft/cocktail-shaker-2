<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import AuthPanel from '@/features/auth/AuthPanel.vue'

const navOpen = ref(false)

function closeNav() {
  navOpen.value = false
}
</script>

<template>
  <div class="shell">
    <header class="shell__header">
      <RouterLink to="/" class="shell__brand" @click="closeNav">Cocktail Shaker</RouterLink>
      <button
        type="button"
        class="shell__toggle"
        :aria-expanded="navOpen"
        aria-controls="shell-nav"
        @click="navOpen = !navOpen"
      >
        {{ navOpen ? 'Close' : 'Menu' }}
      </button>
    </header>

    <nav
      id="shell-nav"
      class="shell__nav"
      :class="{ 'shell__nav--open': navOpen }"
      aria-label="Main"
    >
      <RouterLink to="/" @click="closeNav">Cabinet</RouterLink>
      <RouterLink to="/favourites" @click="closeNav">Favourites</RouterLink>
      <RouterLink to="/preferences" @click="closeNav">Preferences</RouterLink>
      <AuthPanel compact />
    </nav>

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
  position: sticky;
  top: 0;
  z-index: 10;
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

.shell__toggle {
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
  cursor: pointer;
}

.shell__toggle:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.shell__nav {
  display: none;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
}

.shell__nav--open {
  display: flex;
}

.shell__nav a {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.shell__nav a.router-link-active {
  color: var(--color-accent);
}

.shell__main {
  flex: 1;
  padding: var(--space-lg);
  max-width: 42rem;
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 720px) {
  .shell__toggle {
    display: none;
  }

  .shell__nav {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-lg);
    padding: var(--space-sm) var(--space-lg);
  }

  .shell__nav :deep(.auth) {
    margin-left: auto;
    margin-bottom: 0;
    padding: 0;
    background: none;
    border: none;
  }
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
