import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null | undefined

/**
 * Retourne le client Supabase, ou `null` si NUXT_PUBLIC_SUPABASE_URL /
 * NUXT_PUBLIC_SUPABASE_ANON_KEY ne sont pas renseignées. Dans ce cas,
 * les composables (useReports, useZoneStatus, usePushSubscription)
 * basculent automatiquement sur un mode démo en mémoire, pour pouvoir
 * développer et tester l'app sans backend.
 */
export function useSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) return client

  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl
  const anonKey = config.public.supabaseAnonKey

  if (!url || !anonKey) {
    client = null
    return client
  }

  client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  })
  return client
}
