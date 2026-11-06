export interface GeoCoords {
  lat: number
  lng: number
  accuracy: number
}

/** Précision GPS minimale acceptée (cf. CLAUDE.md, anti-abus). */
export const MAX_ACCEPTABLE_ACCURACY_M = 1000

/**
 * Récupère la position une seule fois, à la demande (pas de suivi continu,
 * pour préserver la batterie — cf. contraintes terrain du CLAUDE.md).
 */
export function useGeolocation() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  function locateOnce(): Promise<GeoCoords> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        const message = 'Géolocalisation non disponible sur cet appareil.'
        error.value = message
        reject(new Error(message))
        return
      }

      loading.value = true
      error.value = null

      navigator.geolocation.getCurrentPosition(
        (position) => {
          loading.value = false
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        },
        (err) => {
          loading.value = false
          const message =
            err.code === err.PERMISSION_DENIED
              ? 'Localisation refusée.'
              : 'Impossible de récupérer la position.'
          error.value = message
          reject(new Error(message))
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
      )
    })
  }

  return { loading, error, locateOnce }
}
