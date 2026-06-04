<script setup lang="ts">
import { ref } from 'vue'
import {
  fetchCocktailsByIngredient,
  getApiRoot,
  usesV1ParityTier,
} from '@/services/cocktailApi/client'
import type { CocktailDbDrink } from '@/services/cocktailApi/types.raw'

const probeIngredient = ref('gin')
const probeStatus = ref<'idle' | 'loading' | 'ok' | 'error'>('idle')
const probeCount = ref<number | null>(null)
const probeError = ref<string | null>(null)
const apiTierLabel = usesV1ParityTier()
  ? 'Patreon v2 (v1 parity)'
  : 'Public v1 test tier — set VITE_COCKTAIL_API_KEY for full parity'

async function runApiProbe() {
  probeStatus.value = 'loading'
  probeError.value = null
  probeCount.value = null
  try {
    const drinks = await fetchCocktailsByIngredient(probeIngredient.value)
    probeCount.value = drinks.filter((d): d is CocktailDbDrink => d !== null).length
    probeStatus.value = 'ok'
  } catch (e) {
    probeStatus.value = 'error'
    probeError.value = e instanceof Error ? e.message : 'Request failed'
  }
}
</script>

<template>
  <section class="home">
    <h1>Your cabinet, judged properly</h1>
    <p>
      Phase 0 foundation is in place. Ingredient entry, ranking, and the hostess arrive in Phase
      1–2.
    </p>

    <div class="home__card">
      <h2>API connectivity check</h2>
      <p class="home__hint">
        Tier: {{ apiTierLabel }}. Root: <code>{{ getApiRoot() }}</code> — see
        <a href="https://github.com/PaulWheatcroft/theCocktailShaker" target="_blank" rel="noopener"
          >original app</a
        >
        and <code>docs/api-contract.md</code>.
      </p>
      <div class="home__probe">
        <label for="probe-ingredient">Ingredient</label>
        <input
          id="probe-ingredient"
          v-model="probeIngredient"
          type="text"
          autocomplete="off"
          spellcheck="false"
        />
        <button type="button" :disabled="probeStatus === 'loading'" @click="runApiProbe">
          {{ probeStatus === 'loading' ? 'Checking…' : 'Test API' }}
        </button>
      </div>
      <p v-if="probeStatus === 'ok'" class="home__result home__result--ok">
        Found {{ probeCount }} cocktail(s) for “{{ probeIngredient }}”.
      </p>
      <p v-else-if="probeStatus === 'error'" class="home__result home__result--error">
        {{ probeError }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.home__card {
  margin-top: var(--space-xl);
  padding: var(--space-lg);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.home__hint {
  font-size: 0.9rem;
}

.home__hint code {
  font-size: 0.85em;
  color: var(--color-accent);
}

.home__probe {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: flex-end;
  margin-top: var(--space-md);
}

.home__probe label {
  width: 100%;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.home__probe input {
  flex: 1;
  min-width: 8rem;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
}

.home__probe button {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-md);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  cursor: pointer;
}

.home__probe button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.home__result {
  margin-top: var(--space-md);
  margin-bottom: 0;
}

.home__result--ok {
  color: var(--color-accent);
}

.home__result--error {
  color: var(--color-danger);
}
</style>
