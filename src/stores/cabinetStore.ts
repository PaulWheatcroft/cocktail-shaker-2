import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { LocalCabinetSnapshot } from '@/services/persistence/sync'
import { pushCabinet } from '@/services/persistence/sync'
import { useAuthStore } from './authStore'

const STORAGE_KEY = 'cocktail-shaker:cabinet'

interface CabinetPersisted {
  items: string[]
  activeForShake: string[]
}

function load(): CabinetPersisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], activeForShake: [] }
    const parsed = JSON.parse(raw) as CabinetPersisted
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      activeForShake: Array.isArray(parsed.activeForShake) ? parsed.activeForShake.slice(0, 2) : [],
    }
  } catch {
    return { items: [], activeForShake: [] }
  }
}

export const useCabinetStore = defineStore('cabinet', () => {
  const saved = load()
  const items = ref<string[]>(saved.items)
  const activeForShake = ref<string[]>(saved.activeForShake)

  const activeCount = computed(() => activeForShake.value.length)
  const canShake = computed(() => activeForShake.value.length >= 1)

  function persist() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ items: items.value, activeForShake: activeForShake.value }),
    )
  }

  watch([items, activeForShake], () => {
    persist()
    queueRemoteSync()
  }, { deep: true })

  let syncTimer: ReturnType<typeof setTimeout> | null = null

  function queueRemoteSync() {
    const auth = useAuthStore()
    if (!auth.isSignedIn || !auth.user) return
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(() => {
      void pushCabinet(auth.user!.id, {
        items: [...items.value],
        activeForShake: [...activeForShake.value],
      })
    }, 400)
  }

  function replaceFromRemote(snapshot: LocalCabinetSnapshot) {
    items.value = [...snapshot.items]
    activeForShake.value = snapshot.activeForShake.slice(0, 2)
  }

  function addItem(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const exists = items.value.some((i) => i.toLowerCase() === trimmed.toLowerCase())
    if (!exists) items.value.push(trimmed)
    toggleActive(trimmed)
  }

  function removeItem(name: string) {
    const lower = name.toLowerCase()
    items.value = items.value.filter((i) => i.toLowerCase() !== lower)
    activeForShake.value = activeForShake.value.filter((i) => i.toLowerCase() !== lower)
  }

  function toggleActive(name: string) {
    const lower = name.toLowerCase()
    const idx = activeForShake.value.findIndex((i) => i.toLowerCase() === lower)
    if (idx >= 0) {
      activeForShake.value.splice(idx, 1)
      return
    }
    if (activeForShake.value.length >= 2) return
    if (!items.value.some((i) => i.toLowerCase() === lower)) {
      items.value.push(name.trim())
    }
    activeForShake.value.push(name.trim())
  }

  function isActive(name: string): boolean {
    return activeForShake.value.some((i) => i.toLowerCase() === name.toLowerCase())
  }

  function ingredientsForShake(): string[] {
    return [...activeForShake.value]
  }

  function setActiveForShake(ingredients: string[]) {
    activeForShake.value = ingredients.slice(0, 2)
  }

  return {
    items,
    activeForShake,
    activeCount,
    canShake,
    addItem,
    removeItem,
    toggleActive,
    isActive,
    ingredientsForShake,
    setActiveForShake,
    replaceFromRemote,
  }
})
