import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'
import { authRedirectUrl, completeAuthCallback } from '@/services/supabase/authCallback'
import { getSupabase, isSupabaseConfigured } from '@/services/supabase/client'
import { mergeOnLogin } from '@/services/persistence/sync'
import { useCabinetStore } from './cabinetStore'
import { useFavouritesStore } from './favouritesStore'
import { usePreferencesStore } from './preferencesStore'

function describeSyncError(e: unknown): string {
  if (e instanceof Error) return e.message
  if (e && typeof e === 'object') {
    const o = e as Record<string, unknown>
    const parts = [o.message, o.details, o.hint, o.code]
      .filter((v): v is string | number => typeof v === 'string' || typeof v === 'number')
      .map(String)
    if (parts.length) return parts.join(' — ')
  }
  return 'Could not sync your data.'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const initialized = ref(false)
  const authMessage = ref<string | null>(null)
  const authError = ref<string | null>(null)
  const syncing = ref(false)

  const isSignedIn = computed(() => user.value !== null)
  const email = computed(() => user.value?.email ?? null)

  // init() and the onAuthStateChange listener can both ask to sync; dedupe any
  // overlapping runs so two merges never write the same rows concurrently.
  let inFlightSync: Promise<void> | null = null

  function applyMergedLocalState(): Promise<void> {
    if (!user.value) return Promise.resolve()
    if (inFlightSync) return inFlightSync
    inFlightSync = runMergeOnLogin().finally(() => {
      inFlightSync = null
    })
    return inFlightSync
  }

  async function runMergeOnLogin() {
    if (!user.value) return
    syncing.value = true
    authError.value = null
    try {
      const cabinet = useCabinetStore()
      const favourites = useFavouritesStore()
      const preferences = usePreferencesStore()

      const merged = await mergeOnLogin(user.value.id, {
        cabinet: {
          items: [...cabinet.items],
          activeForShake: [...cabinet.activeForShake],
        },
        favourites: favourites.all(),
        houseStrictness: preferences.houseStrictness,
      })

      cabinet.replaceFromRemote(merged.cabinet)
      favourites.replaceFromRemote(merged.favourites)
      preferences.replaceFromRemote(merged.houseStrictness)
      authMessage.value = 'Your cabinet and favourites are synced.'
    } catch (e) {
      console.error('[auth] sync failed', e)
      authError.value = describeSyncError(e)
    } finally {
      syncing.value = false
    }
  }

  async function init() {
    const supabase = getSupabase()
    if (!supabase) {
      initialized.value = true
      return
    }

    const callback = await completeAuthCallback(supabase)
    if (callback.error) {
      authError.value = callback.error
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      // Initial session is merged in init() below — avoid a duplicate merge and
      // a signed-in + syncing=false window before favourites are loaded.
      if (event === 'INITIAL_SESSION') return

      if (event === 'SIGNED_IN' && session?.user) {
        syncing.value = true
        user.value = session.user
        await applyMergedLocalState()
        return
      }

      user.value = session?.user ?? null
    })

    const { data } = await supabase.auth.getSession()
    const sessionUser = data.session?.user ?? null

    if (sessionUser) {
      syncing.value = true
      user.value = sessionUser
      await applyMergedLocalState()
    } else {
      user.value = null
      if (callback.handled && !callback.error) {
        authMessage.value = 'Signed in successfully.'
      }
    }

    initialized.value = true
  }

  async function sendMagicLink(emailAddress: string) {
    authMessage.value = null
    authError.value = null

    if (!isSupabaseConfigured()) {
      authError.value = 'Supabase is not configured.'
      return
    }

    const supabase = getSupabase()
    if (!supabase) return

    const { error } = await supabase.auth.signInWithOtp({
      email: emailAddress.trim(),
      options: { emailRedirectTo: authRedirectUrl() },
    })

    if (error) {
      authError.value = error.message
      return
    }

    authMessage.value = 'Check your email for a sign-in link.'
  }

  async function signOut() {
    authMessage.value = null
    authError.value = null
    const supabase = getSupabase()
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) {
      authError.value = error.message
      return
    }
    user.value = null
    authMessage.value = 'Signed out. Local cabinet remains on this device.'
  }

  return {
    user,
    initialized,
    authMessage,
    authError,
    syncing,
    isSignedIn,
    email,
    init,
    sendMagicLink,
    signOut,
  }
})
