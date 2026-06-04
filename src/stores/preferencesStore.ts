import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

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
  })

  return { houseStrictness }
})
