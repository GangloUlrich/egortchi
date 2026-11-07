import { QUARTIERS, type Zone } from './useZoneStatus'

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

// Un signalement par quartier (ou secteur si géolocalisé, faute de quartier
// connu) ET par statut, toutes les 10 min : signaler "coupure" n'empêche pas
// de signaler "courant est là" juste après dans le même quartier.
const COOLDOWN_MS = 10 * 60 * 1000
const COOLDOWN_STORAGE_KEY = 'courant_cooldowns'

function cooldownKey(id: string, status: ReportStatus) {
  return `${id}::${status}`
}

function readCooldowns(): Record<string, number> {
  if (!import.meta.client) return {}
  try {
    return JSON.parse(localStorage.getItem(COOLDOWN_STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeCooldown(id: string, status: ReportStatus) {
  if (!import.meta.client) return
  const cooldowns = readCooldowns()
  cooldowns[cooldownKey(id, status)] = Date.now()
  localStorage.setItem(COOLDOWN_STORAGE_KEY, JSON.stringify(cooldowns))
}

function isOnCooldown(id: string, status: ReportStatus): boolean {
  const cooldowns = readCooldowns()
  const last = cooldowns[cooldownKey(id, status)]
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

  async function insertReport(
    zone: Zone,
    status: ReportStatus,
    lat: number,
    lng: number,
    accuracy: number,
    quartierId: string | null
  ) {
    if (!supabase) {
      // L'affichage (carte) reste à l'échelle de l'arrondissement/secteur.
      recordDemoReport(zone.id, status, quartierId)
      return
    }

    const session = await ensureAnonymousSession()
    const { error } = await supabase.from('reports').insert({
      user_id: session?.user.id,
      zone_id: zone.id,
      quartier_id: quartierId,
      status,
      location: `SRID=4326;POINT(${lng} ${lat})`,
      accuracy,
    })
    if (error) throw error
  }

  /**
   * Signale `status` pour une zone déjà connue (pas de géolocalisation).
   * `quartierId`, quand connu, identifie précisément le quartier signalé
   * (anti-doublon / cooldown propres à ce quartier) ; l'affichage carte reste
   * rattaché à son secteur/arrondissement (`zone`).
   */
  async function reportToZone(zone: Zone, status: ReportStatus, quartierId: string | null = null): Promise<ReportResult> {
    const id = quartierId ?? zone.id
    if (isOnCooldown(id, status)) {
      return { ok: false, zone, reason: 'cooldown' }
    }
    try {
      await insertReport(zone, status, zone.lat, zone.lng, 0, quartierId)
      writeCooldown(id, status)
      return { ok: true, zone }
    } catch (err) {
      console.error('[useReports] reportToZone', err)
      return { ok: false, zone, reason: 'error' }
    }
  }

  /** Signale l'état du courant pour la position actuelle de l'utilisateur (secteur le plus proche). */
  async function report(status: ReportStatus): Promise<ReportResult> {
    submitting.value = true
    try {
      let lat: number, lng: number, accuracy: number
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

      return await reportToZone(findNearestZone(lat, lng), status)
    } catch (err) {
      console.error('[useReports] report', err)
      return { ok: false, reason: 'error' }
    } finally {
      submitting.value = false
    }
  }

  /**
   * Signale `status` pour un ou plusieurs quartiers choisis manuellement (un
   * utilisateur peut signaler une coupure - ou un retour de courant - dans
   * plusieurs quartiers). Chaque quartier reste soumis à son propre cooldown,
   * même quand plusieurs quartiers partagent le même secteur.
   */
  async function reportZones(status: ReportStatus, quartierIds: string[]): Promise<ReportResult[]> {
    submitting.value = true
    try {
      const uniqueIds = [...new Set(quartierIds)]
      const results: ReportResult[] = []
      for (const quartierId of uniqueIds) {
        const quartier = QUARTIERS.find((q) => q.id === quartierId)
        const zone = quartier ? ZONES.find((z) => z.id === quartier.secteurId) : undefined
        results.push(zone ? await reportToZone(zone, status, quartierId) : { ok: false, reason: 'error' })
      }
      return results
    } finally {
      submitting.value = false
    }
  }

  return { submitting, report, reportZones, reportToZone }
}
