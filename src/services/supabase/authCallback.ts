import type { EmailOtpType, SupabaseClient } from '@supabase/supabase-js'

function cleanAuthParamsFromUrl(): void {
  const url = new URL(window.location.href)
  const authParams = [
    'code',
    'token_hash',
    'type',
    'access_token',
    'refresh_token',
    'error',
    'error_description',
  ]

  let changed = false
  for (const key of authParams) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
      changed = true
    }
  }

  if (url.hash && (url.hash.includes('access_token') || url.hash.includes('error'))) {
    url.hash = ''
    changed = true
  }

  if (changed) {
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}`)
  }
}

/**
 * Completes magic-link / PKCE sign-in when the user returns from email.
 * Returns true when a callback was processed.
 */
export async function completeAuthCallback(supabase: SupabaseClient): Promise<{
  handled: boolean
  error: string | null
}> {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const tokenHash = params.get('token_hash')
  const type = params.get('type') as EmailOtpType | null

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    cleanAuthParamsFromUrl()
    return { handled: true, error: error?.message ?? null }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    cleanAuthParamsFromUrl()
    return { handled: true, error: error?.message ?? null }
  }

  if (window.location.hash.includes('access_token')) {
    const { error } = await supabase.auth.getSession()
    cleanAuthParamsFromUrl()
    return { handled: true, error: error?.message ?? null }
  }

  return { handled: false, error: null }
}

export function authRedirectUrl(): string {
  return `${window.location.origin}/`
}
