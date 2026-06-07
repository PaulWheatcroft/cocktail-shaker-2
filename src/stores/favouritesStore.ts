import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { FavouriteSnapshot } from '@/services/persistence/sync'
import { pushFavourites } from '@/services/persistence/sync'
import { useAuthStore } from './authStore'

const STORAGE_KEY = 'cocktail-shaker:favourites'

function load(): FavouriteSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { items?: FavouriteSnapshot[] }
    if (!Array.isArray(parsed.items)) return []
    return parsed.items.filter(
      (i) => typeof i.cocktailId === 'string' && typeof i.cocktailName === 'string',
    )
  } catch {
    return []
  }
}

export const useFavouritesStore = defineStore('favourites', () => {
  const items = ref<FavouriteSnapshot[]>(load())

  const count = computed(() => items.value.length)

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: items.value }))
  }

  watch(items, persist, { deep: true })

  function all(): FavouriteSnapshot[] {
    return [...items.value]
  }

  function isFavourite(cocktailId: string): boolean {
    return items.value.some((f) => f.cocktailId === cocktailId)
  }

  function toggle(cocktailId: string, cocktailName: string) {
    const idx = items.value.findIndex((f) => f.cocktailId === cocktailId)
    if (idx >= 0) {
      items.value.splice(idx, 1)
    } else {
      items.value.unshift({ cocktailId, cocktailName })
    }
    queueRemoteSync()
  }

  function remove(cocktailId: string) {
    items.value = items.value.filter((f) => f.cocktailId !== cocktailId)
    queueRemoteSync()
  }

  function replaceFromRemote(remote: FavouriteSnapshot[]) {
    items.value = [...remote]
  }

  let syncTimer: ReturnType<typeof setTimeout> | null = null

  function queueRemoteSync() {
    const auth = useAuthStore()
    if (!auth.isSignedIn || !auth.user) return

    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(() => {
      void pushFavourites(auth.user!.id, items.value)
    }, 400)
  }

  return {
    items,
    count,
    all,
    isFavourite,
    toggle,
    remove,
    replaceFromRemote,
  }
})
