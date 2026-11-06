import type { Zone } from './useZoneStatus'

export type ReportStatus = 'outage' | 'power'

export type ReportFailureReason =
  | 'cooldown'
  | 'out_of_area'
  | 'low_accuracy'
  | 'geo_denied'
  | 'error'

export interface ReportResult {
  ok: boolean
  zone?: Zone
  reason?: ReportFailureReason
}

const COOLDOWN_MS = 10 * 60 * 1000 // un signalement par zone / 10 min
const COOLDOWN_STORAGE_KEY = 'courant_cooldowns'

function readCooldowns(): Record<string, number> {
  if (!import.meta.client) return {}
  try {
    return JSON.parse(localStorage.getItem(COOLDOWN_STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeCooldown(zoneId: string) {
  if (!import.meta.client) return
  const cooldowns = readCooldowns()
  cooldowns[zoneId] = Date.now()
  localStorage.setItem(COOLDOWN_STORAGE_KEY, JSON.stringify(cooldowns))
}

function isOnCooldown(zoneId: string): boolean {
  const cooldowns = readCooldowns()
  const last = cooldowns[zoneId]
  return !!last && Date.now() - last < COOLDOWN_MS
}

export function useReports() {
  const supabase = useSupabaseClient()
  const { ZONES, recordDemoReport } = useZoneStatus()
  const { locateOnce } = useGeolocation()

  const submitting = ref(false)

  async function ensureAnonymousSession() {
    if (!supabase) return null
    const { data } = await supabase.auth.getSession()
    if (data.session) return data.session
    const { data: signInData, error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.error('[useReports] signInAnonymously', error)
      return null
    }
    return signInData.session
  }

  async function insertReport(zone: Zone, status: ReportStatus, lat: number, lng: number, accuracy: number) {
    if (!supabase) {
      recordDemoReport(zone.id, status)
      return
    }

    const session = await ensureAnonymousSession()
    const { error } = await supabase.from('reports').insert({
      user_id: session?.user.id,
      zone_id: zone.id,
      status,
      location: `SRID=4326;POINT(${lng} ${lat})`,
      accuracy,
    })
    if (error) throw error
  }

  /**
   * Signale l'état du courant pour la position actuelle de l'utilisateur.
   * Passer `zoneIdOverride` pour signaler manuellement une zone (fallback
   * quand la géolocalisation est refusée).
   */
  async function report(status: ReportStatus, zoneIdOverride?: string): Promise<ReportResult> {
    submitting.value = true
    try {
      let zone: Zone | undefined
      let lat: number, lng: number, accuracy: number

      if (zoneIdOverride) {
        zone = ZONES.find((z) => z.id === zoneIdOverride)
        if (!zone) return { ok: false, reason: 'error' }
        lat = zone.lat
        lng = zone.lng
        accuracy = 0
      } else {
        try {
          const coords = await locateOnce()
          lat = coords.lat
          lng = coords.lng
          accuracy = coords.accuracy
        } catch {
          return { ok: false, reason: 'geo_denied' }
        }

        if (accuracy > MAX_ACCEPTABLE_ACCURACY_M) {
          return { ok: false, reason: 'low_accuracy' }
        }
        if (!isWithinServiceArea(lat, lng)) {
          return { ok: false, reason: 'out_of_area' }
        }
        zone = findNearestZone(lat, lng)
      }

      if (isOnCooldown(zone.id)) {
        return { ok: false, zone, reason: 'cooldown' }
      }

      await insertReport(zone, status, lat, lng, accuracy)
      writeCooldown(zone.id)

      return { ok: true, zone }
    } catch (err) {
      console.error('[useReports] report', err)
      return { ok: false, reason: 'error' }
    } finally {
      submitting.value = false
    }
  }

  return { submitting, report }
}
