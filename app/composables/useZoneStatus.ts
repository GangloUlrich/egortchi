export interface Zone {
  id: string
  name: string
  lat: number
  lng: number
  /** Rayon approximatif de la zone, en mètres (pour le rendu sur la carte) */
  radius: number
}

export type ZoneState = 'power' | 'outage' | 'unknown'

export interface ZoneStatusEntry {
  zoneId: string
  status: ZoneState
  confidence: number
  reportsCount: number
  updatedAt: string | null
}

interface DemoReport {
  zoneId: string
  status: 'power' | 'outage'
  createdAt: number
}

/** Quartiers de l'axe Cotonou ↔ Abomey-Calavi (MVP : liste statique). */
export const ZONES: Zone[] = [
  { id: 'cotonou-centre', name: 'Cotonou Centre', lat: 6.3703, lng: 2.3912, radius: 900 },
  { id: 'fidjrosse', name: 'Fidjrossè', lat: 6.3528, lng: 2.3745, radius: 900 },
  { id: 'akpakpa', name: 'Akpakpa', lat: 6.365, lng: 2.445, radius: 1100 },
  { id: 'cadjehoun', name: 'Cadjèhoun', lat: 6.358, lng: 2.387, radius: 800 },
  { id: 'gbegamey', name: 'Gbégamey', lat: 6.38, lng: 2.395, radius: 800 },
  { id: 'agla', name: 'Agla', lat: 6.385, lng: 2.37, radius: 900 },
  { id: 'godomey', name: 'Godomey', lat: 6.385, lng: 2.335, radius: 1100 },
  { id: 'togba', name: 'Togba', lat: 6.405, lng: 2.33, radius: 1100 },
  { id: 'cococodji', name: 'Cococodji', lat: 6.4, lng: 2.34, radius: 1000 },
  { id: 'abomey-calavi-centre', name: 'Abomey-Calavi Centre', lat: 6.4486, lng: 2.3554, radius: 1100 },
  { id: 'akassato', name: 'Akassato', lat: 6.47, lng: 2.335, radius: 1100 },
  { id: 'hevie', name: 'Hévié', lat: 6.43, lng: 2.295, radius: 1200 },
]

/** Bbox approximative Cotonou / Abomey-Calavi, pour l'anti-abus (MVP). */
export const SERVICE_BBOX = { minLat: 6.3, maxLat: 6.5, minLng: 2.25, maxLng: 2.47 }

export function isWithinServiceArea(lat: number, lng: number): boolean {
  return lat >= SERVICE_BBOX.minLat && lat <= SERVICE_BBOX.maxLat && lng >= SERVICE_BBOX.minLng && lng <= SERVICE_BBOX.maxLng
}

function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * sinLng * sinLng
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function findNearestZone(lat: number, lng: number): Zone {
  let nearest: Zone = ZONES[0]!
  let best = Infinity
  for (const zone of ZONES) {
    const d = haversineMeters(lat, lng, zone.lat, zone.lng)
    if (d < best) {
      best = d
      nearest = zone
    }
  }
  return nearest
}

const REPORT_WINDOW_MS = 60 * 60 * 1000 // 60 min
const CONFIRM_MIN_REPORTS = 3
const CONFIRM_MAJORITY_SHARE = 0.75

/**
 * Recalcule l'état d'une zone à partir des signalements des 60 dernières
 * minutes, pondérés par fraîcheur. Réplique en JS, pour le mode démo sans
 * backend, la logique qui tourne normalement côté Postgres (cf. CLAUDE.md).
 */
function computeZoneStatus(zoneId: string, reports: DemoReport[], now: number): ZoneStatusEntry {
  const recent = reports.filter((r) => r.zoneId === zoneId && now - r.createdAt <= REPORT_WINDOW_MS)

  if (recent.length === 0) {
    return { zoneId, status: 'unknown', confidence: 0, reportsCount: 0, updatedAt: null }
  }

  let powerWeight = 0
  let outageWeight = 0
  let powerCount = 0
  let outageCount = 0
  let latest = 0

  for (const r of recent) {
    const ageMs = now - r.createdAt
    const freshness = Math.max(0, 1 - ageMs / REPORT_WINDOW_MS)
    if (r.status === 'power') {
      powerWeight += freshness
      powerCount++
    } else {
      outageWeight += freshness
      outageCount++
    }
    if (r.createdAt > latest) latest = r.createdAt
  }

  const totalWeight = powerWeight + outageWeight
  const winningStatus: 'power' | 'outage' = powerWeight >= outageWeight ? 'power' : 'outage'
  const winningCount = winningStatus === 'power' ? powerCount : outageCount
  const winningWeight = winningStatus === 'power' ? powerWeight : outageWeight
  const share = totalWeight > 0 ? winningWeight / totalWeight : 0

  const confirmed = winningCount >= CONFIRM_MIN_REPORTS || share >= CONFIRM_MAJORITY_SHARE

  return {
    zoneId,
    status: confirmed ? winningStatus : 'unknown',
    confidence: confirmed ? share : 0,
    reportsCount: recent.length,
    updatedAt: new Date(latest).toISOString(),
  }
}

let realtimeSubscribed = false

export function useZoneStatus() {
  const supabase = useSupabaseClient()

  const statusByZone = useState<Record<string, ZoneStatusEntry>>('zone-status-map', () => {
    const initial: Record<string, ZoneStatusEntry> = {}
    for (const zone of ZONES) {
      initial[zone.id] = { zoneId: zone.id, status: 'unknown', confidence: 0, reportsCount: 0, updatedAt: null }
    }
    return initial
  })

  // Journal des signalements en mémoire, utilisé uniquement en mode démo
  // (pas de Supabase configuré). Persisté en localStorage pour survivre au reload.
  const demoReports = useState<DemoReport[]>('demo-reports-log', () => {
    if (import.meta.client) {
      try {
        const raw = localStorage.getItem('courant_demo_reports')
        if (raw) return JSON.parse(raw) as DemoReport[]
      } catch {
        // localStorage indisponible ou corrompu : on repart d'un journal vide
      }
    }
    return []
  })

  function persistDemoReports() {
    if (import.meta.client) {
      localStorage.setItem('courant_demo_reports', JSON.stringify(demoReports.value))
    }
  }

  function recomputeAll() {
    const now = Date.now()
    const next: Record<string, ZoneStatusEntry> = {}
    for (const zone of ZONES) {
      next[zone.id] = computeZoneStatus(zone.id, demoReports.value, now)
    }
    statusByZone.value = next
  }

  /** Ajoute un signalement local (mode démo) et recalcule l'état des zones. */
  function recordDemoReport(zoneId: string, status: 'power' | 'outage') {
    demoReports.value = [...demoReports.value, { zoneId, status, createdAt: Date.now() }]
    persistDemoReports()
    recomputeAll()
  }

  async function fetchInitialStatus() {
    if (!supabase) {
      recomputeAll()
      return
    }
    const { data, error } = await supabase.from('zone_status').select('*')
    if (error) {
      console.error('[useZoneStatus] fetchInitialStatus', error)
      return
    }
    const next = { ...statusByZone.value }
    for (const row of data ?? []) {
      next[row.zone_id] = {
        zoneId: row.zone_id,
        status: row.status,
        confidence: row.confidence ?? 0,
        reportsCount: row.reports_count ?? 0,
        updatedAt: row.updated_at,
      }
    }
    statusByZone.value = next
  }

  function subscribeRealtime() {
    if (!supabase || realtimeSubscribed) return
    realtimeSubscribed = true

    supabase
      .channel('zone_status_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'zone_status' },
        (payload) => {
          const row = payload.new as Record<string, unknown>
          if (!row) return
          statusByZone.value = {
            ...statusByZone.value,
            [row.zone_id as string]: {
              zoneId: row.zone_id as string,
              status: row.status as ZoneState,
              confidence: (row.confidence as number) ?? 0,
              reportsCount: (row.reports_count as number) ?? 0,
              updatedAt: row.updated_at as string,
            },
          }
        }
      )
      .subscribe()
  }

  function init() {
    fetchInitialStatus()
    subscribeRealtime()

    // En mode démo, on ré-évalue périodiquement pour faire "vieillir" les
    // signalements (une zone sans nouveau signalement repasse en inconnue).
    if (!supabase && import.meta.client) {
      recomputeAll()
      const interval = setInterval(recomputeAll, 30_000)
      onScopeDispose(() => clearInterval(interval))
    }
  }

  const isDemoMode = computed(() => supabase === null)

  function getStatus(zoneId: string): ZoneStatusEntry {
    return statusByZone.value[zoneId] ?? { zoneId, status: 'unknown', confidence: 0, reportsCount: 0, updatedAt: null }
  }

  return { ZONES, statusByZone, isDemoMode, init, recordDemoReport, getStatus }
}
