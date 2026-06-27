<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import { isSupabaseConfigured } from '@/services/supabase/client'
import { useAuthStore } from '@/stores/authStore'

defineProps<{
  compact?: boolean
  embedded?: boolean
}>()

const auth = useAuthStore()
const emailDraft = ref('')

function isLocalSupabase(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
  return url.includes('127.0.0.1') || url.includes('localhost:54321')
}
</script>

<template>
  <section
    v-if="isSupabaseConfigured()"
    class="auth"
    :class="{ 'auth--compact': compact, 'auth--embedded': embedded }"
  >
    <template v-if="auth.isSignedIn">
      <p class="auth__signed-in">
        Signed in as <strong>{{ auth.email }}</strong>
        <span v-if="auth.syncing" class="auth__muted"> — syncing…</span>
      </p>
      <AppButton variant="ghost" @click="auth.signOut()">Sign out</AppButton>
    </template>
    <template v-else>
      <div class="auth__form">
        <label class="auth__label">
          Email (optional sign-in)
          <input
            v-model="emailDraft"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            @keydown.enter.prevent="auth.sendMagicLink(emailDraft)"
          />
        </label>
        <AppButton variant="primary" @click="auth.sendMagicLink(emailDraft)">Send magic link</AppButton>
      </div>
      <p class="auth__hint">
        <template v-if="embedded">
          Sign in with a magic link to build your cabinet and sync favourites across devices.
        </template>
        <template v-else>
          Cabinet works without an account. Sign in to sync favourites across devices.
        </template>
        <template v-if="isLocalSupabase()">
          Local dev: open magic links in
          <a href="http://127.0.0.1:54324" target="_blank" rel="noopener">Inbucket (port 54324)</a>,
          not your real inbox.
        </template>
      </p>
    </template>
    <p v-if="auth.authMessage" class="auth__message">{{ auth.authMessage }}</p>
    <p v-if="auth.authError" class="auth__error">{{ auth.authError }}</p>
  </section>
</template>

<style scoped>
.auth {
  padding: var(--space-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-lg);
}

.auth--compact {
  margin-bottom: 0;
  padding: 0;
  background: none;
  border: none;
  border-radius: 0;
  width: 100%;
}

.auth--compact .auth__hint {
  display: none;
}

.auth--embedded {
  margin-bottom: 0;
  padding: 0;
  background: none;
  border: none;
  border-radius: 0;
  width: 100%;
}

.auth--embedded .auth__form {
  flex-direction: column;
  align-items: stretch;
}

.auth--compact .auth__form {
  flex-direction: column;
  align-items: stretch;
}

@media (min-width: 600px) {
  .auth--compact .auth__form {
    align-items: flex-start;
  }

  .auth--compact .auth__label {
    width: 25%;
    min-width: 0;
  }

  .auth--compact .auth__form :deep(.btn) {
    width: 25%;
  }
}

.auth__form {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: flex-end;
}

.auth__label {
  flex: 1;
  min-width: 12rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.auth__label input {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
}

.auth__hint,
.auth__message {
  margin: var(--space-sm) 0 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.auth__signed-in {
  margin: 0 0 var(--space-sm);
  font-size: 0.9rem;
}

.auth__muted {
  color: var(--color-text-muted);
}

.auth__error {
  margin: var(--space-sm) 0 0;
  font-size: 0.85rem;
  color: var(--color-danger);
}
</style>
