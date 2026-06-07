import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'
import { authRedirectUrl, completeAuthCallback } from '@/services/supabase/authCallback'
import { getSupabase, isSupabaseConfigured } from '@/services/supabase/client'
import { mergeOnLogin } from '@/services/persistence/sync'
import { useCabinetStore } from './cabinetStore'
import { useFavouritesStore } from './favouritesStore'
import { usePreferencesStore } from './preferencesStore'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const initialized = ref(false)
  const authMessage = ref<string | null>(null)
  const authError = ref<string | null>(null)
  const syncing = ref(false)

  const isSignedIn = computed(() => user.value !== null)
  const email = computed(() => user.value?.email ?? null)

  async function applyMergedLocalState() {
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
      preferences.setHouseStrictness(merged.houseStrictness)
      authMessage.value = 'Your cabinet and favourites are synced.'
    } catch (e) {
      authError.value = e instanceof Error ? e.message : 'Could not sync your data.'
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

    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    initialized.value = true

    if (user.value) {
      await applyMergedLocalState()
    } else if (callback.handled && !callback.error) {
      authMessage.value = 'Signed in successfully.'
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      user.value = session?.user ?? null
      if (event === 'SIGNED_IN' && session?.user) {
        await applyMergedLocalState()
      }
    })
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
