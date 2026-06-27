<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import AuthPanel from '@/features/auth/AuthPanel.vue'
import { useJourneyStore } from '@/stores/journeyStore'

const journey = useJourneyStore()
const route = useRoute()
const navOpen = ref(false)
const isDev = import.meta.env.DEV
const isWideLayout = computed(() => route.meta.wideLayout === true)

function closeNav() {
  navOpen.value = false
}

function goHome() {
  journey.resetToWelcome()
  closeNav()
}

function goToCabinet() {
  journey.advanceToCabinet()
  closeNav()
}
</script>

<template>
  <div class="shell">
    <header class="shell__header">
      <RouterLink to="/" class="shell__brand" @click="goHome">Cocktail Shaker</RouterLink>
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

    <Transition name="fade">
      <div
        v-if="navOpen"
        class="shell__overlay"
        @click="closeNav"
      />
    </Transition>

    <Transition name="slide">
      <nav
        v-if="navOpen"
        id="shell-nav"
        class="shell__nav"
        aria-label="Main"
      >
        <RouterLink to="/" @click="goToCabinet">Cabinet</RouterLink>
        <RouterLink to="/favourites" @click="closeNav">Favourites</RouterLink>
        <RouterLink to="/preferences" @click="closeNav">Preferences</RouterLink>
        <RouterLink v-if="isDev" to="/dev/ingredient-images" @click="closeNav">
          Dev: Image review
        </RouterLink>
        <AuthPanel compact />
      </nav>
    </Transition>

    <main class="shell__main" :class="{ 'shell__main--wide': isWideLayout }">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
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
  font-size: 1.7rem;
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

.shell__overlay {
  position: fixed;
  inset: var(--header-height) 0 0 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 8;
}

.shell__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  z-index: 9;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-100%);
}

/* Page transition: fade + slide */
.page-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(24px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-24px);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}

.shell__nav a {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.shell__nav a.router-link-active {
  color: var(--color-accent);
}

@media (min-width: 600px) {
  .shell__brand {
    font-size: 2.04rem;
  }

  .shell__nav {
    padding-top: var(--space-xl);
  }
}

.shell__main {
  flex: 1;
  min-height: 0;
  padding: var(--space-lg);
  max-width: 42rem;
  margin: 0 auto;
  width: 100%;
}

.shell__main--wide {
  max-width: none;
  padding-inline: var(--space-xl);
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
