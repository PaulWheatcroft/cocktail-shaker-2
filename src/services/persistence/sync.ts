import type { HostessResponse } from '@/types/domain'
import { getSupabase } from '@/services/supabase/client'

export interface LocalCabinetSnapshot {
  items: string[]
  activeForShake: string[]
}

export interface FavouriteSnapshot {
  cocktailId: string
  cocktailName: string
}

function uniqueIngredients(names: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const name of names) {
    const trimmed = name.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(trimmed)
  }
  return result
}

export async function pullCabinet(userId: string): Promise<LocalCabinetSnapshot | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('cabinet_items')
    .select('ingredient_name, sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  const items = (data ?? []).map((row) => row.ingredient_name)
  return { items, activeForShake: items.slice(0, 2) }
}

export async function pushCabinet(userId: string, snapshot: LocalCabinetSnapshot): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return

  const items = uniqueIngredients(snapshot.items)

  const { error: deleteError } = await supabase
    .from('cabinet_items')
    .delete()
    .eq('user_id', userId)

  if (deleteError) throw deleteError
  if (items.length === 0) return

  const { error: insertError } = await supabase.from('cabinet_items').insert(
    items.map((ingredient_name, index) => ({
      user_id: userId,
      ingredient_name,
      sort_order: index,
    })),
  )

  if (insertError) throw insertError
}

export async function pullFavourites(userId: string): Promise<FavouriteSnapshot[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('favourite_cocktails')
    .select('cocktail_id, cocktail_name')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => ({
    cocktailId: row.cocktail_id,
    cocktailName: row.cocktail_name,
  }))
}

export async function pushFavourites(userId: string, favourites: FavouriteSnapshot[]): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return

  const { error: deleteError } = await supabase
    .from('favourite_cocktails')
    .delete()
    .eq('user_id', userId)

  if (deleteError) throw deleteError
  if (favourites.length === 0) return

  const { error: insertError } = await supabase.from('favourite_cocktails').insert(
    favourites.map((fav) => ({
      user_id: userId,
      cocktail_id: fav.cocktailId,
      cocktail_name: fav.cocktailName,
    })),
  )

  if (insertError) throw insertError
}

export async function pullPreferences(userId: string): Promise<number | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('saved_preferences')
    .select('house_strictness')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data?.house_strictness ?? null
}

export async function pushPreferences(userId: string, houseStrictness: number): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return

  const { error } = await supabase.from('saved_preferences').upsert({
    user_id: userId,
    house_strictness: houseStrictness,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}

export async function mergeOnLogin(
  userId: string,
  local: {
    cabinet: LocalCabinetSnapshot
    favourites: FavouriteSnapshot[]
    houseStrictness: number
  },
): Promise<{
  cabinet: LocalCabinetSnapshot
  favourites: FavouriteSnapshot[]
  houseStrictness: number
}> {
  const [remoteCabinet, remoteFavourites, remotePrefs] = await Promise.all([
    pullCabinet(userId),
    pullFavourites(userId),
    pullPreferences(userId),
  ])

  const mergedItems = uniqueIngredients([
    ...(remoteCabinet?.items ?? []),
    ...local.cabinet.items,
  ])

  const mergedActive = local.cabinet.activeForShake.length
    ? local.cabinet.activeForShake.filter((i) =>
        mergedItems.some((m) => m.toLowerCase() === i.toLowerCase()),
      )
    : mergedItems.slice(0, 2)

  const favMap = new Map<string, FavouriteSnapshot>()
  for (const fav of [...(remoteFavourites ?? []), ...local.favourites]) {
    favMap.set(fav.cocktailId, fav)
  }
  const mergedFavourites = [...favMap.values()]

  const mergedStrictness = remotePrefs ?? local.houseStrictness

  const cabinet: LocalCabinetSnapshot = {
    items: mergedItems,
    activeForShake: mergedActive.slice(0, 2),
  }

  await Promise.all([
    pushCabinet(userId, cabinet),
    pushFavourites(userId, mergedFavourites),
    pushPreferences(userId, mergedStrictness),
  ])

  return {
    cabinet,
    favourites: mergedFavourites,
    houseStrictness: mergedStrictness,
  }
}

export async function saveConversationTurn(
  userId: string,
  userRequest: string,
  hostess: HostessResponse,
): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return

  const { data: session, error: sessionError } = await supabase
    .from('conversation_sessions')
    .insert({ user_id: userId, user_request: userRequest })
    .select('id')
    .single()

  if (sessionError) throw sessionError

  const { error: messagesError } = await supabase.from('conversation_messages').insert([
    { session_id: session.id, role: 'user', content: { text: userRequest } },
    { session_id: session.id, role: 'hostess', content: hostess as unknown as Record<string, unknown> },
  ])

  if (messagesError) throw messagesError
}
