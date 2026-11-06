function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64Safe)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

/** Gère l'abonnement push et les zones suivies par l'utilisateur (notifications ciblées, jamais globales). */
export function usePushSubscription() {
  const supabase = useSupabaseClient()
  const config = useRuntimeConfig()

  const permission = ref<NotificationPermission>(
    import.meta.client && 'Notification' in window ? Notification.permission : 'default'
  )
  const subscribedZoneIds = useState<string[]>('subscribed-zone-ids', () => {
    if (import.meta.client) {
      try {
        return JSON.parse(localStorage.getItem('courant_subscribed_zones') ?? '[]')
      } catch {
        return []
      }
    }
    return []
  })

  function persist() {
    if (import.meta.client) {
      localStorage.setItem('courant_subscribed_zones', JSON.stringify(subscribedZoneIds.value))
    }
  }

  async function requestPermissionAndSubscribe(): Promise<boolean> {
    if (!import.meta.client || !('Notification' in window) || !('serviceWorker' in navigator)) {
      return false
    }

    const result = await Notification.requestPermission()
    permission.value = result
    if (result !== 'granted') return false

    if (!config.public.vapidPublicKey || !supabase) {
      // Pas de VAPID / backend configuré : permission acquise, mais pas
      // d'abonnement push réel possible en mode démo.
      return true
    }

    const registration = await navigator.serviceWorker.ready
    const pushSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.public.vapidPublicKey) as BufferSource,
    })

    const { data } = await supabase.auth.getSession()
    await supabase.from('subscriptions').insert({
      user_id: data.session?.user.id,
      push_endpoint: pushSubscription.toJSON(),
    })

    return true
  }

  function subscribeToZone(zoneId: string) {
    if (!subscribedZoneIds.value.includes(zoneId)) {
      subscribedZoneIds.value = [...subscribedZoneIds.value, zoneId]
      persist()
    }
  }

  function unsubscribeFromZone(zoneId: string) {
    subscribedZoneIds.value = subscribedZoneIds.value.filter((id) => id !== zoneId)
    persist()
  }

  function isSubscribed(zoneId: string): boolean {
    return subscribedZoneIds.value.includes(zoneId)
  }

  return {
    permission,
    subscribedZoneIds,
    requestPermissionAndSubscribe,
    subscribeToZone,
    unsubscribeFromZone,
    isSubscribed,
  }
}
