import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { pushPreferences } from '@/services/persistence/sync'
import { useAuthStore } from './authStore'

const STORAGE_KEY = 'cocktail-shaker:preferences'

function loadHouseStrictness(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 50
    const parsed = JSON.parse(raw) as { houseStrictness?: number }
    const value = parsed.houseStrictness
    return typeof value === 'number' && value >= 0 && value <= 100 ? value : 50
  } catch {
    return 50
  }
}

export const usePreferencesStore = defineStore('preferences', () => {
  const houseStrictness = ref(loadHouseStrictness())

  watch(houseStrictness, (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ houseStrictness: value }))
    queueRemoteSync(value)
  })

  let syncTimer: ReturnType<typeof setTimeout> | null = null

  function queueRemoteSync(value: number) {
    const auth = useAuthStore()
    if (!auth.isSignedIn || !auth.user) return
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(() => {
      void pushPreferences(auth.user!.id, value)
    }, 400)
  }

  function setHouseStrictness(value: number) {
    houseStrictness.value = Math.min(100, Math.max(0, value))
  }

  return { houseStrictness, setHouseStrictness }
})
